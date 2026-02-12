"use client";

import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// ---------- GLSL Shaders ----------

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform sampler2D uDataTexture;

  varying vec2 vUv;

  void main() {
    vec4 offset = texture2D(uDataTexture, vUv);

    // Displace UVs based on mouse trail
    vec2 displacedUV = vUv - 0.02 * offset.rg;

    // RGB chromatic aberration for glitch feel
    float strength = length(offset.rg);
    strength = clamp(strength, 0.0, 2.0);

    vec2 shift = offset.rg * 0.003;

    float r = texture2D(uTexture, displacedUV + shift * (1.0 + strength * 0.5)).r;
    float g = texture2D(uTexture, displacedUV + shift * (1.0 + strength * 1.5)).g;
    float b = texture2D(uTexture, displacedUV + shift * (1.0 + strength * 2.5)).b;
    float a = texture2D(uTexture, displacedUV).a;

    gl_FragColor = vec4(r, g, b, a);
  }
`;

// ---------- Constants ----------
const GRID_SIZE = 64;
const DECAY = 0.96;
const RADIUS = 0.15;
const STRENGTH = 1.0;

// ---------- Inner Mesh (lives inside Canvas) ----------
function GlitchLogoMesh({
  imageSrc,
  containerRef,
}: {
  imageSrc: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(imageSrc);

  texture.colorSpace = THREE.SRGBColorSpace;

  // Mutable mouse state — updated from window events, not R3F raycaster
  const mouse = useRef({
    x: -1, y: -1,       // current UV position (-1 = outside)
    prevX: -1, prevY: -1,
    vX: 0, vY: 0,
    inside: false,
  });

  // Track mouse at the window level — never misses fast swipes
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Convert screen coords to 0-1 UV space relative to the canvas
      const uvX = (e.clientX - rect.left) / rect.width;
      const uvY = 1.0 - (e.clientY - rect.top) / rect.height; // flip Y

      const inside = uvX >= 0 && uvX <= 1 && uvY >= 0 && uvY <= 1;

      if (inside) {
        mouse.current.prevX = mouse.current.inside ? mouse.current.x : uvX;
        mouse.current.prevY = mouse.current.inside ? mouse.current.y : uvY;
        mouse.current.x = uvX;
        mouse.current.y = uvY;
        mouse.current.vX = mouse.current.x - mouse.current.prevX;
        mouse.current.vY = mouse.current.y - mouse.current.prevY;
      }
      mouse.current.inside = inside;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [containerRef]);

  // Create the DataTexture (displacement map)
  const dataTexture = useMemo(() => {
    const data = new Float32Array(4 * GRID_SIZE * GRID_SIZE);
    const tex = new THREE.DataTexture(
      data,
      GRID_SIZE,
      GRID_SIZE,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    tex.needsUpdate = true;
    return tex;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDataTexture: { value: dataTexture },
    }),
    [texture, dataTexture]
  );

  // Per-frame: paint mouse velocity into DataTexture + decay
  // Interpolates between prev and current position so fast swipes leave a trail
  useFrame(() => {
    const data = dataTexture.image.data as Float32Array;
    const m = mouse.current;

    // Interpolation: split fast movements into small steps
    const dx = m.x - m.prevX;
    const dy = m.y - m.prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / 0.01)); // ~1 step per 1% of UV space

    for (let s = 0; s < steps; s++) {
      const t = steps === 1 ? 1 : s / (steps - 1);
      const mx = m.prevX + dx * t;
      const my = m.prevY + dy * t;
      const svX = m.vX / steps;
      const svY = m.vY / steps;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const index = 4 * (i + GRID_SIZE * j);
          const gridX = i / GRID_SIZE;
          const gridY = j / GRID_SIZE;

          const ddx = gridX - mx;
          const ddy = gridY - my;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);

          if (d < RADIUS && m.inside) {
            const influence = 1.0 - d / RADIUS;
            data[index] += STRENGTH * svX * influence * 100;
            data[index + 1] += STRENGTH * svY * influence * 100;
          }
        }
      }
    }

    // Decay all values toward zero
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const idx = i * 4;
      data[idx] *= DECAY;
      data[idx + 1] *= DECAY;
    }

    // Dampen velocity when mouse is stationary
    m.vX *= 0.9;
    m.vY *= 0.9;

    dataTexture.needsUpdate = true;
  });

  // Aspect-correct plane — fill the viewport
  const img = texture.image as HTMLImageElement | undefined;
  const imgAspect =
    img && img.width
      ? img.width / img.height
      : 1;

  const { viewport } = useThree();
  const planeWidth = viewport.width;
  const planeHeight = planeWidth / imgAspect;

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// ---------- Outer Wrapper ----------
export default function GlitchLogo({
  imageSrc,
  className,
}: {
  imageSrc: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <GlitchLogoMesh imageSrc={imageSrc} containerRef={containerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
