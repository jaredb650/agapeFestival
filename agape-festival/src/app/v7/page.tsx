"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V7: SIGNAL CATHEDRAL
// The best of V2 and V5 combined.
// V5's tight layouts + corner frame motif + numbered nav.
// V2's cinematic hero intro + 3D background + chrome effects +
// typewriter (fixed: pre-allocates space, no container jumping).
// No scroll-locked sections. Gallery replaces "coming soon" merch.
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
import localFont from "next/font/local";
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

// ---- Fonts (from V2) ----
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});
const chonkyPixels = localFont({
  src: "../../../public/assets/fonts/ChonkyPixels.ttf",
  display: "swap",
  variable: "--font-chonky",
});

// ---- CSS (from V2 + cursor blink) ----
const STYLES = `
  html { scroll-behavior: smooth; }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
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

// ---- Animation Variants ----
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

// ============================================================
// SIGNATURE ELEMENT: Corner Frame (from V5)
// This ONE motif appears on every content block, card, button,
// and image — tying the whole page together.
// ============================================================
function Frame({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  const c = accent ? "border-[#8b0000]/40" : "border-white/[0.1]";
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${c} pointer-events-none z-10`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${c} pointer-events-none z-10`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${c} pointer-events-none z-10`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${c} pointer-events-none z-10`} />
      {children}
    </div>
  );
}

// ============================================================
// TYPEWRITER REVEAL (FIXED)
// Pre-allocates the full text space using an invisible ghost,
// then types the visible text on top. No container jumping.
// ============================================================
function TypewriterReveal({
  text,
  className = "",
  speed = 12,
  delay = 0,
  trigger,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  trigger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldStart = trigger !== undefined ? trigger : isInView;
  const [displayCount, setDisplayCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!shouldStart || started) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [shouldStart, delay, started]);

  useEffect(() => {
    if (!started) return;
    if (displayCount >= text.length) return;
    const timer = setTimeout(
      () => setDisplayCount((c) => Math.min(c + 1, text.length)),
      speed
    );
    return () => clearTimeout(timer);
  }, [started, displayCount, text.length, speed]);

  const done = displayCount >= text.length;

  return (
    <div ref={ref} className="relative">
      {/* Ghost text — invisible, pre-allocates full height */}
      <div className={className} style={{ visibility: "hidden" }} aria-hidden="true">
        {text}
      </div>
      {/* Visible text — types over the ghost space */}
      <div className={`${className} absolute top-0 left-0 right-0`}>
        <span>{text.slice(0, displayCount)}</span>
        {!done && started && (
          <span
            className="inline-block w-[2px] h-[1em] bg-neutral-400 ml-[1px] align-middle"
            style={{ animation: "cursorBlink 0.6s step-end infinite" }}
          />
        )}
      </div>
    </div>
  );
}

// ---- Scroll Reveal ----
function Reveal({
  children,
  className = "",
  id,
  replay = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  replay?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: !replay, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---- Stagger Grid (for artist cards) ----
function StaggerGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerFast}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---- Section Label (numbered, from V5) ----
function Label({ num, text }: { num: string; text: string }) {
  return (
    <p className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600`}>
      <span className="text-[#8b0000]/50">{num}</span>
      <span className="mx-2">—</span>
      {text}
    </p>
  );
}

// ---- Marquee ----
function Marquee({ children, speed = 28 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex" style={{ animation: `marquee ${speed}s linear infinite` }}>
        {children}
        {children}
      </div>
    </div>
  );
}

// ---- Metallic Divider (from V2) ----
function MetallicDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
      className="w-full h-[1px] my-12 origin-left"
      style={{
        background: "linear-gradient(90deg, transparent 0%, #444 20%, #aaa 50%, #444 80%, transparent 100%)",
      }}
    />
  );
}

// ============================================================
// THREE.JS SCENE (from V2 — wireframe torus + chrome particles)
// ============================================================
function WireframeTorus() {
  const outerGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!spinGroup.current || !outerGroup.current) return;
    spinGroup.current.rotation.y += delta * 0.05;
    spinGroup.current.rotation.x += delta * 0.025;
    outerGroup.current.rotation.x += (state.pointer.y * 0.08 - outerGroup.current.rotation.x) * 0.02;
    outerGroup.current.rotation.y += (state.pointer.x * 0.08 - outerGroup.current.rotation.y) * 0.02;
  });
  return (
    <group ref={outerGroup}>
      <group ref={spinGroup}>
        <mesh>
          <torusKnotGeometry args={[2.5, 0.5, 300, 40]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
        </mesh>
        <mesh scale={1.04}>
          <torusKnotGeometry args={[2.5, 0.5, 150, 20]} />
          <meshBasicMaterial color="#888888" wireframe transparent opacity={0.08} />
        </mesh>
      </group>
    </group>
  );
}

function ChromeParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
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
      }),
    [count]
  );
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
// ARTIST CARD — V5 Frame + V2 hover effects + overlay bio
// Card height NEVER changes. Bio appears as overlay on image.
// ============================================================
function ArtistCard({ artist }: { artist: Artist }) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer group"
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      <Frame active-={expanded}>
        <div className="bg-[#060606]">
          <div className="aspect-[4/3] relative overflow-hidden bg-[#050505]">
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                className={`object-cover transition-all duration-700 ease-out ${
                  imgLoaded ? "" : "opacity-0"
                } ${
                  expanded
                    ? "grayscale-0 opacity-100 scale-105"
                    : "grayscale opacity-50 group-hover:opacity-80 group-hover:grayscale-[50%]"
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${orbitron.className} text-[10px] text-white/10`}>—</span>
              </div>
            )}

            {/* Bottom gradient on image */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Bio overlay — appears ON the image, card height stays fixed */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/85 p-4 flex flex-col justify-end z-[2] overflow-y-auto"
                >
                  <p
                    className={`${chonkyPixels.className} text-[10px] sm:text-[11px] leading-relaxed text-neutral-400`}
                  >
                    {artist.bio}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name bar */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.04]">
            <h3
              className={`${orbitron.className} text-[11px] sm:text-xs tracking-[0.08em] transition-colors duration-300 ${
                expanded ? "text-white" : "text-neutral-300 group-hover:text-white"
              }`}
            >
              {artist.name}
            </h3>
            {artist.note && (
              <span className={`${orbitron.className} text-[9px] tracking-wider text-[#8b0000] shrink-0`}>
                {artist.note}
              </span>
            )}
          </div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ---- About Photo with scroll-zoom (from V2) ----
function AboutPhoto() {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7 }}
      className="order-1 lg:order-2"
    >
      <Frame>
        <div className="aspect-[3/4] overflow-hidden relative">
          <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
            <Image
              src={PHOTOS[6]}
              alt="ÄGAPĒ event"
              fill
              className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              onLoad={() => setLoaded(true)}
            />
          </motion.div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ---- Hero Video (from V2 with loading state) ----
function HeroVideo() {
  const [loaded, setLoaded] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (vid && vid.readyState >= 3) setLoaded(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, delay: 4.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="absolute inset-0"
    >
      <video
        ref={vidRef}
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

// ---- Parallax Video Break (simplified from V2) ----
function ParallaxVideoBreak() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const smoothY = useSpring(videoY, { stiffness: 80, damping: 30 });
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-120px" });

  return (
    <div ref={ref} className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
      <motion.div style={{ y: smoothY }} className="absolute left-0 right-0 h-[140%] -top-[20%]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.15) brightness(0.35)" }}
        >
          <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
          <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      <div ref={inViewRef} className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6 overflow-hidden">
          {/* "TWO DAYS." wipes in first */}
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            animate={
              isInView
                ? { opacity: 1, clipPath: "inset(0 0% 0 0)" }
                : {}
            }
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p
              className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.15em] chrome-text`}
            >
              TWO DAYS.
            </p>
          </motion.div>
          {/* "FOUR STAGES." wipes in well after first line finishes */}
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            animate={
              isInView
                ? { opacity: 1, clipPath: "inset(0 0% 0 0)" }
                : {}
            }
            transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p
              className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.15em] chrome-text`}
            >
              FOUR STAGES.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE — Vertical line draws down, milestones pop in
// Echoes the hero intro's falling line. Shows ÄGAPĒ's journey.
// ============================================================

const MILESTONES = [
  {
    year: "2021",
    title: "THE BEGINNING",
    text: "First ÄGAPĒ gathering in a Brooklyn warehouse. 40 people, one room, pure energy. The seed of something bigger.",
  },
  {
    year: "2022",
    title: "BUILDING THE SOUND",
    text: "Monthly events take root across NYC. A community forms around uncompromising hard techno. 200+ regulars become family.",
  },
  {
    year: "2023",
    title: "GOING UNDERGROUND",
    text: "First multi-room event. The Face 2 Face partnership begins. 500 capacity — sold out in hours.",
  },
  {
    year: "2024",
    title: "BREAKING THROUGH",
    text: "First international artist bookings. Collaboration with 44 Label Group. Events surpass 1,000 attendees.",
  },
  {
    year: "2025",
    title: "THE MOVEMENT",
    text: "Sold-out warehouses become the norm. NYC's hardest techno community earns national recognition.",
  },
  {
    year: "2026",
    title: "THE FESTIVAL",
    text: "ÄGAPĒ FESTIVAL. Industry City, Brooklyn. 2 days. 4 stages. 22 artists. The culmination. The peak. And peaking is what we do.",
    isFinal: true,
  },
] as const;

function TimelineMilestone({
  milestone,
  index,
}: {
  milestone: (typeof MILESTONES)[number];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = index % 2 === 0;
  const isFinal = "isFinal" in milestone && milestone.isFinal;

  return (
    <div ref={ref} className={`relative ${index > 0 ? "mt-14 sm:mt-20" : ""}`}>
      {/* Dot on the line */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
        className={`absolute left-[15px] md:left-1/2 -translate-x-1/2 top-5 z-10 rounded-full ${
          isFinal
            ? "w-4 h-4 bg-[#8b0000] border border-[#cc2222]/50 shadow-[0_0_20px_rgba(139,0,0,0.5)]"
            : "w-2.5 h-2.5 bg-neutral-500 border border-neutral-400"
        }`}
      />

      {/* Horizontal connector line (desktop only) */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={`absolute top-[23px] h-[1px] hidden md:block ${
          isFinal ? "bg-[#8b0000]/30" : "bg-white/[0.08]"
        } ${
          isLeft
            ? "right-1/2 mr-[8px] w-[30px] origin-right"
            : "left-1/2 ml-[8px] w-[30px] origin-left"
        }`}
      />

      {/* Content block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className={`
          ml-10 md:ml-0
          md:w-[calc(50%-50px)]
          ${isLeft ? "md:mr-auto md:pr-0" : "md:ml-auto md:pl-0"}
        `}
      >
        <Frame accent={isFinal}>
          <div className={`p-4 sm:p-5 ${isLeft ? "md:text-right" : ""}`}>
            <p
              className={`${orbitron.className} text-[9px] tracking-[0.35em] ${
                isFinal ? "text-[#8b0000]" : "text-neutral-600"
              }`}
            >
              {milestone.year}
            </p>
            <h4
              className={`${orbitron.className} text-[13px] sm:text-sm font-bold tracking-[0.06em] mt-2 mb-2 ${
                isFinal ? "chrome-text" : "text-neutral-200"
              }`}
            >
              {milestone.title}
            </h4>
            <p
              className={`${outfit.className} text-[12px] sm:text-[13px] leading-[1.7] text-neutral-500`}
            >
              {milestone.text}
            </p>
          </div>
        </Frame>
      </motion.div>
    </div>
  );
}

function Timeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.4"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 40, damping: 15 });

  return (
    <div ref={containerRef} className="relative mt-16 sm:mt-20">
      {/* The drawing vertical line */}
      <motion.div
        style={{ scaleY: lineScale, transformOrigin: "top" }}
        className="absolute left-[15px] md:left-1/2 md:-translate-x-[0.5px] top-0 w-[1px] h-full z-0"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.08), rgba(139,0,0,0.15))",
          }}
        />
      </motion.div>

      {/* Small starting cap at top */}
      <div className="absolute left-[15px] md:left-1/2 -translate-x-1/2 top-0 w-[1px] h-8 bg-gradient-to-b from-transparent to-white/20 z-0" />

      {/* Milestones */}
      {MILESTONES.map((milestone, i) => (
        <TimelineMilestone key={milestone.year} milestone={milestone} index={i} />
      ))}

      {/* Line continues past final dot → downward arrow (perpetual growth) */}
      <div className="relative mt-0 h-32 sm:h-40">
        {/* Continuation line from last milestone to arrow */}
        <div
          className="absolute left-[15px] md:left-1/2 -translate-x-1/2 top-0 w-[1px] h-full"
          style={{
            background: "linear-gradient(to bottom, rgba(139,0,0,0.2), rgba(139,0,0,0.08))",
          }}
        />
        {/* Downward arrow at the end */}
        <div className="absolute left-[15px] md:left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
          <svg
            width="11"
            height="16"
            viewBox="0 0 11 16"
            fill="none"
            className="opacity-30"
          >
            <path
              d="M5.5 0 L5.5 12 M1 8.5 L5.5 14 L10 8.5"
              stroke="#8b0000"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---- Nav Links (numbered, from V5) ----
const NAV_LINKS = [
  { num: "01", label: "ABOUT", href: "#about" },
  { num: "02", label: "LINEUP", href: "#artists" },
  { num: "03", label: "TICKETS", href: FESTIVAL.ticketUrl, external: true },
];

// ============================================================
// MAIN PAGE
// ============================================================
export default function SignalCathedral() {
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 3D canvas parallax
  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.8, 1, 0.7, 0.5]);

  useEffect(() => {
    setIsClient(true);
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const stages = getStages();
  const totalArtists = stages.reduce((a, s) => a + s.artists.length, 0);

  return (
    <div className={`${outfit.className} min-h-screen bg-black text-white relative`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ========== FIXED 3D PARALLAX BACKGROUND (from V2) ========== */}
      {isClient && (
        <motion.div
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

      {/* ========== NAVIGATION (V5 numbered + V2 delayed fade-in) ========== */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 6.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.04]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
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
              ÄGAPĒ
            </span>
          </a>

          {/* Desktop links — numbered */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`${orbitron.className} text-[10px] tracking-[0.25em] text-neutral-500 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gradient-to-r after:from-neutral-500 after:to-transparent hover:after:w-full after:transition-all after:duration-300`}
              >
                <span className="text-[#8b0000]/50 mr-1.5 text-[9px]">{link.num}</span>
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 ${menuOpen ? "opacity-0 scale-0" : ""}`} />
            <span className={`block w-5 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
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
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setMenuOpen(false)}
                    className={`${orbitron.className} text-xs tracking-[0.3em] text-neutral-400 hover:text-white transition-colors`}
                  >
                    <span className="text-[#8b0000]/50 mr-2">{link.num}</span>
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

        {/* ========== HERO — V2 CINEMATIC INTRO ========== */}
        <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">
          <HeroVideo />

          {/* Dark overlays (simplified — no scanlines/grid) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4.8 }}
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black pointer-events-none"
          />

          {/* === INTRO ANIMATION SEQUENCE (from V2) === */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[2] px-6">

            {/* 1. Vertical line descends */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 140 }}
              transition={{ duration: 1.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px]"
              style={{ background: "linear-gradient(to bottom, transparent, #555, #fff)" }}
            />

            {/* 2. Location text — in a Frame */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
              className="mb-8"
            >
              <Frame className="inline-block">
                <p className={`${outfit.className} text-[10px] sm:text-[11px] tracking-[0.6em] text-neutral-500 px-4 py-1.5`}>
                  BROOKLYN, NEW YORK
                </p>
              </Frame>
            </motion.div>

            {/* 3. Logo icon — appears, holds, then morphs out */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.4, filter: "blur(0px)" }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.4, 1.05, 1, 1, 2.8],
                  filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(10px)"],
                }}
                transition={{
                  duration: 2.2,
                  delay: 1.8,
                  times: [0, 0.35, 0.45, 0.7, 1],
                  ease: [0.25, 0.46, 0.45, 0.94] as const,
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

              {/* 4. Full festival logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 3.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[540px]"
              >
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt="ÄGAPĒ FESTIVAL"
                  width={540}
                  height={540}
                  className="w-full h-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  priority
                />
              </motion.div>
            </div>

            {/* 5. Horizontal divider */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 4.2, ease: "easeOut" }}
              className="h-[1px] bg-white mt-10 mb-10"
            />

            {/* 6. Date & venue — typewriter with fixed space */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 4.6 }}
              className="flex flex-col items-center gap-3"
            >
              <TypewriterReveal
                text="SEPTEMBER 5 + 6, 2026"
                className={`${chonkyPixels.className} text-sm sm:text-base tracking-[0.3em] text-neutral-300 text-center`}
                speed={35}
                trigger={true}
                delay={4700}
              />
              <TypewriterReveal
                text="INDUSTRY CITY — BROOKLYN, NYC"
                className={`${chonkyPixels.className} text-[11px] sm:text-xs tracking-[0.2em] text-neutral-500 text-center`}
                speed={25}
                trigger={true}
                delay={5500}
              />
            </motion.div>

            {/* 7. CTA — in accent Frame */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 6.4 }}
              className="mt-14"
            >
              <Frame accent className="inline-block">
                <a
                  href={FESTIVAL.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-10 py-4 bg-[#8b0000]/[0.08] hover:bg-[#8b0000]/20 transition-all duration-500 group"
                >
                  <span
                    className={`${orbitron.className} text-[10px] sm:text-[11px] tracking-[0.3em] text-neutral-200 group-hover:text-white transition-colors duration-300`}
                  >
                    GET TICKETS
                  </span>
                </a>
              </Frame>
            </motion.div>
          </div>
        </section>

        {/* ========== MARQUEE TICKER ========== */}
        <div className="py-4 border-y border-white/[0.04] bg-black/60 backdrop-blur-md">
          <Marquee speed={25}>
            {[
              "ÄGAPĒ FESTIVAL 2026",
              "SEPTEMBER 5 + 6",
              "INDUSTRY CITY — BROOKLYN",
              "2 DAYS — 4 STAGES",
              `${totalArtists} ARTISTS`,
            ].map((t, i) => (
              <span key={i} className="flex items-center">
                <span className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-600 mx-8`}>
                  {t}
                </span>
                <span className="text-neutral-800 mx-2">&#x25C6;</span>
              </span>
            ))}
          </Marquee>
        </div>

        {/* ========== TIMELINE / THE JOURNEY ========== */}
        <section className="py-28 sm:py-36 px-6 lg:px-12 bg-black/70 overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="—" text="THE JOURNEY" />
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className={`${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.08em] chrome-text-slow mt-4`}
              >
                HOW WE GOT HERE
              </motion.h2>
            </Reveal>

            <Timeline />
          </div>
        </section>

        {/* ========== ABOUT + PHOTO ========== */}
        <section id="about" className="py-28 sm:py-36 px-6 lg:px-12 bg-black/70">
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="01" text="ABOUT" />
              </motion.div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 mt-10 items-start">
              {/* Text block — in a Frame */}
              <Reveal className="order-2 lg:order-1">
                <motion.div variants={fadeInUp}>
                  <Frame>
                    <div className="p-6 sm:p-8 lg:p-10">
                      <TypewriterReveal
                        text={COPY.about}
                        className={`${chonkyPixels.className} text-xl sm:text-2xl md:text-3xl leading-relaxed text-neutral-200`}
                        speed={18}
                      />
                      <MetallicDivider />
                      <TypewriterReveal
                        text={COPY.aboutExtended}
                        className={`${chonkyPixels.className} text-sm sm:text-[15px] leading-[1.9] text-neutral-500`}
                        speed={8}
                        delay={200}
                      />
                      <p className={`${orbitron.className} text-[10px] tracking-[0.3em] text-neutral-700 mt-8`}>
                        {COPY.origin}
                      </p>
                    </div>
                  </Frame>
                </motion.div>
              </Reveal>

              {/* Photo with scroll-zoom */}
              <AboutPhoto />
            </div>
          </div>
        </section>

        {/* ========== VIDEO BREAK (parallax, from V2) ========== */}
        <ParallaxVideoBreak />

        {/* ========== FLYER + SALES COPY ========== */}
        <section className="py-20 sm:py-28 px-6 lg:px-12 bg-black/60">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Flyer — in a Frame */}
              <Reveal>
                <motion.div variants={fadeInUp} className="max-w-md">
                  <Frame>
                    <Image
                      src={`${BASE_PATH}/assets/1000x1778.avif`}
                      alt="ÄGAPĒ FESTIVAL 2026 — Full Lineup"
                      width={600}
                      height={1067}
                      className="w-full h-auto"
                    />
                  </Frame>
                </motion.div>
              </Reveal>

              {/* Copy */}
              <Reveal>
                <motion.div variants={fadeInUp}>
                  <Label num="—" text="FULL LINEUP" />
                </motion.div>
                <motion.h3
                  variants={fadeInUp}
                  className={`${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.08em] chrome-text-slow mt-4 mb-8`}
                >
                  A STACKED WEEKEND
                </motion.h3>
                <motion.div variants={fadeInUp} className="mb-6">
                  <TypewriterReveal
                    text="Two days of unrelenting sound across indoor and outdoor stages at Industry City, Brooklyn. From internationally acclaimed headliners to rising underground talent — every set is curated to deliver the energy ÄGAPĒ is known for."
                    className={`${chonkyPixels.className} text-base sm:text-lg leading-[1.8] text-neutral-300`}
                    speed={8}
                  />
                </motion.div>
                <motion.div variants={fadeInUp} className="mb-8">
                  <TypewriterReveal
                    text="Day one brings the raw power of the ÄGAPĒ and Face 2 Face stages. Day two escalates with 44 taking over both rooms for a relentless closing chapter. Expect bold sound design, elevated production, and an atmosphere built on genuine connection."
                    className={`${chonkyPixels.className} text-sm leading-[1.8] text-neutral-500`}
                    speed={6}
                    delay={200}
                  />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Frame accent className="inline-block">
                    <a
                      href={FESTIVAL.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-8 py-3 bg-[#8b0000]/[0.06] hover:bg-[#8b0000]/20 transition-all duration-300"
                    >
                      <span className={`${orbitron.className} text-[11px] tracking-[0.25em] text-neutral-400 hover:text-white transition-colors duration-300`}>
                        SECURE YOUR SPOT →
                      </span>
                    </a>
                  </Frame>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========== TICKETS CTA (simple, looping video — NOT scroll-locked) ========== */}
        <section className="relative py-28 sm:py-36 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.15) saturate(0.4)" }}
          >
            <source src={VIDEOS.redStrobes.mp4} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
            <Reveal>
              <Frame accent className="max-w-2xl mx-auto">
                <div className="px-8 py-16 sm:px-12 sm:py-20 text-center">
                  <motion.div variants={fadeInUp}>
                    <Label num="03" text="TICKETS" />
                  </motion.div>
                  <motion.h2
                    variants={fadeInUp}
                    className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.08em] chrome-text mt-6 mb-6`}
                  >
                    SECURE YOUR ENTRY
                  </motion.h2>
                  <motion.div variants={fadeInUp}>
                    <TypewriterReveal
                      text={`${FESTIVAL.tagline} — ${FESTIVAL.venue.full}`}
                      className={`${chonkyPixels.className} text-sm text-neutral-500 tracking-[0.15em]`}
                      speed={15}
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} className="mt-12">
                    <Frame accent className="inline-block">
                      <a
                        href={FESTIVAL.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-12 py-5 bg-[#8b0000]/10 hover:bg-[#8b0000]/25 transition-all duration-300 group"
                      >
                        <span className={`${orbitron.className} text-xs tracking-[0.3em] text-neutral-200 group-hover:text-white transition-colors duration-300`}>
                          GET TICKETS →
                        </span>
                      </a>
                    </Frame>
                  </motion.div>
                </div>
              </Frame>
            </Reveal>
          </div>
        </section>

        {/* ========== ARTISTS / LINEUP ========== */}
        <section id="artists" className="py-24 sm:py-32 px-6 lg:px-12 bg-black/70">
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="02" text="LINEUP" />
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className={`${orbitron.className} text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.15em] mt-4 mb-3 chrome-text`}
              >
                THE LINEUP
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className={`${outfit.className} text-xs text-neutral-600 tracking-[0.2em] mb-20`}
              >
                {totalArtists} ARTISTS · 2 DAYS · 4 STAGES
              </motion.p>
            </Reveal>

            {stages.map((stage, stageIdx) => (
              <div
                key={`${stage.day}-${stage.stage}`}
                className={stageIdx > 0 ? "mt-20" : ""}
              >
                {/* Stage header */}
                <Reveal>
                  <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
                    <div
                      className="h-[1px] flex-1"
                      style={{ background: "linear-gradient(90deg, transparent, #333)" }}
                    />
                    <div className="text-center shrink-0">
                      <p className={`${orbitron.className} text-[9px] sm:text-[10px] tracking-[0.3em] text-neutral-600 mb-1.5`}>
                        {stage.dayLabel.toUpperCase()}
                      </p>
                      <p className={`${orbitron.className} text-[11px] sm:text-xs tracking-[0.2em] text-neutral-400`}>
                        {stage.stage.toUpperCase()} STAGE
                        <span className="text-neutral-600 ml-2">— {stage.host}</span>
                      </p>
                    </div>
                    <div
                      className="h-[1px] flex-1"
                      style={{ background: "linear-gradient(90deg, #333, transparent)" }}
                    />
                  </motion.div>
                </Reveal>

                {/* Artist card grid */}
                <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {stage.artists.map((artist) => (
                    <ArtistCard
                      key={`${artist.name}-${stage.day}-${stage.stage}`}
                      artist={artist}
                    />
                  ))}
                </StaggerGrid>
              </div>
            ))}
          </div>
        </section>

        {/* ========== PHOTO GALLERY (from V5, replaces "coming soon" merch) ========== */}
        <section className="py-24 sm:py-32 px-6 lg:px-12 bg-black/60">
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="04" text="GALLERY" />
              </motion.div>
              <motion.h3
                variants={fadeInUp}
                className={`${orbitron.className} text-xl sm:text-2xl font-bold tracking-[0.08em] chrome-text-slow mt-4 mb-12`}
              >
                PAST EVENTS
              </motion.h3>
            </Reveal>

            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PHOTOS.slice(0, 6).map((photo, i) => (
                <motion.div key={photo} variants={fadeInUp}>
                  <Frame className="group">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src={photo}
                        alt={`ÄGAPĒ event ${i + 1}`}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </Frame>
                </motion.div>
              ))}
            </StaggerGrid>
          </div>
        </section>

        {/* ========== PARTNERS (V2 pop-up animations + V5 layout) ========== */}
        <section id="partners" className="py-20 sm:py-28 px-6 lg:px-12 bg-black/70 border-t border-white/[0.04]">
          <Reveal replay>
            <motion.div variants={fadeInUp}>
              <Label num="05" text="PARTNERS" />
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className={`${orbitron.className} text-sm sm:text-base tracking-[0.3em] text-neutral-500 mt-4 mb-16`}
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
                      {...(partner.website ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
                    <span className={`${orbitron.className} text-[11px] tracking-[0.2em] text-neutral-700 group-hover:text-neutral-400 transition-colors duration-500`}>
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
            {[
              "ÄGAPĒ FESTIVAL",
              "ELEVATED PRODUCTION",
              "BOLD SOUND DESIGN",
              "GENUINE INCLUSIVE ATMOSPHERE",
            ].map((t, i) => (
              <span key={i} className="flex items-center">
                <span className={`${orbitron.className} text-[10px] tracking-[0.4em] text-neutral-700 mx-8`}>
                  {t}
                </span>
                <span className="text-neutral-800 mx-2">&#x25C6;</span>
              </span>
            ))}
          </Marquee>
        </div>

        {/* ========== FOOTER (V5 comprehensive + V2 metallic divider) ========== */}
        <footer className="py-16 sm:py-20 px-6 lg:px-12 bg-black">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {/* Brand */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt={FESTIVAL.name}
                  width={160}
                  height={160}
                  className="opacity-15 w-[100px] h-auto"
                />
                <p className={`${outfit.className} text-[10px] tracking-[0.15em] text-neutral-700`}>
                  {FESTIVAL.venue.full}
                </p>
                <p className={`${outfit.className} text-[10px] tracking-[0.15em] text-neutral-700`}>
                  {FESTIVAL.tagline}
                </p>
              </div>

              {/* Navigation + Social */}
              <div className="flex flex-col items-center gap-6">
                <div>
                  <p className={`${orbitron.className} text-[9px] tracking-[0.3em] text-neutral-600 mb-3`}>
                    NAVIGATE
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${outfit.className} text-[11px] tracking-wider text-neutral-600 hover:text-white transition-colors duration-300`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`${orbitron.className} text-[9px] tracking-[0.3em] text-neutral-600 mb-3`}>
                    FOLLOW
                  </p>
                  <div className="flex flex-col items-center gap-2">
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
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col items-center md:items-end gap-4">
                <p className={`${orbitron.className} text-[9px] tracking-[0.3em] text-neutral-600 mb-2`}>
                  CONTACT
                </p>
                <a
                  href={`mailto:${FESTIVAL.contactEmail}`}
                  className={`${outfit.className} text-[11px] tracking-wider text-neutral-600 hover:text-white transition-colors duration-300`}
                >
                  {FESTIVAL.contactEmail}
                </a>
                <p className={`${outfit.className} text-[10px] text-neutral-800 mt-4`}>
                  For bookings, press, and
                  <br />
                  partnership inquiries.
                </p>
              </div>
            </div>

            {/* V2's metallic divider animation */}
            <MetallicDivider />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className={`${outfit.className} text-[9px] tracking-[0.2em] text-neutral-700`}>
                © {FESTIVAL.year} {FESTIVAL.name}. ALL RIGHTS RESERVED.
              </p>
              <p className={`${outfit.className} text-[9px] tracking-[0.2em] text-neutral-700`}>
                BROOKLYN, NEW YORK
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
