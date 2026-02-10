"use client";

// ============================================================
// ÄGAPE FESTIVAL 2026 — V2: CHROME CATHEDRAL (REVISED)
// Animated flyer as hero, 3D wireframe parallax behind sections,
// event photos woven throughout, rich scroll animations.
// ============================================================

import {
  Suspense,
  useState,
  useRef,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Orbitron, Outfit } from "next/font/google";
import Image from "next/image";
import * as THREE from "three";
import {
  FESTIVAL,
  COPY,
  SOCIALS,
  PARTNERS,
  getStages,
  PHOTOS,
  VIDEOS,
  LOGOS,
  BASE_PATH,
  type Artist,
} from "@/data/festival";

// ---- Fonts ----
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

// ---- Styles ----
const CHROME_STYLES = `
  html { scroll-behavior: smooth; }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes borderFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139,0,0,0.15), 0 0 60px rgba(139,0,0,0.05); }
    50% { box-shadow: 0 0 30px rgba(139,0,0,0.3), 0 0 80px rgba(139,0,0,0.1); }
  }

  @keyframes shimmerSlide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .chrome-text {
    background: linear-gradient(90deg, #444, #aaa, #fff, #aaa, #444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 6s linear infinite;
  }

  .chrome-text-slow {
    background: linear-gradient(90deg, #333, #888, #ddd, #888, #333);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 10s linear infinite;
  }
`;

// ---- Loading Skeleton ----
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 80%, transparent 100%)",
          animation: "shimmerSlide 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function VideoLoader({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[1]">
      <div className="relative w-10 h-10 mb-4">
        <div
          className="absolute inset-0 rounded-full border border-neutral-700"
          style={{
            borderTopColor: "rgba(255,255,255,0.5)",
            animation: "spin 1.2s linear infinite",
          }}
        />
        <div
          className="absolute inset-[6px] rounded-full border border-neutral-800"
          style={{
            borderBottomColor: "rgba(255,255,255,0.2)",
            animation: "spin 2s linear infinite reverse",
          }}
        />
      </div>
      {label && (
        <span
          className={`text-[9px] tracking-[0.4em] text-neutral-600 uppercase`}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ---- Animation Variants ----
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ---- Nav Links ----
const NAV_LINKS = [
  { label: "ABOUT", href: "#about" },
  { label: "LINEUP", href: "#artists" },
  { label: "TICKETS", href: FESTIVAL.ticketUrl, external: true },
  { label: "MERCH", href: "#merch" },
];

// ============================================================
// THREE.JS SCENE (used as parallax background behind sections)
// ============================================================

function WireframeTorus() {
  const outerGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!spinGroup.current || !outerGroup.current) return;
    spinGroup.current.rotation.y += delta * 0.05;
    spinGroup.current.rotation.x += delta * 0.025;
    outerGroup.current.rotation.x +=
      (state.pointer.y * 0.08 - outerGroup.current.rotation.x) * 0.02;
    outerGroup.current.rotation.y +=
      (state.pointer.x * 0.08 - outerGroup.current.rotation.y) * 0.02;
  });

  return (
    <group ref={outerGroup}>
      <group ref={spinGroup}>
        <mesh>
          <torusKnotGeometry args={[2.5, 0.5, 300, 40]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.18}
          />
        </mesh>
        <mesh scale={1.04}>
          <torusKnotGeometry args={[2.5, 0.5, 150, 20]} />
          <meshBasicMaterial
            color="#888888"
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      </group>
    </group>
  );
}

function ChromeParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        speed: 0.08 + Math.random() * 0.25,
        scale: 0.008 + Math.random() * 0.025,
        offset: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.4,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.4,
        p.z + Math.sin(t * p.speed * 0.4 + p.offset) * 0.3
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial metalness={0.9} roughness={0.08} color="#dddddd" />
    </instancedMesh>
  );
}

function ParallaxScene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 6, 22]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 8, 10]} intensity={2} color="#ffffff" />
      <pointLight position={[-8, -6, -10]} intensity={0.8} color="#6688cc" />
      <pointLight position={[3, -7, 8]} intensity={0.5} color="#cc2222" />
      <WireframeTorus />
      <ChromeParticles />
    </>
  );
}

// ============================================================
// UI COMPONENTS
// ============================================================

function Reveal({
  children,
  className = "",
  id,
  variants: customVariants,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  variants?: typeof stagger;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants || stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.div style={{ y: smoothY }} className="absolute inset-[-20%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </motion.div>
    </div>
  );
}

function MetallicDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-[1px] my-12 origin-left"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #444 20%, #aaa 50%, #444 80%, transparent 100%)",
      }}
    />
  );
}

function WireframeIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-14 opacity-[0.12]"
      stroke="#999"
      fill="none"
      strokeWidth="0.8"
    >
      <polygon points="50,8 92,30 92,70 50,92 8,70 8,30" />
      <line x1="50" y1="8" x2="50" y2="92" />
      <line x1="8" y1="30" x2="92" y2="70" />
      <line x1="92" y1="30" x2="8" y2="70" />
    </svg>
  );
}

function ChromeBorder({
  children,
  className = "",
  active = false,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`p-[1px] transition-all duration-500 ${className}`}
      style={{
        background: active
          ? "linear-gradient(135deg, #555, #aaa, #555)"
          : "linear-gradient(135deg, #1a1a1a, #333, #1a1a1a)",
      }}
    >
      {children}
    </div>
  );
}

function ArtistCard({ artist, index }: { artist: Artist; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer group"
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      <ChromeBorder active={expanded}>
        <div className="bg-[#060606]">
          <div className="aspect-[4/3] flex items-center justify-center bg-[#090909] relative overflow-hidden">
            {artist.imageUrl ? (
              <>
                {!imgLoaded && <Shimmer className="absolute inset-0" />}
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className={`object-cover transition-all duration-700 ease-out ${
                    imgLoaded ? "" : "opacity-0"
                  } ${
                    expanded
                      ? "grayscale-0 opacity-100 scale-105"
                      : "grayscale opacity-60 group-hover:opacity-80 group-hover:grayscale-[50%]"
                  }`}
                  onLoad={() => setImgLoaded(true)}
                />
              </>
            ) : (
              <WireframeIcon />
            )}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              style={{
                boxShadow:
                  "inset -3px 0 20px rgba(139,0,0,0.12), inset 3px 0 20px rgba(50,60,180,0.08)",
              }}
            />
            {/* Subtle red overlay when expanded */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                expanded ? "opacity-[0.06]" : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, transparent 40%, rgba(139,0,0,0.4) 100%)",
              }}
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <h3
              className={`${orbitron.className} text-[11px] sm:text-xs tracking-[0.12em] transition-colors duration-300 ${
                expanded ? "text-white" : "text-neutral-300 group-hover:text-white"
              }`}
            >
              {artist.name}
            </h3>
            {artist.note && (
              <span
                className={`${orbitron.className} text-[9px] tracking-wider text-[#8b0000] shrink-0`}
              >
                {artist.note}
              </span>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div
                    className="h-[1px] mb-3"
                    style={{
                      background: "linear-gradient(90deg, #333, transparent)",
                    }}
                  />
                  <p
                    className={`${outfit.className} text-[11px] leading-relaxed text-neutral-500`}
                  >
                    {artist.bio}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ChromeBorder>
    </motion.div>
  );
}

// About section photo with scroll-locked zoom
function AboutPhoto() {
  const ref = useRef(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="order-1 lg:order-2 aspect-[3/4] rounded-[2px] overflow-hidden relative"
    >
      {!photoLoaded && <Shimmer className="absolute inset-0 z-[1]" />}
      <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
        <Image
          src={PHOTOS[6]}
          alt="ÄGAPE event"
          fill
          className={`object-cover transition-opacity duration-700 ${photoLoaded ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onLoad={() => setPhotoLoaded(true)}
        />
      </motion.div>
      <div
        className="absolute inset-0 pointer-events-none rounded-[2px]"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      />
    </motion.div>
  );
}

// Hero video with loading state
function HeroVideo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, delay: 4.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute inset-0"
    >
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="hero-loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <VideoLoader label="Loading" />
          </motion.div>
        )}
      </AnimatePresence>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ filter: "brightness(0.5) contrast(1.1)" }}
        onCanPlayThrough={() => setLoaded(true)}
        onPlaying={() => setLoaded(true)}
      >
        <source src={VIDEOS.flyerAnimated.webm} type="video/webm" />
        <source src={VIDEOS.flyerAnimated.mp4} type="video/mp4" />
      </video>
    </motion.div>
  );
}

// Parallax flyer image component
function FlyerParallax() {
  const ref = useRef(null);
  const [flyerLoaded, setFlyerLoaded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <Reveal>
      <motion.div
        ref={ref}
        variants={fadeInUp}
        className="relative group max-w-md overflow-hidden"
      >
        <div
          className="absolute -inset-[1px] rounded-[2px] opacity-30 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: "linear-gradient(135deg, #333, #888, #333)",
          }}
        />
        <div className="relative bg-black p-1 overflow-hidden">
          {!flyerLoaded && <Shimmer className="w-full aspect-[1000/1778]" />}
          <motion.div style={{ y: smoothY }}>
            <Image
              src={`${BASE_PATH}/assets/1000x1778.avif`}
              alt="ÄGAPE FESTIVAL 2026 — Full Lineup"
              width={600}
              height={1067}
              className={`w-full h-auto scale-110 transition-opacity duration-700 ${flyerLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setFlyerLoaded(true)}
            />
          </motion.div>
        </div>
      </motion.div>
    </Reveal>
  );
}

// Parallax video break component
function ParallaxVideoBreak() {
  const ref = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);
  const smoothVideoY = useSpring(videoY, { stiffness: 80, damping: 30 });
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
      <AnimatePresence>
        {!videoLoaded && (
          <motion.div
            key="break-loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[2]"
          >
            <Shimmer className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ y: smoothVideoY }}
        className="absolute left-0 right-0 h-[160%] -top-[30%]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ filter: "grayscale(1) contrast(1.15) brightness(0.4)" }}
          onCanPlayThrough={() => setVideoLoaded(true)}
          onPlaying={() => setVideoLoaded(true)}
        >
          <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
          <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      <div ref={inViewRef} className="absolute inset-0 flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.15em] chrome-text text-center px-6`}
        >
          TWO DAYS.<br />FOUR STAGES.
        </motion.p>
      </div>
    </div>
  );
}

// Marquee component
function Marquee({ children, speed = 30 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div
        className="inline-flex"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function ChromeCathedral() {
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Parallax for 3D canvas
  const canvasContainerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.8, 1, 0.7, 0.5]);

  useEffect(() => {
    setIsClient(true);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stages = getStages();

  return (
    <div className={`${outfit.className} min-h-screen bg-black text-white relative`}>
      <style dangerouslySetInnerHTML={{ __html: CHROME_STYLES }} />

      {/* ========== FIXED 3D PARALLAX BACKGROUND ========== */}
      {isClient && (
        <motion.div
          ref={canvasContainerRef}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ y: canvasY, opacity: canvasOpacity }}
        >
          <Suspense fallback={null}>
            <Canvas camera={{ position: [0, 0, 7], fov: 55 }} dpr={[1, 1.5]}>
              <ParallaxScene />
            </Canvas>
          </Suspense>
        </motion.div>
      )}

      {/* ========== NAVIGATION ========== */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 5.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.04]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <Image
              src={LOGOS.agapeIcon}
              alt=""
              width={18}
              height={18}
              className="opacity-50 group-hover:opacity-100 transition-opacity duration-300 invert"
            />
            <span
              className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-400 group-hover:text-white transition-colors duration-300`}
            >
              ÄGAPE
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`${orbitron.className} text-[10px] tracking-[0.25em] text-neutral-500 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gradient-to-r after:from-neutral-500 after:to-transparent hover:after:w-full after:transition-all after:duration-300`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[3px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[3px]" : ""
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.04]"
            >
              <div className="flex flex-col items-center gap-7 py-10">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={() => setMenuOpen(false)}
                    className={`${orbitron.className} text-xs tracking-[0.3em] text-neutral-400 hover:text-white transition-colors`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* All content above the 3D background */}
      <div className="relative z-10">

        {/* ========== HERO — CINEMATIC INTRO ========== */}
        <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">

          {/* Background Video — fades in after intro sequence */}
          <HeroVideo />

          {/* Dark overlays */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4.8 }}
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black pointer-events-none"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4.8 }}
            className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none"
          />

          {/* Subtle grid that fades in early */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          {/* Scanline */}
          <div
            className="absolute inset-0 pointer-events-none z-[3]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
            }}
          />

          {/* === INTRO ANIMATION SEQUENCE === */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[2] px-6">

            {/* 1. Vertical line descends from top */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 140 }}
              transition={{ duration: 1.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px]"
              style={{
                background: "linear-gradient(to bottom, transparent, #555, #fff)",
              }}
            />

            {/* 2. Eyebrow — location text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
              className={`${outfit.className} text-[10px] sm:text-[11px] tracking-[0.6em] text-neutral-500 mb-8`}
            >
              [ BROOKLYN, NEW YORK ]
            </motion.p>

            {/* 3. Logo icon — appears, holds, then morphs out with blur */}
            <div className="relative flex items-center justify-center">
              {/* Small icon: fade in + scale up, hold, then scale up big + blur + fade out */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4, filter: "blur(0px)" }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.4, 1.05, 1, 1, 2.8],
                  filter: [
                    "blur(0px)",
                    "blur(0px)",
                    "blur(0px)",
                    "blur(0px)",
                    "blur(10px)",
                  ],
                }}
                transition={{
                  duration: 2.2,
                  delay: 1.8,
                  times: [0, 0.35, 0.45, 0.7, 1],
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute z-[1]"
              >
                <Image
                  src={LOGOS.agapeWhiteSm}
                  alt=""
                  width={120}
                  height={120}
                  className="w-[60px] sm:w-[80px] md:w-[120px] h-auto"
                />
              </motion.div>

              {/* 4. Full festival logo — reveals after icon morphs out */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.2,
                  delay: 3.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[540px]"
              >
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt="ÄGAPE FESTIVAL"
                  width={540}
                  height={540}
                  className="w-full h-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  priority
                />
              </motion.div>
            </div>

            {/* 5. Horizontal divider expands */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 4.2, ease: "easeOut" }}
              className="h-[1px] bg-white mt-10 mb-10"
            />

            {/* 6. Date & venue cascade in */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.6 }}
              className="flex flex-col items-center gap-3"
            >
              <p
                className={`${outfit.className} text-sm sm:text-base tracking-[0.3em] text-neutral-300`}
              >
                SEPTEMBER 5 + 6, 2026
              </p>
              <p
                className={`${outfit.className} text-[11px] sm:text-xs tracking-[0.2em] text-neutral-500`}
              >
                INDUSTRY CITY — BROOKLYN, NYC
              </p>
            </motion.div>

            {/* 7. CTA */}
            <motion.a
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 5.2 }}
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-14 relative group inline-block"
            >
              <div
                className="absolute inset-0 rounded-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(135deg, #444, #999, #444)",
                  backgroundSize: "200% 200%",
                  animation: "borderFlow 4s ease infinite",
                }}
              />
              <div className="relative bg-black/60 backdrop-blur-sm m-[1px] px-10 py-4 rounded-[2px] group-hover:bg-black/80 transition-colors duration-500">
                <span
                  className={`${orbitron.className} text-[10px] sm:text-[11px] tracking-[0.3em] text-neutral-200 group-hover:text-white transition-colors duration-300`}
                >
                  GET TICKETS
                </span>
              </div>
            </motion.a>
          </div>

          {/* Location watermark — bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.6, duration: 0.6 }}
            className="absolute bottom-10 right-10 z-[2] hidden md:block"
          >
            <p
              className={`${outfit.className} text-[10px] tracking-[0.2em] text-neutral-600`}
              style={{ writingMode: "vertical-rl" }}
            >
              40.7128° N — 73.9352° W
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.8, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2"
          >
            <span
              className={`${outfit.className} text-[9px] tracking-[0.3em] text-neutral-500`}
            >
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-[1px] h-6 bg-gradient-to-b from-neutral-500 to-transparent"
            />
          </motion.div>
        </section>

        {/* ========== MARQUEE TICKER ========== */}
        <div className="py-4 border-y border-white/[0.04] bg-black/60 backdrop-blur-md">
          <Marquee speed={25}>
            <span className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mx-8`}>
              ÄGAPE FESTIVAL 2026
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-600 mx-8`}>
              SEPTEMBER 5 + 6
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-600 mx-8`}>
              INDUSTRY CITY — BROOKLYN
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-600 mx-8`}>
              INDOOR + OUTDOOR STAGES
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-600 mx-8`}>
              2 DAYS — 4 STAGES
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
          </Marquee>
        </div>

        {/* ========== ABOUT + PHOTO ========== */}
        <section id="about" className="py-28 sm:py-36 px-6 lg:px-10 bg-black/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Text */}
              <Reveal className="order-2 lg:order-1">
                <motion.p
                  variants={fadeInUp}
                  className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mb-6`}
                >
                  01 — ABOUT
                </motion.p>
                <motion.p
                  variants={fadeInUp}
                  className={`${outfit.className} text-xl sm:text-2xl md:text-3xl leading-relaxed text-neutral-200 font-light`}
                >
                  {COPY.about}
                </motion.p>

                <MetallicDivider />

                <motion.p
                  variants={fadeInUp}
                  className={`${outfit.className} text-sm sm:text-[15px] leading-[1.9] text-neutral-500`}
                >
                  {COPY.aboutExtended}
                </motion.p>

                <motion.p
                  variants={fadeInUp}
                  className={`${orbitron.className} text-[10px] tracking-[0.3em] text-neutral-700 mt-8`}
                >
                  {COPY.origin}
                </motion.p>
              </Reveal>

              {/* Photo with slow zoom on scroll */}
              <AboutPhoto />
            </div>
          </div>
        </section>

        {/* ========== VIDEO BREAK — DAVID LOHLEIN B&W ========== */}
        <ParallaxVideoBreak />

        {/* ========== 2D FLYER + SALES COPY ========== */}
        <section className="py-20 sm:py-28 px-6 lg:px-10 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Flyer — left */}
              <FlyerParallax />

              {/* Sales copy — right */}
              <Reveal>
                <motion.p
                  variants={fadeInUp}
                  className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mb-6`}
                >
                  FULL LINEUP
                </motion.p>
                <motion.h3
                  variants={fadeInUp}
                  className={`${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.08em] chrome-text-slow mb-8`}
                >
                  A STACKED WEEKEND
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  className={`${outfit.className} text-base sm:text-lg leading-[1.8] text-neutral-300 font-light mb-6`}
                >
                  Two days of unrelenting sound across indoor and outdoor stages at Industry City, Brooklyn. From internationally acclaimed headliners to rising underground talent — every set is curated to deliver the energy ÄGAPE is known for.
                </motion.p>
                <motion.p
                  variants={fadeInUp}
                  className={`${outfit.className} text-sm leading-[1.8] text-neutral-500 mb-8`}
                >
                  Day one brings the raw power of the ÄGAPE and Face 2 Face stages. Day two escalates with 44 taking over both rooms for a relentless closing chapter. Expect bold sound design, elevated production, and an atmosphere built on genuine connection.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <a
                    href={FESTIVAL.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${orbitron.className} text-[11px] tracking-[0.25em] text-neutral-400 hover:text-white transition-colors duration-300 border-b border-neutral-700 hover:border-white pb-1`}
                  >
                    SECURE YOUR SPOT →
                  </a>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========== TICKETS CTA ========== */}
        <section className="py-24 sm:py-32 px-6 bg-black/20">
          <Reveal className="text-center max-w-3xl mx-auto">
            <motion.p
              variants={fadeInUp}
              className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mb-8`}
            >
              02 — TICKETS
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.08em] chrome-text`}
            >
              SECURE YOUR ENTRY
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className={`${outfit.className} text-sm text-neutral-500 tracking-[0.15em] mt-6`}
            >
              {FESTIVAL.tagline} — {FESTIVAL.venue.full}
            </motion.p>
            <motion.a
              variants={fadeInUp}
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-12 relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="absolute inset-0 rounded-[2px]"
                style={{
                  background:
                    "linear-gradient(135deg, #5a0000, #8b0000, #cc2222, #8b0000, #5a0000)",
                  backgroundSize: "300% 300%",
                  animation: "borderFlow 4s ease infinite",
                  opacity: 0.6,
                }}
              />
              <div className="relative bg-black m-[1px] px-12 py-5 rounded-[2px] group-hover:bg-[#080000] transition-colors duration-500">
                <span
                  className={`${orbitron.className} text-xs tracking-[0.3em] text-neutral-200 group-hover:text-white transition-colors duration-300`}
                >
                  GET TICKETS →
                </span>
              </div>
            </motion.a>
          </Reveal>
        </section>

        {/* ========== ARTISTS ========== */}
        <section id="artists" className="py-24 sm:py-32 px-6 lg:px-10 bg-black/30">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <motion.p
                variants={fadeInUp}
                className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 text-center mb-4`}
              >
                03 — LINEUP
              </motion.p>
              <motion.h2
                variants={fadeInUp}
                className={`${orbitron.className} text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.15em] text-center mb-6 chrome-text`}
              >
                THE LINEUP
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className={`${outfit.className} text-xs text-neutral-600 tracking-[0.2em] text-center mb-20`}
              >
                {stages.reduce((acc, s) => acc + s.artists.length, 0)} ARTISTS · 2 DAYS · 4 STAGES
              </motion.p>
            </Reveal>

            {stages.map((stage, stageIdx) => (
              <Reveal
                key={`${stage.day}-${stage.stage}`}
                className={stageIdx > 0 ? "mt-24" : ""}
              >
                {/* Stage header */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-4 mb-12"
                >
                  <div
                    className="h-[1px] flex-1"
                    style={{
                      background: "linear-gradient(90deg, transparent, #333)",
                    }}
                  />
                  <div className="text-center shrink-0">
                    <p
                      className={`${orbitron.className} text-[9px] sm:text-[10px] tracking-[0.3em] text-neutral-600 mb-1.5`}
                    >
                      {stage.dayLabel.toUpperCase()}
                    </p>
                    <p
                      className={`${orbitron.className} text-[11px] sm:text-xs tracking-[0.2em] text-neutral-400`}
                    >
                      {stage.stage.toUpperCase()} STAGE
                      <span className="text-neutral-600 ml-2">
                        — {stage.host}
                      </span>
                    </p>
                  </div>
                  <div
                    className="h-[1px] flex-1"
                    style={{
                      background: "linear-gradient(90deg, #333, transparent)",
                    }}
                  />
                </motion.div>

                <motion.div
                  variants={staggerFast}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                >
                  {stage.artists.map((artist, i) => (
                    <ArtistCard
                      key={`${artist.name}-${stage.day}-${stage.stage}`}
                      artist={artist}
                      index={i}
                    />
                  ))}
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ========== MERCH ========== */}
        <section id="merch" className="py-28 sm:py-36 px-6 bg-black/20">
          <Reveal className="text-center">
            <motion.p
              variants={fadeInUp}
              className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mb-6`}
            >
              04 — MERCH
            </motion.p>
            <motion.h3
              variants={fadeInUp}
              className={`${orbitron.className} text-xl sm:text-2xl tracking-[0.3em] text-neutral-400`}
            >
              COMING SOON
            </motion.h3>
            <motion.p
              variants={fadeInUp}
              className={`${outfit.className} text-xs text-neutral-600 mt-4 tracking-wider`}
            >
              {COPY.merchComingSoon}
            </motion.p>
          </Reveal>
        </section>

        {/* ========== PARTNERS ========== */}
        <section id="partners" className="py-20 sm:py-28 px-6 lg:px-10 bg-black/20">
          <Reveal>
            <motion.p
              variants={fadeInUp}
              className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 text-center mb-4`}
            >
              05 — PARTNERS
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className={`${orbitron.className} text-sm sm:text-base tracking-[0.3em] text-neutral-500 text-center mb-16`}
            >
              PRESENTED BY
            </motion.h2>

            <motion.div
              variants={stagger}
              className="flex flex-wrap justify-center items-center gap-10 sm:gap-14 lg:gap-16 max-w-5xl mx-auto"
            >
              {PARTNERS.map((partner) => (
                <motion.div
                  key={partner.name}
                  variants={fadeInUp}
                  className="group relative flex items-center justify-center h-[50px]"
                  whileHover={{ scale: 1.05 }}
                >
                  {partner.logoUrl ? (
                    <a
                      href={partner.website || "#"}
                      {...(partner.website
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="block h-full flex items-center"
                    >
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        width={120}
                        height={45}
                        className="opacity-50 group-hover:opacity-90 transition-all duration-700 grayscale group-hover:grayscale-0 object-contain max-h-[50px] w-auto"
                      />
                    </a>
                  ) : (
                    <span
                      className={`${orbitron.className} text-[11px] tracking-[0.2em] text-neutral-700 group-hover:text-neutral-400 transition-colors duration-500`}
                    >
                      {partner.name}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </section>

        {/* ========== BOTTOM MARQUEE ========== */}
        <div className="py-4 border-y border-white/[0.04] bg-black/60">
          <Marquee speed={35}>
            <span className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-700 mx-8`}>
              ÄGAPE FESTIVAL
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-700 mx-8`}>
              ELEVATED PRODUCTION
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-700 mx-8`}>
              BOLD SOUND DESIGN
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
            <span className={`${outfit.className} text-[10px] tracking-[0.3em] text-neutral-700 mx-8`}>
              GENUINE INCLUSIVE ATMOSPHERE
            </span>
            <span className="text-neutral-800 mx-2">◆</span>
          </Marquee>
        </div>

        {/* ========== FOOTER ========== */}
        <footer className="py-16 sm:py-20 px-6 lg:px-10 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {/* Logo */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt={FESTIVAL.name}
                  width={160}
                  height={160}
                  className="opacity-20 w-[120px] h-auto"
                />
                <p
                  className={`${outfit.className} text-[10px] tracking-[0.15em] text-neutral-700`}
                >
                  {FESTIVAL.venue.full}
                </p>
              </div>

              {/* Socials */}
              <div className="flex flex-col items-center gap-4">
                <p
                  className={`${orbitron.className} text-[9px] tracking-[0.3em] text-neutral-600 mb-2`}
                >
                  FOLLOW
                </p>
                {SOCIALS.map((social) => (
                  <a
                    key={social.handle}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${outfit.className} text-[11px] tracking-wider text-neutral-600 hover:text-white transition-colors duration-300`}
                  >
                    {social.handle}
                  </a>
                ))}
              </div>

              {/* Contact */}
              <div className="flex flex-col items-center md:items-end gap-4">
                <p
                  className={`${orbitron.className} text-[9px] tracking-[0.3em] text-neutral-600 mb-2`}
                >
                  CONTACT
                </p>
                <a
                  href={`mailto:${FESTIVAL.contactEmail}`}
                  className={`${outfit.className} text-[11px] tracking-wider text-neutral-600 hover:text-white transition-colors duration-300`}
                >
                  {FESTIVAL.contactEmail}
                </a>
              </div>
            </div>

            <MetallicDivider />

            <p
              className={`${outfit.className} text-[9px] tracking-[0.2em] text-neutral-700 text-center`}
            >
              © {FESTIVAL.year} {FESTIVAL.name}. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
