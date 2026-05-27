"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V8ALT: TRAJECTORY (ALT LAYOUT)
// V8 with reordered sections: action-first, then context.
//
// DESIGN CRITIQUES APPLIED:
// 1. Typography: 37 ad-hoc combos → 11 named tokens (T.*)
// 3. Spacing: 3 inconsistent section paddings → 2 strict tokens (S.*)
// 4. Color: 8+ opacity levels + raw hex → 5 text tones + 1 accent
//
// LINE MOTIF: Thin horizontal hairlines between every section.
// Short animated heading underlines echo the hero's horizontal wipe.
// ============================================================

import {
  Component,
  Suspense,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
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
  ARTISTS,
  TICKET_TIERS,
  getStages,
  STAGE_LOGOS,
  PHOTOS,
  VIDEOS,
  LOGOS,
  BASE_PATH,
  type Artist,
} from "@/data/festival";
// ---- Fonts ----
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});
const chonkyPixels = localFont({
  src: "../../public/assets/fonts/ChonkyPixels.woff2",
  display: "swap",
  variable: "--font-chonky",
});

// Shared SVG noise background — used across mystery artist cards
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

// ============================================================
// DESIGN TOKENS
// These are the ONLY typographic, spacing, and color values
// used anywhere on this page. No ad-hoc values.
// ============================================================

// Typography — 11 tokens (down from 37)
const T = {
  /** Hero-scale / hero CTA headings */
  display: `${orbitron.className} text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.12em]`,
  /** Section titles */
  heading: `${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.08em]`,
  /** Secondary section titles (gallery, flyer) */
  subheading: `${orbitron.className} text-lg sm:text-xl font-bold tracking-[0.08em]`,
  /** Labels, nav links, marquee, nav logo, CTA text */
  label: `${orbitron.className} text-[10px] tracking-[0.35em]`,
  /** Footer labels, timeline year, stage day, artist note */
  detail: `${orbitron.className} text-[9px] tracking-[0.3em]`,
  /** Artist name, timeline title, stage name */
  card: `${orbitron.className} text-[11px] sm:text-xs font-bold tracking-[0.1em]`,
  /** Standard body text */
  body: `${outfit.className} text-xs sm:text-sm leading-relaxed`,
  /** Small body text — footer, subtitles */
  bodySm: `${outfit.className} text-[11px] tracking-[0.15em]`,
  /** Large accent — about main statement */
  monoLg: `${chonkyPixels.className} text-lg sm:text-xl md:text-2xl leading-relaxed tracking-[0.04em]`,
  /** Medium accent — hero date, flyer main copy */
  mono: `${chonkyPixels.className} text-base sm:text-lg leading-[1.9] tracking-[0.04em]`,
  /** Small accent — descriptions, bios, taglines */
  monoSm: `${chonkyPixels.className} text-sm sm:text-base leading-[1.9] tracking-[0.04em]`,
} as const;

// Spacing — 2 section rhythms + consistent inner spacing
const S = {
  /** Standard section padding */
  section: "py-28 sm:py-36",
  /** Compact section padding (flyer, partners, footer) */
  compact: "py-20 sm:py-28",
  /** Horizontal padding — used everywhere */
  px: "px-6 lg:px-12",
  /** Label → heading gap */
  labelGap: "mt-4",
  /** Heading → content gap */
  headingGap: "mb-12",
  /** Card/gallery grid gap */
  gridGap: "gap-3",
  /** Major content block gap */
  contentGap: "gap-16",
} as const;

// Colors — 5 text tones + 1 accent (down from 8+ tones + raw hex)
// text-white: hover/active state only
// neutral-200: bright — headings, emphasized
// neutral-300: primary — body text, CTA labels
// neutral-500: muted — secondary descriptions
// neutral-600: dim — labels, meta text
// neutral-700: ghost — footer, decorative
//
// Accent: #8b0000 (red), #cc2222 (glow)
// Red bg: only /10 (default) and /20 (hover)
// Border: border-white/[0.06] everywhere

// Animation keyframes + utility classes moved to src/app/globals.css.

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
// LINE MOTIF: Section Hairline
// A full-width 1px gradient line placed between every section.
// Creates visual rhythm and reinforces the line motif.
// ============================================================
function SectionLine() {
  return (
    <div
      className="w-full h-[1px]"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)",
      }}
    />
  );
}

// ============================================================
// LINE MOTIF: Heading Underline
// A short animated line that wipes in below section headings.
// Echoes the hero's horizontal divider wipe.
// ============================================================
function HeadingLine({ accent = false }: { accent?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ width: 0 }}
      animate={inView ? { width: 48 } : {}}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
      className={`h-[1px] mt-6 ${S.headingGap} ${
        accent ? "bg-[#8b0000]/40" : "bg-white/[0.12]"
      }`}
    />
  );
}

// ============================================================
// Corner Frame — ONE motif on every content block.
// Uses the consolidated border token: border-white/[0.06]
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
  const c = accent ? "border-[#ff2a2a]/60" : "border-white/[0.06]";
  const size = accent ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute -top-px -left-px ${size} border-t border-l ${c} pointer-events-none z-10`} />
      <div className={`absolute -top-px -right-px ${size} border-t border-r ${c} pointer-events-none z-10`} />
      <div className={`absolute -bottom-px -left-px ${size} border-b border-l ${c} pointer-events-none z-10`} />
      <div className={`absolute -bottom-px -right-px ${size} border-b border-r ${c} pointer-events-none z-10`} />
      {children}
    </div>
  );
}

// ============================================================
// TYPEWRITER REVEAL (FIXED)
// Pre-allocates full text space, types visible text on top.
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
      <div className={className} style={{ visibility: "hidden" }} aria-hidden="true">
        {text}
      </div>
      <div className={`${className} absolute top-0 left-0 right-0`}>
        <span>{text.slice(0, displayCount)}</span>
        {!done && started && (
          <span
            className="inline-block w-[2px] h-[1em] bg-neutral-500 ml-[1px] align-middle"
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

// ---- Stagger Grid ----
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

// ---- Section Label (numbered) ----
function Label({ num, text }: { num: string; text: string }) {
  return (
    <p className={`${T.label} text-neutral-600`}>
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

// ---- Metallic Divider ----
function MetallicDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
      className="w-full h-[1px] my-10 origin-left"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)",
      }}
    />
  );
}

// ============================================================
// THREE.JS SCENE — wireframe torus + chrome particles
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
          {/* Halved segments: 300,40 → 150,20. Still reads as a torus knot. */}
          <torusKnotGeometry args={[2.5, 0.5, 150, 20]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
        </mesh>
        <mesh scale={1.04}>
          <torusKnotGeometry args={[2.5, 0.5, 80, 12]} />
          <meshBasicMaterial color="#888888" wireframe transparent opacity={0.08} />
        </mesh>
      </group>
    </group>
  );
}

function ChromeParticles({ count = 120 }: { count?: number }) {
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

// ---- WebGL Error Boundary — renders nothing on GPU/context failure ----
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
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

// (ArtistCard moved to lineup section below)

// ---- About Photo with scroll-zoom ----
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
      className="order-1 lg:order-2 h-full"
    >
      <Frame className="h-full">
        <div className="aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden relative min-h-[400px]">
          <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
            <Image
              src={`${BASE_PATH}/assets/photos/about.webp`}
              alt="Moments from previous ÄGAPĒ warehouse events in Brooklyn"
              fill
              className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          </motion.div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ---- Film Strips ----
// Two rows of photos scrolling in opposite directions like strips of film.
// Full color, hover zoom, click to open modal.

const GALLERY_ALTS: Record<string, string> = {
  "1D3A9267": "Crowd dancing at ÄGAPĒ Brooklyn techno event",
  "1D3A9488": "DJ performing at ÄGAPĒ warehouse party",
  "1D3A9620": "Audience at ÄGAPĒ event with red stage lighting",
  "3BF199AD": "Ravers at ÄGAPĒ Brooklyn underground techno night",
  "AGAPE_D7": "Dancefloor energy at ÄGAPĒ Brooklyn event",
  "AGAPE_F5": "Live performance at ÄGAPĒ techno event",
  "DSC05585": "Atmospheric lighting at ÄGAPĒ warehouse event",
  "DSC05632": "Partygoers at ÄGAPĒ Brooklyn techno night",
  "AGAPE_D38": "Strobe lights at ÄGAPĒ underground event in Brooklyn",
  "AGAPE_D14": "DJ booth at ÄGAPĒ warehouse party in Brooklyn",
  "AGAPE_F14": "Crowd shot at ÄGAPĒ Brooklyn techno festival",
};

function getPhotoAlt(src: string): string {
  for (const [key, alt] of Object.entries(GALLERY_ALTS)) {
    if (src.includes(key)) return alt;
  }
  return "ÄGAPĒ Brooklyn techno event";
}

function FilmStrips({ photos }: { photos: string[] }) {
  const mid = Math.ceil(photos.length / 2);
  const row1 = photos.slice(0, mid);
  const row2 = photos.slice(mid);
  const ROW_H = "clamp(120px, 16vw, 220px)";
  const TILE_W = "clamp(200px, 28vw, 380px)";
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className="w-full overflow-hidden flex flex-col gap-[2px]">
        {[row1, row2].map((row, rowIdx) => (
          <div key={rowIdx} className="w-full overflow-hidden" style={{ height: ROW_H }}>
            <div
              className="flex gap-[2px] h-full"
              style={{
                width: "max-content",
                animation: `${rowIdx === 0 ? "filmScrollLeft" : "filmScrollRight"} ${rowIdx === 0 ? "35s" : "40s"} linear infinite`,
              }}
            >
              {[...row, ...row].map((photo, i) => (
                <div
                  key={`${rowIdx}-${i}`}
                  className="relative flex-shrink-0 overflow-hidden group cursor-pointer"
                  style={{ width: TILE_W, height: ROW_H }}
                  onClick={() => setLightbox(photo)}
                >
                  <Image
                    src={photo}
                    alt={getPhotoAlt(photo)}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="30vw"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer p-6"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-5xl w-full aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt={getPhotoAlt(lightbox)}
                fill
                className="object-contain"
                sizes="90vw"
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors text-xl"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---- Tickets Background Video ----
// Defers mount until in-view and catches autoplay rejection. Section itself
// already renders the poster as a background-image, so if this never plays
// the user still sees the red-strobes still.
function TicketsBackgroundVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!mount) return;
    const vid = vidRef.current;
    if (!vid) return;
    const p = vid.play();
    if (p !== undefined) p.catch(() => { /* poster background stays */ });
  }, [mount]);

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none">
      {mount && (
        <video
          ref={vidRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={VIDEOS.redStrobes.poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.15) saturate(0.4)" }}
        >
          <source src={VIDEOS.redStrobes.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

// ---- Hero Video ----
// Uses poster WebP as an IMMEDIATE background so the hero is never blank
// (iOS Low Power Mode, slow network, autoplay-blocked browsers). If the video
// plays, it fades on top of the poster. If it fails, the poster stays.
function HeroVideo() {
  const [loaded, setLoaded] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    if (vid.readyState >= 3) setLoaded(true);
    const p = vid.play();
    if (p !== undefined) {
      p.catch(() => {
        // Autoplay blocked (Low Power Mode, etc.) — keep poster showing.
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, delay: 4.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${VIDEOS.flyerAnimated.poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000",
      }}
    >
      <video
        ref={vidRef}
        autoPlay
        muted
        loop
        playsInline
        poster={VIDEOS.flyerAnimated.poster}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ filter: "brightness(0.5) contrast(1.1)" }}
        onCanPlayThrough={() => setLoaded(true)}
        onPlaying={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      >
        <source src={VIDEOS.flyerAnimated.mp4} type="video/mp4" />
      </video>
    </motion.div>
  );
}

// ---- Parallax Video Break ----
// Defers the <video> until the section is near the viewport. Until then, only
// the poster image is visible — saves ~5.5MB on initial load and keeps the
// section non-blank on iOS Low Power Mode.
function ParallaxVideoBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const smoothY = useSpring(videoY, { stiffness: 80, damping: 30 });
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-120px" });
  // Video mount flag — flipped once the section is within 400px of viewport.
  const [mountVideo, setMountVideo] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMountVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!mountVideo) return;
    const vid = vidRef.current;
    if (!vid) return;
    const p = vid.play();
    if (p !== undefined) p.catch(() => { /* autoplay blocked — poster stays */ });
  }, [mountVideo]);

  return (
    <div ref={ref} className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
      <motion.div
        style={{
          y: smoothY,
          backgroundImage: `url(${VIDEOS.davidLohlein.poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1) contrast(1.15) brightness(0.35)",
        }}
        className="absolute left-0 right-0 h-[140%] -top-[20%]"
      >
        {mountVideo && (
          <video
            ref={vidRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={VIDEOS.davidLohlein.poster}
            className="w-full h-full object-cover"
          >
            <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
          </video>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      <div ref={inViewRef} className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            animate={isInView ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p className={`${T.display} chrome-text`}>TWO DAYS.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            animate={isInView ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : {}}
            transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p className={`${T.display} chrome-text mt-2`}>MULTIPLE STAGES.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE — Vertical line draws down, milestones pop in
// ============================================================

const MILESTONES = [
  {
    year: "2021",
    title: "THE BEGINNING",
    text: "A warehouse somewhere in Brooklyn. No grand strategy. Just music that pushed boundaries and a room where people could lose themselves.",
  },
  {
    year: "2022",
    title: "THE EARLY DAYS",
    text: "Simple shows. Focused. The kind of nights where you look around and realize everyone's there for the same reason.",
  },
  {
    year: "2023",
    title: "THE COMMUNITY",
    text: "More people found their way in. The gatherings became regular. Familiar faces turned into something tangible.",
  },
  {
    year: "2024",
    title: "THE EXPANSION",
    text: "New spaces, new formats, different rooms. Artists we respected joined in. Collaborations happened organically. The sound evolved; the crowd evolved with it.",
  },
  {
    year: "2025",
    title: "THE MOVEMENT",
    text: "Nothing happened overnight. It just built, slowly and with fierce intention.",
  },
  {
    year: "2026",
    title: "THE FESTIVAL",
    text: "Industry City, Brooklyn. Two days. One indoor stage. One outdoor stage. From noon til dawn. The culmination of everything we've built.",
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
            : "w-2.5 h-2.5 bg-neutral-500 border border-neutral-600"
        }`}
      />

      {/* Horizontal connector line (desktop only) */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={`absolute top-[23px] h-[1px] hidden md:block ${
          isFinal ? "bg-[#8b0000]/30" : "bg-white/[0.06]"
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
            <p className={`${T.detail} ${isFinal ? "text-[#8b0000]" : "text-neutral-600"}`}>
              {milestone.year}
            </p>
            <h4 className={`${T.card} mt-2 mb-2 ${isFinal ? "chrome-text" : "text-neutral-200"}`}>
              {milestone.title}
            </h4>
            <p className={`${T.monoSm} text-neutral-500`}>
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
              "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.06), rgba(139,0,0,0.15))",
          }}
        />
      </motion.div>

      {/* Small starting cap */}
      <div className="absolute left-[15px] md:left-1/2 -translate-x-1/2 top-0 w-[1px] h-8 bg-gradient-to-b from-transparent to-white/15 z-0" />

      {/* Milestones */}
      {MILESTONES.map((milestone, i) => (
        <TimelineMilestone key={milestone.year} milestone={milestone} index={i} />
      ))}

      {/* Line continues past final dot → downward arrow */}
      <div className="relative mt-0 h-32 sm:h-40">
        <div
          className="absolute left-[15px] md:left-1/2 -translate-x-1/2 top-0 w-[1px] h-full"
          style={{
            background: "linear-gradient(to bottom, rgba(139,0,0,0.2), rgba(139,0,0,0.06))",
          }}
        />
        <div className="absolute left-[15px] md:left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
          <svg width="11" height="16" viewBox="0 0 11 16" fill="none" className="opacity-30">
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

// ============================================================
// ARTIST LINEUP — Grid layout with F2F/B2B pairing tags
// Uses the site's Reveal + StaggerGrid + fadeInUp system.
// ============================================================

// ---- Artist Card (restored from original grid, with modal click) ----
function ArtistCard({ artist, onClick }: { artist: Artist; onClick: (a: Artist) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);
  const isMystery = artist.name === "???";

  const handleMouseEnter = () => {
    if (artist.videoUrl && videoRef.current) {
      setHovering(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (isMystery) {
      setHovering(true);
    }
  };
  const handleMouseLeave = () => {
    if (artist.videoUrl && videoRef.current) {
      setHovering(false);
      videoRef.current.pause();
    }
    if (isMystery) {
      setHovering(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      onClick={() => onClick(artist)}
      className="cursor-pointer group"
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Frame>
        <div className="bg-[#060606]">
          <div className="aspect-[4/3] relative overflow-hidden bg-[#050505]">
            {/* Mystery artist chains background — static poster (works on Low Power Mode) */}
            {isMystery && (
              <div
                aria-hidden
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${hovering ? "opacity-[0.07]" : "opacity-0"}`}
                style={{
                  backgroundImage: `url(${VIDEOS.chainsRed.poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {/* Noise background for mystery artist */}
            {isMystery && (
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: NOISE_BG,
                  backgroundSize: "200px 200px",
                  animation: "mysteryPulse 4s ease-in-out infinite",
                }}
              />
            )}
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={`${artist.name} — ÄGAPĒ Festival 2026 artist`}
                fill
                className={`object-cover transition-all duration-700 ease-out ${
                  imgLoaded ? "opacity-70 group-hover:opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 640px) 50vw, 25vw"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                {isMystery ? (
                  <div className="flex flex-row gap-4 items-center relative z-20">
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                  </div>
                ) : (
                  <span className={`${T.label} text-white/10`}>—</span>
                )}
              </div>
            )}
            {artist.videoUrl && (
              <video
                ref={videoRef}
                src={artist.videoUrl}
                muted
                loop
                playsInline
                preload="none"
                poster={artist.imageUrl || undefined}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  hovering ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            {isMystery && <div className="absolute inset-0 border border-[#8b0000]/10 group-hover:border-[#8b0000]/30 transition-colors duration-500" />}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
            <h3 className={`${T.card} text-neutral-300 group-hover:text-white transition-colors duration-300`}>
              {artist.name}
            </h3>
            {artist.note && (
              <Frame accent={artist.note === "F2F"}>
                <span className={`${T.detail} block px-2 py-0.5 text-white ${
                  artist.note === "F2F"
                    ? "bg-[#8b0000]/15"
                    : "bg-white/[0.04]"
                } shrink-0`}>
                  {artist.note}
                </span>
              </Frame>
            )}
          </div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ---- Single inline card (no motion wrapper — used inside PairedCard) ----
function InlineCard({ artist, onClick }: { artist: Artist; onClick: (a: Artist) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);
  const isMystery = artist.name === "???";

  const handleMouseEnter = () => {
    if (artist.videoUrl && videoRef.current) {
      setHovering(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (isMystery) {
      setHovering(true);
    }
  };
  const handleMouseLeave = () => {
    if (artist.videoUrl && videoRef.current) {
      setHovering(false);
      videoRef.current.pause();
    }
    if (isMystery) {
      setHovering(false);
    }
  };

  return (
    <div
      onClick={() => onClick(artist)}
      className="cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Frame>
        <div className="bg-[#060606]">
          <div className="aspect-[4/3] relative overflow-hidden bg-[#050505]">
            {/* Mystery artist chains background — static poster */}
            {isMystery && (
              <div
                aria-hidden
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${hovering ? "opacity-[0.07]" : "opacity-0"}`}
                style={{
                  backgroundImage: `url(${VIDEOS.chainsRed.poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {/* Noise background for mystery artist */}
            {isMystery && (
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: NOISE_BG,
                  backgroundSize: "200px 200px",
                  animation: "mysteryPulse 4s ease-in-out infinite",
                }}
              />
            )}
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={`${artist.name} — ÄGAPĒ Festival 2026 artist`}
                fill
                className={`object-cover transition-all duration-700 ease-out ${
                  imgLoaded ? "opacity-70 group-hover:opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 640px) 50vw, 25vw"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                {isMystery ? (
                  <div className="flex flex-row gap-4 items-center relative z-20">
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                    <span className={`${orbitron.className} text-5xl font-black tracking-[0.15em] text-[#ff0000]/70 group-hover:text-[#ff0000]/90 transition-colors duration-500`}>
                      ?
                    </span>
                  </div>
                ) : (
                  <span className={`${T.label} text-white/10`}>—</span>
                )}
              </div>
            )}
            {artist.videoUrl && (
              <video
                ref={videoRef}
                src={artist.videoUrl}
                muted
                loop
                playsInline
                preload="none"
                poster={artist.imageUrl || undefined}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  hovering ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            {isMystery && <div className="absolute inset-0 border border-[#8b0000]/10 group-hover:border-[#8b0000]/30 transition-colors duration-500" />}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
            <h3 className={`${T.card} text-neutral-300 group-hover:text-white transition-colors duration-300`}>
              {artist.name}
            </h3>
          </div>
        </div>
      </Frame>
    </div>
  );
}

// ---- Paired F2F/B2B Card — two artists side by side with bridging tag ----
function PairedCard({
  artistA,
  artistB,
  tag,
  onClick,
}: {
  artistA: Artist;
  artistB: Artist;
  tag: string;
  onClick: (a: Artist) => void;
}) {
  return (
    <motion.div variants={fadeInUp} className="col-span-2 grid grid-cols-2 relative">
      <InlineCard artist={artistA} onClick={onClick} />
      <InlineCard artist={artistB} onClick={onClick} />
      {/* Bridging tag on the divider */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10 flex items-center pointer-events-none">
        <Frame accent={tag === "F2F"}>
          <span
            className={`${orbitron.className} block px-2.5 py-1.5 text-[10px] sm:text-xs font-bold tracking-[0.12em] whitespace-nowrap ${
              tag === "F2F"
                ? "bg-[#8b0000]/40 text-white"
                : "bg-white/[0.06] backdrop-blur-sm text-white"
            }`}
          >
            {tag}
          </span>
        </Frame>
      </div>
    </motion.div>
  );
}

// ---- B2B2B Mystery Element — full-width at bottom of grid ----
function B2B2BMystery({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={fadeInUp}
      className="col-span-2 lg:col-span-4 cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Frame>
        <div className="relative h-36 sm:h-44 overflow-hidden bg-[#050505]">
          {/* Chain background — static poster (works on Low Power Mode) */}
          <div
            aria-hidden
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${hovered ? "opacity-[0.07]" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${VIDEOS.chainsRed.poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Animated noise background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: NOISE_BG,
              backgroundSize: "200px 200px",
              animation: "mysteryPulse 4s ease-in-out infinite",
            }}
          />
          <div className="absolute inset-0 border border-[#8b0000]/10 group-hover:border-[#8b0000]/30 transition-colors duration-500" />
          <div className="absolute inset-0 flex items-center justify-center gap-6 sm:gap-10">
            <p
              className={`${orbitron.className} text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.15em] text-[#8b0000]/30 group-hover:text-[#8b0000]/50 transition-colors duration-500`}
              style={{ animation: "mysteryGlow 3s ease-in-out infinite" }}
            >
              B2B2B
            </p>
            <div className="flex flex-col items-center">
              <p className={`${orbitron.className} text-base sm:text-lg text-neutral-600 tracking-[0.3em]`}>
                ???
              </p>
              <p className={`${T.detail} text-neutral-700 mt-1`}>TO BE REVEALED</p>
            </div>
          </div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ---- Artist Detail Modal ----
const BIO_TRUNCATE_LEN = 180;

function ArtistModal({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [infoHeight, setInfoHeight] = useState(0);

  const bioIsLong = artist.bio.length > BIO_TRUNCATE_LEN;
  const truncatedBio = bioIsLong
    ? artist.bio.slice(0, BIO_TRUNCATE_LEN).replace(/\s+\S*$/, "") + "..."
    : artist.bio;

  const handleCollapse = () => setBioExpanded(false);

  // Measure the collapsed info section so expanded panel starts at exact same height
  useEffect(() => {
    if (infoRef.current) {
      setInfoHeight(infoRef.current.offsetHeight);
    }
  }, [truncatedBio]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Video readiness + autoplay fallback. If autoplay is blocked (iOS Low Power
  // Mode), videoLoaded stays false and the poster image stays visible.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.readyState >= 3) setVideoLoaded(true);
    const p = vid.play();
    if (p !== undefined) p.catch(() => { /* poster stays visible */ });
  }, [artist.videoUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative w-[90vw] max-w-2xl max-h-[85vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 ${T.label} text-neutral-500 hover:text-white transition-colors`}
        >
          CLOSE ×
        </button>

        {/* Video / image area */}
        {artist.videoUrl ? (
          <div className="aspect-[16/9] relative overflow-hidden bg-black">
            {artist.imageUrl && (
              <Image
                src={artist.imageUrl}
                alt={`${artist.name} — ÄGAPĒ Festival 2026 artist`}
                fill
                className={`object-cover transition-opacity duration-500 ${videoLoaded ? "opacity-0" : "opacity-70"}`}
                sizes="90vw"
              />
            )}
            <video
              ref={videoRef}
              src={artist.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={artist.imageUrl || undefined}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
              onCanPlayThrough={() => setVideoLoaded(true)}
              onPlaying={() => setVideoLoaded(true)}
            />
          </div>
        ) : artist.imageUrl ? (
          <div className="aspect-[16/9] relative overflow-hidden">
            <Image
              src={artist.imageUrl}
              alt={`${artist.name} — ÄGAPĒ Festival 2026 artist`}
              fill
              className="object-cover"
              sizes="90vw"
            />
          </div>
        ) : artist.name === "???" ? (
          <div className="aspect-[16/9] relative overflow-hidden bg-black flex items-center justify-center">
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundImage: `url(${VIDEOS.chainsRed.poster})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: NOISE_BG,
                backgroundSize: "200px 200px",
                animation: "mysteryPulse 4s ease-in-out infinite",
              }}
            />
            <p className={`${orbitron.className} relative z-10 text-6xl font-bold text-[#8b0000]/40`}>???</p>
          </div>
        ) : null}

        {/* Info area — collapsed: expand chevron + name + truncated bio */}
        <div ref={infoRef} className="p-6 sm:p-8">
          {/* Expand chevron — centered, text under chevron */}
          {bioIsLong && !bioExpanded && (
            <button
              onClick={() => setBioExpanded(true)}
              className="expand-hint flex flex-col items-center w-full mb-4 text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M5 13L10 8L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={`${T.detail} text-[9px] mt-1`}>EXPAND</span>
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <h3 className={`${T.heading} text-white text-xl sm:text-2xl`}>{artist.name}</h3>
            {artist.note && (
              <Frame accent={artist.note === "F2F"}>
                <span className={`${T.detail} block px-2 py-0.5 text-white ${
                  artist.note === "F2F"
                    ? "bg-[#8b0000]/15"
                    : "bg-white/[0.04]"
                }`}>
                  {artist.note}
                </span>
              </Frame>
            )}
          </div>
          <p className={`${T.monoSm} text-neutral-500`}>{truncatedBio}</p>
        </div>

        {/* Expanded bio — slides up from info section, collapses instantly */}
        {bioExpanded && (
          <motion.div
            initial={{ height: infoHeight || "35%" }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Collapse chevron */}
            <button
              onClick={handleCollapse}
              className="flex-shrink-0 flex flex-col items-center w-full pt-6 pb-2 text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={`${T.detail} text-[9px] mt-1`}>COLLAPSE</span>
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <h3 className={`${T.heading} text-white text-xl sm:text-2xl`}>{artist.name}</h3>
                {artist.note && (
                  <Frame accent={artist.note === "F2F"}>
                    <span className={`${T.detail} block px-2 py-0.5 text-white ${
                      artist.note === "F2F"
                        ? "bg-[#8b0000]/15"
                        : "bg-white/[0.04]"
                    }`}>
                      {artist.note}
                    </span>
                  </Frame>
                )}
              </div>
              <p className={`${T.monoSm} text-neutral-400 leading-relaxed`}>{artist.bio}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---- B2B2B Modal (mystery) ----
function B2B2BModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative w-[90vw] max-w-lg bg-[#0a0a0a] border border-white/[0.06] p-8 sm:p-12 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chain background — static poster, animated in with modal */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url(${VIDEOS.chainsRed.poster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-[1]">
          <button
            onClick={onClose}
            className={`absolute top-0 right-0 z-10 ${T.label} text-neutral-500 hover:text-white transition-colors`}
          >
            CLOSE ×
          </button>
          <p className={`${orbitron.className} text-5xl font-bold text-[#8b0000]/40 mb-4`}>B2B2B</p>
          <p className={`${T.label} text-[#8b0000]/50 mb-3`}>???</p>
          <p className={`${T.monoSm} text-neutral-500`}>
            Three artists. One decks setup. The closing act of ÄGAPĒ FESTIVAL has not yet been announced.
            Stay tuned.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Helper: group artists into render items (solo, paired, b2b2b) ----
type RenderItem =
  | { type: "solo"; artist: Artist }
  | { type: "pair"; artistA: Artist; artistB: Artist; tag: string };

function buildRenderItems(artists: Artist[]): RenderItem[] {
  const items: RenderItem[] = [];
  let i = 0;
  while (i < artists.length) {
    const a = artists[i];
    const b = i + 1 < artists.length ? artists[i + 1] : null;
    // Check for pair (F2F or B2B) — either artist in pair has the tag
    const pairNote = a.note === "F2F" || a.note === "B2B"
      ? a.note
      : b && (b.note === "F2F" || b.note === "B2B")
        ? b.note
        : null;
    if (pairNote && b) {
      items.push({ type: "pair", artistA: a, artistB: b, tag: pairNote });
      i += 2;
      continue;
    }
    // Solo
    items.push({ type: "solo", artist: a });
    i++;
  }
  return items;
}

// ---- Lineup Section ----
function Lineup() {
  const stages = getStages();
  const totalArtists = stages.reduce((a, s) => a + s.artists.length, 0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showB2B2B, setShowB2B2B] = useState(false);

  return (
    <>
      <section id="artists" className={`${S.section} ${S.px} bg-black/70`}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <motion.div variants={fadeInUp}>
              <Label num="01" text="LINEUP" />
            </motion.div>
            <motion.h2 variants={fadeInUp} className={`${T.heading} chrome-text ${S.labelGap}`}>
              THE LINEUP
            </motion.h2>
            <motion.div variants={fadeInUp}>
              <HeadingLine />
            </motion.div>
            <motion.p variants={fadeInUp} className={`${T.body} text-neutral-600 mt-4`}>
              {totalArtists} ARTISTS · 2 DAYS · MULTIPLE STAGES
            </motion.p>
          </Reveal>

          {stages.map((stage, stageIdx) => {
            const renderItems = buildRenderItems(stage.artists);
            const isDay2Indoor = stage.day === 2 && stage.stage === "indoor";
            return (
              <div key={`${stage.day}-${stage.stage}`} id={`stage-${stage.day}-${stage.stage}`} data-host={stage.host} className={stageIdx > 0 ? "mt-20" : "mt-12"}>
                {stageIdx > 0 && <div className="mb-12"><SectionLine /></div>}
                <Reveal>
                  <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
                    <div
                      className="h-[1px] flex-1"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }}
                    />
                    <div className="text-center shrink-0">
                      <p className={`${T.detail} text-neutral-600 mb-1.5`}>
                        {stage.dayLabel.toUpperCase()}
                      </p>
                      <p className={`${T.card} text-neutral-500`}>
                        {stage.stage.toUpperCase()} STAGE
                        <span className="text-neutral-600 ml-2">— {stage.host}</span>
                      </p>
                    </div>
                    <div
                      className="h-[1px] flex-1"
                      style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }}
                    />
                  </motion.div>
                </Reveal>

                <StaggerGrid className={`grid grid-cols-2 lg:grid-cols-4 ${S.gridGap}`}>
                  {renderItems.map((item, idx) => {
                    if (item.type === "pair") {
                      return (
                        <PairedCard
                          key={`pair-${item.artistA.name}-${item.artistB.name}`}
                          artistA={item.artistA}
                          artistB={item.artistB}
                          tag={item.tag}
                          onClick={setSelectedArtist}
                        />
                      );
                    }
                    return (
                      <ArtistCard
                        key={item.artist.name + idx}
                        artist={item.artist}
                        onClick={setSelectedArtist}
                      />
                    );
                  })}
                  {isDay2Indoor && (
                    <B2B2BMystery key="b2b2b" onClick={() => setShowB2B2B(true)} />
                  )}
                </StaggerGrid>
              </div>
            );
          })}
        </div>
      </section>

      {/* Artist detail modal */}
      <AnimatePresence>
        {selectedArtist && (
          <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
        )}
      </AnimatePresence>

      {/* B2B2B mystery modal */}
      <AnimatePresence>
        {showB2B2B && (
          <B2B2BModal onClose={() => setShowB2B2B(false)} />
        )}
      </AnimatePresence>
    </>
  );
}


// ============================================================
// FAQ Section
// Single-open accordion. Questions in white, answers in muted grey.
// Numbering and Frame motif match the rest of the site.
// ============================================================
interface FaqEntry {
  q: string;
  a: ReactNode;
}

const FAQ_ITEMS: FaqEntry[] = [
  {
    q: "What are the festival hours?",
    a: "Doors open at 12pm noon on both days and run until 6am the following morning.",
  },
  {
    q: "Is there reentry?",
    a: "Yes. GA ticket holders can exit and reenter throughout the day with their wristband or ticket scan.",
  },
  {
    q: "What is the difference between a single day ticket and a bundle?",
    a: "Single day tickets give you access to one day of your choice — September 5 or September 6. A 2 day bundle gives you access to both days at a discounted rate.",
  },
  {
    q: "Where is the festival?",
    a: "Industry City, Brooklyn, NYC. Address: 220 36th St, Brooklyn, NY 11232.",
  },
  {
    q: "What time should I arrive?",
    a: "Doors open at 12pm. We recommend arriving early to avoid queues, especially on Day 2.",
  },
  {
    q: "Is there an age limit?",
    a: "Yes. ÄGAPĒ Festival is a 21+ event. Valid government-issued ID is required at entry.",
  },
  {
    q: "What stages are there?",
    a: "Two stages — one indoor and one outdoor. Day 1 features the Hot Meal outdoor stage and the Face 2 Face indoor stage. Day 2 features 44 Label Group taking over both stages.",
  },
  {
    q: "Can I get a discount on tickets?",
    a: "Yes — use code AGAPE at checkout for 15% off your tickets.",
  },
  {
    q: "Are tickets refundable?",
    a: "Tickets are non-refundable but transferable. You can transfer your ticket to someone else if your plans change.",
  },
  {
    q: "What should I bring?",
    a: "Valid government-issued ID (21+ event), your ticket QR code or confirmation email, and comfortable shoes. No professional cameras or outside drinks.",
  },
  {
    q: "Will there be lockers?",
    a: "Yes. Locker rentals will be available on site both days for a small fee. We recommend booking in advance as they are limited. Details on how to reserve yours will be shared closer to the event date.",
  },
  {
    q: "How do I get there?",
    a: (
      <>
        Industry City is accessible by subway, car and rideshare. Full directions and a map link are in the{" "}
        <a
          href="#getting-here"
          onClick={(e) => {
            e.preventDefault();
            const el = document.querySelector("#getting-here");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="underline underline-offset-4 decoration-white/30 text-neutral-300 hover:text-white hover:decoration-white transition-colors"
        >
          Getting Here section below
        </a>
        .
      </>
    ),
  },
  {
    q: "Who do I contact for press or partnerships?",
    a: "Email bookings@agapemusic.us for press, partnership and sponsorship inquiries.",
  },
];

function FaqRow({
  entry,
  index,
  isOpen,
  onToggle,
}: {
  entry: FaqEntry;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-4 sm:gap-6 py-6 sm:py-7 text-left group transition-colors duration-300 hover:bg-white/[0.015]"
      >
        <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
          <span className={`${T.detail} text-[#8b0000]/60 flex-shrink-0`}>
            {num}
          </span>
          <span
            className={`${orbitron.className} text-[13px] sm:text-[15px] font-bold tracking-[0.04em] text-white leading-snug`}
          >
            {entry.q}
          </span>
        </div>
        <span
          className={`flex-shrink-0 ml-2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-neutral-500 group-hover:text-white transition-all duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5V14.5M1.5 8H14.5"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="overflow-hidden"
          >
            <div className="pb-7 sm:pb-8 pl-10 sm:pl-14 pr-6 sm:pr-10">
              <p className={`${T.monoSm} text-neutral-500`}>{entry.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id="faq" className={`${S.section} ${S.px} bg-black/70`}>
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <motion.div variants={fadeInUp}>
            <Label num="03" text="FAQ" />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className={`${T.heading} chrome-text ${S.labelGap}`}
          >
            FREQUENTLY ASKED
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <HeadingLine />
          </motion.div>
          <motion.p
            variants={fadeInUp}
            className={`${T.monoSm} text-neutral-500 max-w-2xl -mt-4 mb-12`}
          >
            Everything you need to know before the gates open. Still have
            questions?{" "}
            <a
              href={`mailto:${FESTIVAL.contactEmail}`}
              className="text-neutral-300 underline underline-offset-4 decoration-white/20 hover:text-white transition-colors"
            >
              {FESTIVAL.contactEmail}
            </a>
            .
          </motion.p>
        </Reveal>

        <Reveal className="max-w-3xl mx-auto">
          <motion.div variants={fadeInUp}>
            <Frame>
              <div className="px-5 sm:px-10 lg:px-12 bg-black/40">
                {FAQ_ITEMS.map((entry, i) => (
                  <FaqRow
                    key={i}
                    entry={entry}
                    index={i}
                    isOpen={openIndex === i}
                    onToggle={() =>
                      setOpenIndex(openIndex === i ? null : i)
                    }
                  />
                ))}
              </div>
            </Frame>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// GETTING HERE Section
// All transit facts sourced from industrycity.com/visit + MTA.
// No invented details — Google Maps embed is the authoritative
// routing source for users.
// ============================================================
function SubwayBullet({
  line,
  color,
  textColor = "#fff",
}: {
  line: string;
  color: string;
  textColor?: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-bold"
      style={{
        backgroundColor: color,
        color: textColor,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
      aria-label={`${line} train`}
    >
      {line}
    </span>
  );
}

function GettingHere() {
  // Universal Google Maps directions deeplink — opens native app on mobile,
  // Maps in browser on desktop. Routing is Google's, not ours.
  const mapsDirectionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=220+36th+St+Brooklyn+NY+11232";
  // No-API-key embed. Inverted to fit the dark aesthetic.
  const mapEmbedUrl =
    "https://maps.google.com/maps?q=220+36th+St+Brooklyn+NY+11232&output=embed";

  return (
    <section
      id="getting-here"
      className={`${S.section} ${S.px} bg-black/70 scroll-mt-20`}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <Reveal>
          <motion.div variants={fadeInUp}>
            <Label num="04" text="GETTING HERE" />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className={`${T.heading} chrome-text ${S.labelGap}`}
          >
            FIND YOUR WAY IN
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <HeadingLine />
          </motion.div>
          <motion.p
            variants={fadeInUp}
            className={`${T.monoSm} text-neutral-500 max-w-2xl -mt-4 mb-12`}
          >
            Industry City sits in Sunset Park, Brooklyn. Easy by subway, car,
            or rideshare — pick your route and we'll see you at the door.
          </motion.p>
        </Reveal>

        {/* Map + Address + Primary CTA */}
        <Reveal className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp}>
            <Frame>
              <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-black overflow-hidden">
                <iframe
                  src={mapEmbedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  style={{
                    filter:
                      "invert(0.92) hue-rotate(180deg) saturate(0.4) contrast(0.9) brightness(0.85)",
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Industry City — 220 36th Street, Brooklyn, NY"
                />
              </div>
            </Frame>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <p className={`${T.label} text-neutral-600`}>ADDRESS</p>
              <p
                className={`${orbitron.className} text-base sm:text-lg font-bold tracking-[0.04em] text-white mt-2`}
              >
                220 36th Street
              </p>
              <p className={`${T.monoSm} text-neutral-500 mt-1`}>
                Brooklyn, NY 11232
              </p>
            </div>
            {/* Dim red — F2F joiner tag styling. Intentionally less bright
                than the GET TICKETS button so it doesn't compete visually. */}
            <Frame accent className="inline-block">
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 sm:px-10 py-4 bg-[#8b0000]/40 hover:bg-[#8b0000]/55 backdrop-blur-sm transition-colors duration-300"
              >
                <span
                  className={`${orbitron.className} text-[12px] sm:text-[13px] tracking-[0.3em] font-semibold text-white`}
                >
                  OPEN IN GOOGLE MAPS →
                </span>
              </a>
            </Frame>
          </motion.div>
        </Reveal>

        {/* Three transit cards */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-16 max-w-5xl mx-auto">
          {/* SUBWAY */}
          <motion.div variants={fadeInUp}>
            <Frame className="h-full">
              <div className="p-6 sm:p-8 h-full bg-black/40 flex flex-col">
                <p className={`${T.label} text-neutral-600`}>SUBWAY</p>
                <div className="flex items-center gap-2 mt-5">
                  <SubwayBullet line="D" color="#FF6319" />
                  <SubwayBullet line="N" color="#FCCC0A" textColor="#000" />
                  <SubwayBullet line="R" color="#FCCC0A" textColor="#000" />
                </div>
                <p
                  className={`${orbitron.className} text-sm font-bold tracking-[0.04em] text-white mt-6`}
                >
                  36th St Station
                </p>
                <p className={`${T.monoSm} text-neutral-500 mt-3`}>
                  Exit at 3rd Ave / 36th St — about a five-minute walk to the
                  venue entrance.
                </p>
              </div>
            </Frame>
          </motion.div>

          {/* DRIVE */}
          <motion.div variants={fadeInUp}>
            <Frame className="h-full">
              <div className="p-6 sm:p-8 h-full bg-black/40 flex flex-col">
                <p className={`${T.label} text-neutral-600`}>DRIVE</p>
                <p
                  className={`${orbitron.className} text-sm font-bold tracking-[0.05em] text-white mt-5`}
                >
                  I-278 W (BQE), EXIT 23
                </p>
                <p className={`${T.monoSm} text-neutral-500 mt-4`}>
                  On-site parking available at Lots B + C, entered from 2nd Ave
                  + 37th St. Advance booking recommended.
                </p>
              </div>
            </Frame>
          </motion.div>

          {/* RIDESHARE */}
          <motion.div variants={fadeInUp}>
            <Frame className="h-full">
              <div className="p-6 sm:p-8 h-full bg-black/40 flex flex-col">
                <p className={`${T.label} text-neutral-600`}>RIDESHARE</p>
                <p
                  className={`${orbitron.className} text-sm font-bold tracking-[0.05em] text-white mt-5`}
                >
                  DROP-OFF
                </p>
                <p className={`${T.monoSm} text-neutral-500 mt-4`}>
                  Set your Uber or Lyft destination to{" "}
                  <span className="text-neutral-300">
                    220 36th St, Brooklyn, NY 11232
                  </span>{" "}
                  — the main entrance.
                </p>
              </div>
            </Frame>
          </motion.div>
        </StaggerGrid>

        {/* Secondary: bus + Citi Bike */}
        <Reveal className="mt-12">
          <motion.div
            variants={fadeInUp}
            className="max-w-5xl mx-auto text-center"
          >
            <p className={`${T.detail} text-neutral-600 leading-relaxed`}>
              ALSO ACCESSIBLE BY{" "}
              <span className="text-neutral-400">B35 · B37 · B70 · SIM</span>{" "}
              BUSES
              <span className="mx-3 opacity-40">·</span>
              CITI BIKE STATIONS ON 2ND AVE + 32 / 37 / 39 ST AND 3RD AVE + 36
              ST
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ---- Nav Links — all site sections for the dropdown menu ----
const NAV_LINKS = [
  { label: "TOP", href: "#hero" },
  { label: "LINEUP", href: "#artists" },
  { label: "TICKETS", href: "#tickets" },
  { label: "FAQ", href: "#faq" },
  { label: "GETTING HERE", href: "#getting-here" },
  { label: "ABOUT", href: "#about" },
  { label: "PARTNERS", href: "#partners" },
];

// ============================================================
// MAIN PAGE
// ============================================================
export default function Trajectory() {
  const [isClient, setIsClient] = useState(false);
  // Heavy 3D canvas: skip entirely on mobile, reduced-motion, or coarse
  // pointer devices. Decided once on mount to avoid mount/unmount churn.
  const [enable3D, setEnable3D] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [overTickets, setOverTickets] = useState(false);
  const [activeStageHost, setActiveStageHost] = useState<string | null>(null);
  const [topNavReady, setTopNavReady] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const ticketsSectionRef = useRef<HTMLElement>(null);
  const ticketBtnRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.8, 1, 0.7, 0.5]);

  useEffect(() => {
    setIsClient(true);
    // 3D canvas runs everywhere except when the user has asked for less motion.
    // Mobile/coarse pointer is OK — Canvas is already tuned with low-power GL,
    // reduced torus segments, and 120 particles.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnable3D(!reducedMotion);
    const topNavTimer = setTimeout(() => setTopNavReady(true), 6800);
    let rafId = 0;

    // Cache stage DOM refs once instead of re-querying on every scroll tick.
    const stageIds = ["stage-1-outdoor", "stage-1-indoor", "stage-2-outdoor", "stage-2-indoor"];
    const stageEls = stageIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // Show navbar after scrolling past hero
        if (heroRef.current) {
          const heroBottom = heroRef.current.getBoundingClientRect().bottom;
          setPastHero(heroBottom < 100);
        }
        // Hide buy button when >50% of tickets section is in viewport
        if (ticketsSectionRef.current) {
          const rect = ticketsSectionRef.current.getBoundingClientRect();
          const visibleTop = Math.max(rect.top, 0);
          const visibleBottom = Math.min(rect.bottom, window.innerHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const sectionHeight = rect.height;
          setOverTickets(sectionHeight > 0 && visibleHeight / sectionHeight > 0.8);
        }
        // Swap navbar logo to stage host brand when scrolling through lineup.
        // Uses viewport-fill ratio so tall mobile sections still trigger.
        const vh = window.innerHeight;
        let bestHost: string | null = null;
        let bestVis = 0;
        for (const el of stageEls) {
          const r = el.getBoundingClientRect();
          const vTop = Math.max(r.top, 0);
          const vBot = Math.min(r.bottom, vh);
          const vis = Math.max(0, vBot - vTop);
          if (vis > bestVis) {
            bestVis = vis;
            bestHost = el.getAttribute("data-host");
          }
        }
        // Show host logo when a stage section fills ≥20% of viewport
        setActiveStageHost(bestVis > vh * 0.2 ? bestHost : null);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(topNavTimer);
    };
  }, []);

  // Bounce the ticket button every time it enters the viewport
  useEffect(() => {
    const btn = ticketBtnRef.current;
    if (!btn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          btn.classList.add("ticket-attention");
        } else {
          btn.classList.remove("ticket-attention");
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  const stages = getStages();
  const totalArtists = stages.reduce((a, s) => a + s.artists.length, 0);

  return (
    <div className={`${outfit.className} min-h-screen bg-black text-white relative`}>
      {/* Skip-to-content — keyboard/screen reader only */}
      <a href="#artists" className="skip-link">Skip to lineup</a>

      {/* ===== FIXED 3D PARALLAX BACKGROUND =====
          Runs on every device except prefers-reduced-motion. Canvas is tuned
          with low-power GL, half-resolution segments, and antialias off. */}
      {isClient && enable3D && (
        <motion.div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ y: canvasY, opacity: canvasOpacity }}
        >
          <CanvasErrorBoundary>
            <Suspense fallback={null}>
              <Canvas
                camera={{ position: [0, 0, 7], fov: 55 }}
                dpr={[1, 1.5]}
                frameloop="always"
                gl={{ powerPreference: "low-power", antialias: false }}
              >
                <ParallaxScene />
              </Canvas>
            </Suspense>
          </CanvasErrorBoundary>
        </motion.div>
      )}

      {/* ===== TOP NAV — visible during hero, slides up out of frame ===== */}
      <AnimatePresence>
        {topNavReady && !pastHero && (
          <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-transparent"
          >
            <div className={`max-w-[1400px] mx-auto ${S.px} py-5 flex items-center justify-between`}>
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#hero");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-3 group"
              >
                <Image
                  src={LOGOS.agapeWhite}
                  alt="ÄGAPĒ Festival logo"
                  width={18}
                  height={18}
                  className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                />
              </a>
              {/* Desktop: horizontal section labels */}
              <div className="hidden md:flex items-center gap-4 sm:gap-10">
                {NAV_LINKS.filter((l) => l.label !== "TOP").map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.querySelector(link.href);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`${orbitron.className} text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] text-neutral-600 hover:text-white transition-colors duration-300`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Mobile: hamburger button + drop-down menu.
                  Reuses the bottom-nav hamburger styling so it reads as the
                  same affordance, just placed at the top. */}
              <div className="md:hidden relative">
                <button
                  type="button"
                  onClick={() => setTopMenuOpen(!topMenuOpen)}
                  aria-label="Toggle menu"
                  aria-expanded={topMenuOpen}
                  className="flex flex-col gap-[4px] p-2.5"
                >
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${topMenuOpen ? "rotate-45 translate-y-[2.5px]" : ""}`} />
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 ${topMenuOpen ? "opacity-0 scale-0" : ""}`} />
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${topMenuOpen ? "-rotate-45 -translate-y-[2.5px]" : ""}`} />
                </button>

                <AnimatePresence>
                  {topMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                      className="absolute top-full right-0 mt-3 overflow-hidden"
                    >
                      <Frame>
                        <div className="bg-black/90 backdrop-blur-xl border border-white/[0.06] flex flex-col items-end gap-5 py-6 px-8 min-w-[180px]">
                          {NAV_LINKS.filter((l) => l.label !== "TOP").map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              onClick={(e) => {
                                e.preventDefault();
                                const target = link.href;
                                setTopMenuOpen(false);
                                setTimeout(() => {
                                  const el = document.querySelector(target);
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }, 350);
                              }}
                              className={`${T.label} text-neutral-500 hover:text-white transition-colors duration-300 whitespace-nowrap`}
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </Frame>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ===== FLOATING BOTTOM NAVIGATION ===== */}
      <AnimatePresence>
        {pastHero && (
          <motion.nav
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 left-4 right-4 sm:left-6 sm:right-6 lg:left-10 lg:right-10 z-50"
          >
            {/* Dropup menu — expands upward, anchored to right side */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mb-2 flex justify-end"
                >
                  <Frame>
                    <div className="bg-black/90 backdrop-blur-xl border border-white/[0.06] flex flex-col items-center gap-5 py-6 px-14">
                      {NAV_LINKS.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            const target = link.href;
                            setMenuOpen(false);
                            setTimeout(() => {
                              const el = document.querySelector(target);
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }, 350);
                          }}
                          className={`${T.label} text-neutral-500 hover:text-white transition-colors duration-300`}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </Frame>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main floating bar: [LOGO] ——— [GET TICKETS] ——— [HAMBURGER] */}
            <Frame>
              <div className="bg-black/85 backdrop-blur-xl border border-white/[0.06] relative flex items-center justify-between py-2.5 px-3 sm:px-4">
                {/* Left — Logo (swaps to stage host brand when scrolling lineup) */}
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector("#hero");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="p-2.5 group relative h-10 w-20 flex items-center z-10"
                >
                  {/* All logos pre-rendered and crossfaded — no mount/unmount delay */}
                  <div className="relative h-5 w-full">
                    {/* Default Agape logo */}
                    <Image
                      src={LOGOS.agapeWhite}
                      alt="ÄGAPĒ Festival logo"
                      width={16}
                      height={16}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${!activeStageHost ? "opacity-50 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
                    />
                    {/* Stage host logos — always mounted, toggled via opacity */}
                    {Object.entries(STAGE_LOGOS).map(([host, src]) => (
                      <Image
                        key={host}
                        src={src}
                        alt={`${host} logo`}
                        width={80}
                        height={40}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-auto object-contain transition-opacity duration-200 ${host === "Face 2 Face" ? "h-5" : "h-4"} ${activeStageHost === host ? "opacity-70 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
                      />
                    ))}
                  </div>
                </a>

                {/* Center — Buy Tickets / Festival logo (absolutely centered, out of flex flow) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    {!overTickets ? (
                      <motion.div
                        key="tickets-btn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="pointer-events-auto"
                      >
                        <div className="ticket-wrap">
                          <Frame accent>
                            <a
                              href={FESTIVAL.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ticket-btn flex items-center justify-center bg-[#8b0000] hover:bg-[#a00000] transition-all duration-300 px-10 sm:px-12 h-[38px] whitespace-nowrap"
                            >
                              <span className={`${orbitron.className} text-[11px] tracking-[0.3em] font-semibold text-white transition-colors duration-300 translate-y-[0.5px]`}>
                                GET TICKETS
                              </span>
                            </a>
                          </Frame>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tickets-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Image
                          src={LOGOS.festivalWhiteTransparent}
                          alt="ÄGAPĒ Festival logo"
                          width={60}
                          height={32}
                          className="opacity-20 h-5 w-auto"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right — Hamburger menu */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex flex-col gap-[4px] p-2.5 z-10"
                  aria-label="Toggle menu"
                >
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[2.5px]" : ""}`} />
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 ${menuOpen ? "opacity-0 scale-0" : ""}`} />
                  <span className={`block w-4 h-[1px] bg-neutral-400 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[2.5px]" : ""}`} />
                </button>
              </div>
            </Frame>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* All content above the 3D background */}
      <div className="relative z-10">

        {/* ===== HERO — CINEMATIC INTRO ===== */}
        <section ref={heroRef} id="hero" className="relative h-screen w-full overflow-hidden bg-black">
          <h1 className="sr-only">ÄGAPĒ Festival 2026 — Brooklyn Techno Festival, September 5-6 at Industry City</h1>
          <HeroVideo />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4.8 }}
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black pointer-events-none"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[2] px-6">

            {/* 1. Vertical line descends */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 140 }}
              transition={{ duration: 1.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px]"
              style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), #fff)" }}
            />

            {/* 2. Location text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
              className="mb-8"
            >
              <Frame className="inline-block">
                <p className={`${T.bodySm} text-neutral-500 px-4 py-1.5`}>
                  BROOKLYN &nbsp; NEW YORK
                </p>
              </Frame>
            </motion.div>

            {/* 3. Logo icon morph */}
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
                  alt="ÄGAPĒ logo"
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
              >
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt="ÄGAPĒ Festival 2026 logo"
                  width={540}
                  height={540}
                  className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[540px] h-auto"
                  priority
                />
              </motion.div>
            </div>

            {/* 5. Horizontal divider — line motif */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 4.2, ease: "easeOut" }}
              className="h-[1px] bg-white mt-10 mb-10"
            />

            {/* 6. Date & venue — typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 4.6 }}
              className="flex flex-col items-center gap-3"
            >
              <TypewriterReveal
                text="SEPTEMBER 5 + 6, 2026"
                className={`${T.mono} text-neutral-300 text-center`}
                speed={35}
                trigger={true}
                delay={4700}
              />
              <TypewriterReveal
                text="INDUSTRY CITY — BROOKLYN, NYC"
                className={`${T.monoSm} text-neutral-500 text-center`}
                speed={25}
                trigger={true}
                delay={5500}
              />
              <TypewriterReveal
                text={`DOORS ${FESTIVAL.hours}`}
                className={`${T.detail} text-neutral-600 text-center mt-1`}
                speed={25}
                trigger={true}
                delay={6300}
              />
            </motion.div>

            {/* 7. CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4 }}
              className="mt-14"
            >
              <div className="ticket-wrap">
                <Frame accent className="inline-block">
                  <a
                    href={FESTIVAL.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ticket-btn block px-16 py-5 bg-[#8b0000] hover:bg-[#a00000] transition-all duration-300 group"
                  >
                    <span className={`${orbitron.className} text-[13px] tracking-[0.3em] font-semibold text-white transition-colors duration-300`}>
                      GET TICKETS
                    </span>
                  </a>
                </Frame>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== MARQUEE TICKER ===== */}
        <div className="-mt-px py-4 border-y border-white/[0.06] bg-black/60 backdrop-blur-md">
          <Marquee speed={25}>
            {[
              "ÄGAPE FESTIVAL 2026",
              "SEPTEMBER 5 + 6",
              "INDUSTRY CITY — BROOKLYN",
              "2 DAYS — MULTIPLE STAGES",
              `${totalArtists} ARTISTS`,
            ].map((t, i) => (
              <span key={i} className="flex items-center">
                <span className={`${T.label} text-neutral-600 mx-8`}>{t}</span>
                <img src={LOGOS.agapeWhiteSm} alt="" width={20} height={20} loading="lazy" decoding="async" className="h-5 w-5 mx-2 opacity-40 object-contain" />
              </span>
            ))}
          </Marquee>
        </div>

        {/* ===== FLYER + SALES COPY ("A STACKED WEEKEND") ===== */}
        <section className={`${S.compact} ${S.px} bg-black/60`}>
          <div className="max-w-[1400px] mx-auto">
            <div className={`relative grid grid-cols-1 lg:grid-cols-2 ${S.contentGap} items-center`}>
              {/* Vertical line between columns — line motif */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 hidden lg:block pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
                }}
              />

              <Reveal>
                <motion.div variants={fadeInUp} className="max-w-md">
                  <Frame>
                    <Image
                      src={`${BASE_PATH}/assets/1000x1778.avif`}
                      alt="ÄGAPĒ Festival 2026 full lineup poster — Sept 5-6, Industry City, Brooklyn"
                      width={600}
                      height={1067}
                      className="w-full h-auto"
                    />
                  </Frame>
                </motion.div>
              </Reveal>

              <Reveal>
                <motion.div variants={fadeInUp}>
                  <Label num="—" text="THE AGAPE FESTIVAL" />
                </motion.div>
                <motion.h3 variants={fadeInUp} className={`${T.heading} chrome-text-slow ${S.labelGap}`}>
                  A STACKED WEEKEND
                </motion.h3>
                <motion.div variants={fadeInUp}>
                  <HeadingLine />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <TypewriterReveal
                    text="Two days of unrelenting sound across indoor and outdoor stages at Industry City, Brooklyn. From internationally acclaimed headliners to rising underground talent — every set is curated to deliver the energy ÄGAPĒ is known for."
                    className={`${T.mono} text-neutral-300`}
                    speed={8}
                  />
                </motion.div>
                <motion.div variants={fadeInUp} className="mt-6">
                  <TypewriterReveal
                    text="Day one brings the raw power of the Hot Meal and Face 2 Face stages. Day two escalates with 44 Label Group taking over both stages for a relentless closing chapter. Expect bold sound design, elevated production, and an atmosphere built on genuine connection."
                    className={`${T.monoSm} text-neutral-500`}
                    speed={6}
                    delay={200}
                  />
                </motion.div>
                <motion.div variants={fadeInUp} className="mt-8">
                  <div className="ticket-wrap">
                    <Frame accent className="inline-block">
                      <a
                        href={FESTIVAL.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ticket-btn block px-12 py-4 bg-[#8b0000] hover:bg-[#a00000] transition-all duration-300"
                      >
                        <span className={`${orbitron.className} text-[13px] tracking-[0.3em] font-semibold text-white transition-colors duration-300`}>
                          SECURE YOUR SPOT →
                        </span>
                      </a>
                    </Frame>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionLine />

        {/* ===== TWO DAYS. MULTIPLE STAGES. (video parallax break) ===== */}
        <ParallaxVideoBreak />

        {/* ===== ARTISTS / LINEUP ===== */}
        <Lineup />

        <SectionLine />

        {/* ===== TICKETS CTA ("SECURE YOUR ENTRY") ===== */}
        <section
          id="tickets"
          ref={ticketsSectionRef}
          className={`relative ${S.section} overflow-hidden`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${VIDEOS.redStrobes.poster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#000",
          }}
        >
          <TicketsBackgroundVideo />

          <div className={`relative z-10 max-w-[1400px] mx-auto ${S.px}`}>
            <Reveal>
              <Frame accent className="max-w-2xl mx-auto">
                <div className="px-8 py-16 sm:px-12 sm:py-20 text-center">
                  <motion.div variants={fadeInUp}>
                    <Label num="02" text="TICKETS" />
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className={`${T.display} chrome-text ${S.labelGap} mb-6`}>
                    SECURE YOUR ENTRY
                  </motion.h2>
                  <motion.div variants={fadeInUp}>
                    <TypewriterReveal
                      text={`${FESTIVAL.tagline} — ${FESTIVAL.venue.full}`}
                      className={`${T.monoSm} text-neutral-500`}
                      speed={15}
                    />
                  </motion.div>
                  <motion.p
                    variants={fadeInUp}
                    className={`${T.detail} text-neutral-600 mt-3`}
                  >
                    DOORS {FESTIVAL.hours}
                  </motion.p>

                  {/* TICKET TIERS EXPLAINER — sits between the date/hours
                      line and the GET TICKETS button so buyers know what
                      they're picking before they click through to posh. */}
                  <motion.div
                    variants={fadeInUp}
                    className="mt-12 max-w-xl mx-auto text-left"
                  >
                    <p
                      className={`${T.label} text-neutral-600 text-center mb-6`}
                    >
                      <span className="text-[#8b0000]/50">—</span>
                      <span className="mx-2">—</span>
                      TICKET TYPES
                    </p>
                    <div className="divide-y divide-white/[0.06]">
                      {TICKET_TIERS.map((tier, i) => (
                        <div
                          key={tier.name}
                          className="flex gap-4 sm:gap-5 py-4 sm:py-5"
                        >
                          <span
                            className={`${T.detail} text-[#8b0000]/60 flex-shrink-0 pt-[3px]`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`${orbitron.className} text-[12px] sm:text-[13px] font-bold tracking-[0.1em] text-white`}
                            >
                              {tier.name}
                            </p>
                            <p
                              className={`${T.monoSm} text-neutral-500 mt-2`}
                            >
                              {tier.description}
                              {tier.tag && (
                                <span className="text-neutral-300">
                                  {" "}
                                  {tier.tag}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Price anchor — sits directly above the CTA so the
                      price context is read in the same glance as the button. */}
                  <motion.p
                    variants={fadeInUp}
                    className={`${orbitron.className} text-xs sm:text-sm tracking-[0.3em] text-neutral-400 mt-12 mb-3`}
                  >
                    FROM{" "}
                    <span className="text-white font-bold tracking-[0.15em]">
                      {FESTIVAL.ticketsFrom}
                    </span>
                  </motion.p>
                  <motion.div variants={fadeInUp} className="w-full sm:w-auto">
                    <div ref={ticketBtnRef} className="ticket-wrap block sm:inline-block">
                      <Frame accent className="block sm:inline-block">
                        <a
                          href={FESTIVAL.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ticket-btn block px-16 py-6 bg-[#8b0000] hover:bg-[#a00000] transition-all duration-300 group text-center"
                        >
                          <span className={`${orbitron.className} text-[15px] sm:text-[16px] tracking-[0.3em] font-bold text-white transition-colors duration-300`}>
                            GET TICKETS →
                          </span>
                        </a>
                      </Frame>
                    </div>
                  </motion.div>

                  {/* Promo code — secondary conversion nudge.
                      Sized between the button and fine-print so it
                      reads as an incentive without competing with the CTA. */}
                  <motion.p
                    variants={fadeInUp}
                    className={`${orbitron.className} text-[11px] sm:text-xs tracking-[0.25em] text-neutral-400 mt-7`}
                  >
                    USE CODE{" "}
                    <span className="text-[#cc2222] font-bold tracking-[0.3em]">
                      AGAPE
                    </span>{" "}
                    FOR 15% OFF
                  </motion.p>

                  {/* Logistics fine-print — age limit + refund/transfer policy */}
                  <motion.p
                    variants={fadeInUp}
                    className={`${T.detail} text-neutral-600 mt-4`}
                  >
                    21+ EVENT
                    <span className="mx-3 opacity-50">·</span>
                    NON-REFUNDABLE BUT TRANSFERABLE
                  </motion.p>
                </div>
              </Frame>
            </Reveal>
          </div>
        </section>

        <SectionLine />

        {/* ===== FAQ ===== */}
        <Faq />

        <SectionLine />

        {/* ===== GETTING HERE ===== */}
        <GettingHere />

        <SectionLine />

        {/* ===== ABOUT + PHOTO ===== */}
        <section id="about" className={`${S.section} ${S.px} bg-black/70`}>
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="05" text="ABOUT" />
              </motion.div>
              <motion.h2 variants={fadeInUp} className={`${T.heading} chrome-text ${S.labelGap}`}>
                WHO WE ARE
              </motion.h2>
              <motion.div variants={fadeInUp}>
                <HeadingLine />
              </motion.div>
            </Reveal>

            <div className={`relative grid grid-cols-1 lg:grid-cols-2 ${S.contentGap} mt-10 items-stretch`}>
              {/* Vertical line between columns — line motif */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 hidden lg:block pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
                }}
              />

              <Reveal className="order-2 lg:order-1">
                <motion.div variants={fadeInUp}>
                  <Frame>
                    <div className="p-6 sm:p-8 lg:p-10">
                      <TypewriterReveal
                        text={COPY.about}
                        className={`${T.monoLg} text-neutral-200`}
                        speed={18}
                      />
                      <MetallicDivider />
                      <TypewriterReveal
                        text={COPY.aboutExtended}
                        className={`${T.monoSm} text-neutral-500`}
                        speed={8}
                        delay={200}
                      />
                      <p className={`${T.detail} text-neutral-700 mt-8`}>
                        {COPY.origin}
                      </p>
                    </div>
                  </Frame>
                </motion.div>
              </Reveal>

              <AboutPhoto />
            </div>
          </div>
        </section>

        <SectionLine />

        {/* ===== PHOTO GALLERY — Full-width mosaic ===== */}
        <section>
          <FilmStrips photos={PHOTOS} />
        </section>

        <SectionLine />

        {/* ===== TIMELINE / THE JOURNEY ===== */}
        <section id="journey" className={`pt-28 sm:pt-36 pb-4 sm:pb-6 ${S.px} bg-black/70 overflow-hidden`}>
          <div className="max-w-[1400px] mx-auto">
            <Reveal>
              <motion.div variants={fadeInUp}>
                <Label num="—" text="THE JOURNEY" />
              </motion.div>
              <motion.h2 variants={fadeInUp} className={`${T.heading} chrome-text ${S.labelGap}`}>
                HOW WE GOT HERE
              </motion.h2>
              <motion.div variants={fadeInUp}>
                <HeadingLine />
              </motion.div>
            </Reveal>

            <Timeline />
          </div>
        </section>

        {/* ===== DEDICATION ===== */}
        <section className={`pt-6 pb-20 sm:pt-8 sm:pb-28 ${S.px} bg-black/70`}>
          <div className="max-w-2xl mx-auto text-center">
            <TypewriterReveal
              text="To our community: it's been an honor to have you follow us on this journey and watch you grow alongside us over the years. This event is dedicated to all those who've worked with us, supported us, believed in us, and to anyone who's ever donated their presence at one of our events. To share these moments with you all has made this project something truly special. None of it happens without you guys. So this one's for you. Hope you enjoy it. This is just the beginning."
              className={`${T.monoSm} text-neutral-500 leading-relaxed italic`}
              speed={18}
            />
            <TypewriterReveal
              text="— The ÄGAPĒ Team"
              className={`${T.monoSm} text-neutral-400 mt-6`}
              speed={40}
              delay={9000}
            />
          </div>
        </section>

        <SectionLine />

        {/* ===== PARTNERS ===== */}
        <section id="partners" className={`${S.compact} ${S.px} bg-black/70`}>
          <Reveal replay>
            <motion.div variants={fadeInUp}>
              <Label num="06" text="PARTNERS" />
            </motion.div>
            <motion.p variants={fadeInUp} className={`${T.label} text-neutral-600 ${S.labelGap} ${S.headingGap}`}>
              PRESENTED BY
            </motion.p>

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
                        alt={`${partner.name} logo`}
                        width={120}
                        height={45}
                        className="opacity-50 group-hover:opacity-90 transition-all duration-700 grayscale group-hover:grayscale-0 object-contain max-h-[50px] w-auto"
                      />
                    </a>
                  ) : (
                    <span className={`${T.card} text-neutral-700 group-hover:text-neutral-500 transition-colors duration-500`}>
                      {partner.name}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </section>

        {/* ===== BOTTOM MARQUEE ===== */}
        <div className="py-4 border-y border-white/[0.06] bg-black/60">
          <Marquee speed={35}>
            {[
              "ÄGAPE FESTIVAL",
              "ELEVATED PRODUCTION",
              "BOLD SOUND DESIGN",
              "GENUINE INCLUSIVE ATMOSPHERE",
            ].map((t, i) => (
              <span key={i} className="flex items-center">
                <span className={`${T.label} text-neutral-700 mx-8`}>{t}</span>
                <img src={LOGOS.agapeWhiteSm} alt="" width={20} height={20} loading="lazy" decoding="async" className="h-5 w-5 mx-2 opacity-40 object-contain" />
              </span>
            ))}
          </Marquee>
        </div>

        <SectionLine />

        {/* ===== FOOTER ===== */}
        <footer className={`${S.compact} ${S.px} bg-black`}>
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {/* Brand */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <Image
                  src={LOGOS.festivalWhiteTransparent}
                  alt="ÄGAPĒ Festival logo"
                  width={586}
                  height={310}
                  className="opacity-15 w-[120px] h-auto"
                />
                <p className={`${T.bodySm} text-neutral-700`}>
                  {FESTIVAL.venue.full}
                </p>
                <p className={`${T.bodySm} text-neutral-700`}>
                  {FESTIVAL.tagline}
                </p>
              </div>

              {/* Navigation + Social */}
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className={`${T.detail} text-neutral-600 mb-3`}>NAVIGATE</p>
                  <div className="flex flex-col items-center gap-2">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.querySelector(link.href);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`${T.bodySm} text-neutral-600 hover:text-white transition-colors duration-300`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className={`${T.detail} text-neutral-600 mb-3`}>FOLLOW</p>
                  <div className="flex flex-col items-center gap-2">
                    {SOCIALS.map((social) => (
                      <a
                        key={social.handle}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${T.bodySm} text-neutral-600 hover:text-white transition-colors duration-300`}
                      >
                        {social.handle}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col items-center md:items-end gap-4">
                <p className={`${T.detail} text-neutral-600`}>CONTACT</p>
                <a
                  href={`mailto:${FESTIVAL.contactEmail}`}
                  className={`${T.bodySm} text-neutral-600 hover:text-white transition-colors duration-300`}
                >
                  {FESTIVAL.contactEmail}
                </a>
                <p className={`${T.bodySm} text-neutral-700 mt-4 text-center md:text-right`}>
                  For bookings, press, and
                  <br />
                  partnership inquiries.
                </p>
              </div>
            </div>

            <MetallicDivider />

            <div className="flex flex-col items-center justify-center mb-4 gap-2">
              <span className={`${T.detail} text-neutral-700`}>SITE DESIGN BY MEKA</span>
              <a href="https://www.instagram.com/_x.meka.x_/" target="_blank" rel="noopener noreferrer">
                <motion.img
                  src="/assets/logos/meka-icon.webp"
                  alt="MEKA design studio logo"
                  className="w-16 h-16 cursor-pointer"
                  initial={{ opacity: 0, filter: "brightness(1)" }}
                  whileInView={{
                    opacity: [0, 0.7, 0.5, 0.4],
                    filter: [
                      "brightness(1)",
                      "brightness(2) drop-shadow(0 0 12px rgba(255,255,255,0.4))",
                      "brightness(1.3) drop-shadow(0 0 6px rgba(255,255,255,0.2))",
                      "brightness(1) drop-shadow(0 0 0px transparent)",
                    ],
                  }}
                  viewport={{ once: true }}
                  whileHover={{ opacity: 0.8, filter: "brightness(1.8) drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className={`${T.detail} text-neutral-700`}>
                © {FESTIVAL.year} ÄGAPE FESTIVAL. ALL RIGHTS RESERVED.
              </p>
              <p className={`${T.detail} text-neutral-700`}>
                BROOKLYN, NEW YORK
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
