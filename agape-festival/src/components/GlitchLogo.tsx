"use client";

/* eslint-disable react-hooks/immutability -- Three.js textures are mutable GPU resources, updated in the render loop. */

import { Component, Suspense, useRef, useMemo, useEffect, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Restored from cf34e57 (February 2026), with static fallback and reduced-motion support.
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
// Below this the displacement is invisible (≤0.0002% UV shift) — the field is
// zeroed and the canvas stops rendering until the next touch.
const REST_EPSILON = 1e-3;
// Touch and pen can also scroll the page (the logo is touch-action: pan-y), so their strokes paint only once
// they have travelled past the browsers' scroll slop (Android ~8dp, iOS ~10pt) without a pointercancel. A
// vertical swipe that starts on the logo is cancelled first and leaves it untouched.
const TOUCH_SLOP = 16;

// ---------- Inner Mesh (lives inside Canvas) ----------
function GlitchLogoMesh({
  imageSrc,
  containerRef,
  onReady,
}: {
  imageSrc: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onReady: () => void;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(imageSrc);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; onReady(); }, [texture, onReady]);

  // Mutable mouse state — updated from window events, not R3F raycaster
  const mouse = useRef({
    x: -1, y: -1,       // current UV position (-1 = outside)
    prevX: -1, prevY: -1,
    vX: 0, vY: 0,
    inside: false,
  });

  const tap = useRef<{ x: number; y: number } | null>(null);

  // Unified mouse, pen, and touch input. Capture swipes started on the logo.
  // Mouse: paints on every move, a press adds an impulse at once. Touch/pen: a stroke is held back until the
  // browser has had its say. Under pan-y it scrolls (and fires pointercancel) only for a gesture that starts
  // mostly vertical, and the move that crosses its slop still arrives before the cancel. So a stroke past
  // TOUCH_SLOP that is mostly horizontal paints at once, a mostly vertical one only if another move follows
  // uncancelled; either way it paints its whole path from where the finger went down. A tap adds its impulse
  // on release.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let activePointer: number | null = null;
    // Client position of a touch/pen press that hasn't started painting yet (null once it paints, or for mice).
    let held: { x: number; y: number; vertical: boolean } | null = null;
    // Off screen, mouse moves skip the rect read (a forced layout) entirely.
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(element);
    const toUv = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };
    };
    const updatePointer = (event: PointerEvent) => {
      const { x, y, inside } = toUv(event.clientX, event.clientY);
      const current = mouse.current;
      if (inside) {
        current.prevX = current.inside ? current.x : x;
        current.prevY = current.inside ? current.y : y;
        current.x = x;
        current.y = y;
        current.vX = x - current.prevX;
        current.vY = y - current.prevY;
      }
      current.inside = inside;
      if (inside) invalidate();
      return { x, y, inside };
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      activePointer = event.pointerId;
      if (event.pointerType === "mouse") {
        const point = updatePointer(event);
        if (point.inside) tap.current = point;
      } else {
        held = { x: event.clientX, y: event.clientY, vertical: false };
        mouse.current.inside = false;
      }
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      if (!onScreen && activePointer === null) {
        mouse.current.inside = false;
        return;
      }
      if (event.pointerType !== "mouse" && event.pointerId !== activePointer) return;
      if (held && event.pointerId === activePointer) {
        const dx = event.clientX - held.x;
        const dy = event.clientY - held.y;
        if (Math.hypot(dx, dy) < TOUCH_SLOP) return;
        if (Math.abs(dy) >= Math.abs(dx) && !held.vertical) {
          held.vertical = true; // a scroll's pointercancel would come next
          return;
        }
        // Not a scroll: start the stroke where the finger went down, so this move paints the whole way from there.
        const from = toUv(held.x, held.y);
        held = null;
        Object.assign(mouse.current, { x: from.x, y: from.y, inside: from.inside });
      }
      updatePointer(event);
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      // A touch/pen tap (lifted inside the slop, never cancelled): one impulse where it landed.
      if (held && event.type === "pointerup") {
        const point = toUv(held.x, held.y);
        if (point.inside) {
          tap.current = point;
          invalidate();
        }
      }
      held = null;
      activePointer = null;
      mouse.current.inside = false;
    };
    element.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      io.disconnect();
      element.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [containerRef, invalidate]);

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
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => () => dataTexture.dispose(), [dataTexture]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDataTexture: { value: dataTexture },
    }),
    [texture, dataTexture]
  );

  // Per-frame: paint mouse velocity into DataTexture + decay
  // Interpolates between prev and current position so fast swipes leave a trail
  // The canvas uses frameloop="demand": this only runs while a touch is
  // painting or the trail is still decaying, then the loop goes idle.
  useFrame((state, delta) => {
    const data = dataTexture.image.data as Float32Array;
    const m = mouse.current;

    // Interpolation: split fast movements into small steps
    const dx = m.x - m.prevX;
    const dy = m.y - m.prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.min(32, Math.max(1, Math.floor(dist / 0.01))); // ~1 step per 1% of UV space

    // Painting only applies while the pointer is inside the logo.
    for (let s = 0; m.inside && s < steps; s++) {
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

    // A quick tap adds one impulse even if the finger lifts before the next frame.
    const impulse = tap.current;
    tap.current = null;
    if (impulse) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const distance = Math.hypot(x / GRID_SIZE - impulse.x, y / GRID_SIZE - impulse.y);
          const influence = Math.max(0, 1 - distance / RADIUS);
          const index = 4 * (x + GRID_SIZE * y);
          data[index] += influence * 1.8;
          data[index + 1] += influence * .7;
        }
      }
    }

    // Decay all values toward zero
    const decay = Math.pow(DECAY, Math.min(delta, .05) * 60);
    let peak = 0;
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const idx = i * 4;
      data[idx] *= decay;
      data[idx + 1] *= decay;
      peak = Math.max(peak, Math.abs(data[idx]), Math.abs(data[idx + 1]));
    }
    const settled = peak < REST_EPSILON && !m.inside;
    if (settled) data.fill(0);

    // Dampen velocity when mouse is stationary
    m.vX *= Math.pow(.9, Math.min(delta, .05) * 60);
    m.vY *= Math.pow(.9, Math.min(delta, .05) * 60);
    m.prevX = m.x;
    m.prevY = m.y;

    dataTexture.needsUpdate = true;
    if (!settled) state.invalidate();
  });

  // Contain the full image on both axes, including during viewport changes.
  const img = texture.image as HTMLImageElement | undefined;
  const imgAspect =
    img && img.width
      ? img.width / img.height
      : 1;

  const { viewport } = useThree();
  const planeWidth = Math.min(viewport.width, viewport.height * imgAspect);
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

// Always leave the original image in place if WebGL cannot render.
class LogoBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/**
 * `overlay`: the caller keeps its own static image in place (no <img> here, so nothing is swapped or re-decoded)
 * and hides it when `onShow` fires, once the canvas has painted the logo.
 */
export default function GlitchLogo({ imageSrc, overlay = false, onShow }: { imageSrc: string; overlay?: boolean; onShow?: (shown: boolean) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Drawing-surface density cap: 1.5x as deployed, 2x on touch screens (2-3x displays, where a 1.5x surface reads
  // visibly softer than the static image it replaces). Still a small canvas, and it renders only on demand.
  // (Client-only component: loaded with next/dynamic, ssr: false.)
  const [maxDpr] = useState(() => (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 2 : 1.5));
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const show = enabled && ready && !failed;
  // Report only once the drawing surface has its final size (R3F mounts it at a default 300x150 and measures a
  // frame or more later) and has then had two frames to paint, so the caller never swaps over a blank or a
  // wrongly sized logo.
  useEffect(() => {
    if (!onShow) return;
    if (!show) { onShow(false); return; }
    let raf = 0;
    let settled = 0;
    const check = () => {
      const box = containerRef.current?.getBoundingClientRect();
      const surface = containerRef.current?.querySelector("canvas")?.getBoundingClientRect();
      const sized = !!box && !!surface && Math.abs(box.width - surface.width) < 1 && Math.abs(box.height - surface.height) < 1;
      settled = sized ? settled + 1 : 0;
      if (settled >= 3) onShow(true);
      else raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [show, onShow]);
  return (
    <div ref={containerRef} className={`glitch-logo ${overlay ? "glitch-logo-overlay" : ""} ${enabled ? "glitch-logo-interactive" : ""} ${show ? "glitch-logo-ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!overlay && <img src={imageSrc} alt="ÄGAPĒ Festival" width={586} height={310} draggable={false} fetchPriority="high" />}
      {enabled && !failed && <div className="glitch-logo-canvas" aria-hidden="true">
        <LogoBoundary onFailure={() => setFailed(true)}>
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, maxDpr]} frameloop="demand"
            // Ignore ancestor scale/glitch transforms when sizing the drawing surface. No scroll tracking:
            // R3F's default re-measures (and re-renders the scene) on every scroll, but nothing here uses
            // the canvas's page offset (pointer input is computed from the container's rect).
            resize={{ offsetSize: true, scroll: false }}
            style={{ width: "100%", height: "100%" }}
            gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
            fallback={null}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.domElement.addEventListener("webglcontextlost", () => setFailed(true), { once: true });
            }}>
            <Suspense fallback={null}>
              <GlitchLogoMesh imageSrc={imageSrc} containerRef={containerRef} onReady={() => setReady(true)} />
            </Suspense>
          </Canvas>
        </LogoBoundary>
      </div>}
    </div>
  );
}
