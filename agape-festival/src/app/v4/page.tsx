"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V4: DIGITAL DUNGEON
// Walking into a pitch-black warehouse at 3AM. Red lasers
// cutting through haze. Heavy bass you can feel.
// Claustrophobic but intoxicating. Everything glows red.
// ============================================================

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  FESTIVAL,
  COPY,
  SOCIALS,
  PARTNERS,
  ARTISTS,
  getStages,
  PHOTOS,
  VIDEOS,
  LOGOS,
  type Artist,
} from "@/data/festival";
import Image from "next/image";
import { Bebas_Neue, Share_Tech_Mono } from "next/font/google";

/* ═══════════════════════════════════════════════════════════
   FONTS — Industrial condensed + hacker monospace
   ═══════════════════════════════════════════════════════════ */

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

/* ═══════════════════════════════════════════════════════════
   NOISE TEXTURE — SVG feTurbulence for animated grain
   ═══════════════════════════════════════════════════════════ */

const NOISE_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS — Keyframes, effects, utility classes
   All scan lines and grain are pure CSS (no JS frames)
   ═══════════════════════════════════════════════════════════ */

const GLOBAL_CSS = `
  :root {
    --void: #050505;
    --abyss: #0a0a0a;
    --pit: #0f0f0f;
    --blood: #cc0000;
    --crimson: #8b0000;
    --fire: #ff0000;
    --ember: #ff1a1a;
    --strobe: #00ffff;
    --smoke: #1a1a1a;
  }

  /* ── Glitch: rapid RGB channel split ──────────────── */
  @keyframes glitchText {
    0%, 100% {
      text-shadow: 2px 0 var(--fire), -2px 0 var(--strobe);
      transform: translate(0);
    }
    20% {
      text-shadow: -3px 2px var(--fire), 3px -2px var(--strobe);
      transform: translate(-2px, 1px);
    }
    40% {
      text-shadow: 3px -1px var(--fire), -3px 1px var(--strobe);
      transform: translate(1px, -1px);
    }
    60% {
      text-shadow: -2px 0 var(--fire), 2px 0 var(--strobe);
      transform: translate(2px, 1px);
    }
    80% {
      text-shadow: 2px 1px var(--fire), -2px -1px var(--strobe);
      transform: translate(-1px, -1px);
    }
  }

  /* ── Periodic glitch: mostly stable, occasional stutter ── */
  @keyframes periodicGlitch {
    0%, 91%, 97%, 100% {
      text-shadow: none;
      transform: translate(0);
    }
    92% {
      text-shadow: 5px 0 var(--fire), -5px 0 var(--strobe);
      transform: translate(-4px, 2px);
    }
    93% {
      text-shadow: -4px 0 var(--fire), 4px 0 var(--strobe);
      transform: translate(3px, -2px);
    }
    94% {
      text-shadow: 3px 1px var(--fire), -3px -1px var(--strobe);
      transform: translate(-2px, 1px);
    }
    95% {
      text-shadow: -2px 0 var(--fire), 2px 0 var(--strobe);
      transform: translate(1px, -1px);
    }
    96% {
      text-shadow: 1px 0 var(--fire), -1px 0 var(--strobe);
      transform: translate(0, 0);
    }
  }

  /* ── Flicker: like a dying fluorescent light ──────── */
  @keyframes flicker {
    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
    20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.2; }
  }

  @keyframes subtleFlicker {
    0%, 88%, 91%, 100% { opacity: 1; }
    89%, 90% { opacity: 0.5; }
  }

  /* ── Red pulse: heartbeat glow emanation ─────────── */
  @keyframes redPulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(204,0,0,0.4), 0 0 15px rgba(204,0,0,0.15);
    }
    50% {
      box-shadow: 0 0 25px rgba(204,0,0,0.8), 0 0 60px rgba(204,0,0,0.35), 0 0 100px rgba(204,0,0,0.1);
    }
  }

  /* ── Heartbeat: border pulses like cardiac monitor ── */
  @keyframes heartbeat {
    0%, 100% { border-color: rgba(204,0,0,0.15); }
    10% { border-color: rgba(255,0,0,1); }
    20% { border-color: rgba(204,0,0,0.15); }
    30% { border-color: rgba(255,0,0,0.7); }
    40%, 100% { border-color: rgba(204,0,0,0.15); }
  }

  /* ── Noise shift: moves grain texture to feel alive ── */
  @keyframes noiseShift {
    0% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -5%); }
    20% { transform: translate(-10%, 5%); }
    30% { transform: translate(5%, -10%); }
    40% { transform: translate(-5%, 15%); }
    50% { transform: translate(-10%, 5%); }
    60% { transform: translate(15%, 0); }
    70% { transform: translate(0, 10%); }
    80% { transform: translate(-15%, 0); }
    90% { transform: translate(10%, 5%); }
    100% { transform: translate(5%, 0); }
  }

  /* ── Cursor blink: typewriter terminal cursor ─────── */
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ── Scan line: single bright bar scrolling down ──── */
  @keyframes scanlineScroll {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  /* ── Red fog pulse: ambient breathing of the void ─── */
  @keyframes fogPulse {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.08; }
  }

  /* ── Strobe flash: brief cyan strobe ─────────────── */
  @keyframes strobeFlash {
    0%, 98%, 100% { opacity: 0; }
    99% { opacity: 0.03; }
  }

  /* ── Utility classes ──────────────────────────────── */
  .glitch-hover:hover {
    animation: glitchText 0.3s steps(2) forwards;
  }

  .periodic-glitch {
    animation: periodicGlitch 7s infinite;
  }

  .flicker {
    animation: flicker 4s infinite;
  }

  .subtle-flicker {
    animation: subtleFlicker 2.5s infinite;
  }

  .pulse-glow {
    animation: redPulse 2s ease-in-out infinite;
  }

  .heartbeat-border {
    animation: heartbeat 1.4s ease-in-out infinite;
  }

  .noise-grain {
    background-image: ${NOISE_URI};
    background-repeat: repeat;
    background-size: 256px 256px;
    animation: noiseShift 0.4s steps(10) infinite;
  }

  .fog-breathe {
    animation: fogPulse 6s ease-in-out infinite;
  }

  /* ── Artist card glow ─────────────────────────────── */
  .artist-card {
    transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
  }
  .artist-card:hover {
    box-shadow: 0 0 30px rgba(204,0,0,0.5), 0 0 60px rgba(204,0,0,0.12);
    border-color: rgba(204,0,0,0.5) !important;
    background-color: rgba(204,0,0,0.03) !important;
  }

  /* ── Typewriter cursor ────────────────────────────── */
  .typewriter-cursor {
    animation: cursorBlink 0.6s step-end infinite;
  }

  /* ── Image masks for emerging from darkness ───────── */
  .mask-fade-vertical {
    mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  }

  .mask-fade-bottom {
    mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
  }

  .mask-fade-horizontal {
    mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  }

  /* ── Scrollbar: thin blood-red ────────────────────── */
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: var(--crimson); }
  ::-webkit-scrollbar-thumb:hover { background: var(--blood); }
  html { scrollbar-width: thin; scrollbar-color: var(--crimson) var(--void); }

  /* ── Hide scrollbar on photo strip ────────────────── */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── Selection color ──────────────────────────────── */
  ::selection { background: rgba(204,0,0,0.4); color: #fff; }
`;

/* ═══════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/** Typewriter bio text — types out character by character when active */
function TypewriterBio({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }

    let i = 0;
    setDisplayed("");
    setDone(false);

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [text, active]);

  if (!active) return null;

  return (
    <span
      className="leading-relaxed"
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#666" }}
    >
      {displayed}
      {!done && (
        <span className="typewriter-cursor" style={{ color: "var(--fire)" }}>
          ▊
        </span>
      )}
    </span>
  );
}

/** Reveal wrapper — fades sections up from the void on scroll */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Hexagon placeholder — geometric icon for artists without photos */
function HexPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14 md:w-18 md:h-18">
      <polygon
        points="50,5 93,27 93,73 50,95 7,73 7,27"
        fill="none"
        stroke="var(--blood)"
        strokeWidth="1"
        opacity="0.35"
      />
      <polygon
        points="50,18 80,35 80,65 50,82 20,65 20,35"
        fill="none"
        stroke="var(--crimson)"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <polygon
        points="50,30 68,42 68,58 50,70 32,58 32,42"
        fill="none"
        stroke="var(--fire)"
        strokeWidth="0.3"
        opacity="0.12"
      />
    </svg>
  );
}

/** Artist card — dark card with red glow, expandable bio */
function ArtistCard({
  artist,
  isExpanded,
  onToggle,
}: {
  artist: Artist;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      className="artist-card relative overflow-hidden cursor-pointer"
      style={{
        background: "var(--abyss)",
        border: "1px solid rgba(204,0,0,0.1)",
        borderRadius: "1px",
      }}
      onClick={onToggle}
      whileTap={{ scale: 0.985 }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          {/* Icon / image */}
          <div className="shrink-0">
            {artist.imageUrl ? (
              <div
                className="w-14 h-14 md:w-18 md:h-18 relative overflow-hidden"
                style={{ borderRadius: "1px" }}
              >
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  style={{
                    filter:
                      "grayscale(60%) brightness(0.5) contrast(1.3) sepia(0.3)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(139,0,0,0.25)",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
            ) : (
              <HexPlaceholder />
            )}
          </div>

          {/* Name + note */}
          <div className="flex-1 min-w-0">
            <h4
              className="text-lg md:text-xl tracking-wider uppercase truncate transition-colors duration-300"
              style={{
                fontFamily: "var(--font-display)",
                color: isExpanded ? "var(--fire)" : "#bbb",
              }}
            >
              {artist.name}
            </h4>
            {artist.note && (
              <span
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "var(--blood)" }}
              >
                {artist.note}
              </span>
            )}
          </div>

          {/* Expand indicator */}
          <div
            className="shrink-0 text-[11px] transition-colors duration-300"
            style={{
              fontFamily: "var(--font-mono)",
              color: isExpanded ? "var(--blood)" : "#333",
            }}
          >
            {isExpanded ? "[ — ]" : "[ + ]"}
          </div>
        </div>

        {/* Expandable bio */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div
                className="pt-4 mt-4"
                style={{ borderTop: "1px solid rgba(204,0,0,0.08)" }}
              >
                <TypewriterBio text={artist.bio} active={isExpanded} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom red line indicator when expanded */}
      {isExpanded && (
        <motion.div
          layoutId="card-indicator"
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: "var(--blood)" }}
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function V4DigitalDungeon() {
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [navVisible, setNavVisible] = useState(false);

  // Section refs for scroll navigation
  const aboutRef = useRef<HTMLElement>(null);
  const artistsRef = useRef<HTMLElement>(null);
  const ticketsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const stages = getStages();

  // Delayed mount for entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleArtist = (id: string) => {
    setExpandedArtist((prev) => (prev === id ? null : id));
  };

  /* ─── HERO ANIMATION VARIANTS ─────────────────────── */
  const heroContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2, delayChildren: 0.6 },
    },
  };

  const glitchIn = {
    hidden: { opacity: 0, x: -40, filter: "blur(8px)" },
    visible: {
      opacity: [0, 1, 0.3, 1, 0.6, 1],
      x: [-40, 8, -5, 3, -1, 0],
      filter: [
        "blur(8px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(1px)",
        "blur(0px)",
      ],
      transition: {
        duration: 1.2,
        times: [0, 0.15, 0.3, 0.5, 0.7, 1],
        ease: "easeOut" as const,
      },
    },
  };

  const flickerIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.4, 0, 0.7, 0.2, 1],
      transition: {
        duration: 1.5,
        times: [0, 0.15, 0.25, 0.5, 0.65, 1],
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <div
      className={`${display.variable} ${mono.variable} relative min-h-screen overflow-x-hidden`}
      style={{
        background: "var(--void)",
        color: "#999",
        fontFamily: "var(--font-mono)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ═══════════════════════════════════════════════════
          GLOBAL EFFECTS LAYER — CRT + atmosphere overlay
          Fixed, pointer-events: none, sits above everything
          ═══════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
        {/* Static scan lines — thin horizontal bars */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,0,0,0.03) 1px, rgba(255,0,0,0.03) 2px)",
          }}
        />

        {/* Traveling scan line — single bright bar moving down */}
        <div
          className="absolute left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,0,0,0.12) 30%, rgba(255,0,0,0.2) 50%, rgba(255,0,0,0.12) 70%, transparent 95%)",
            animation: "scanlineScroll 5s linear infinite",
          }}
        />

        {/* Animated noise grain */}
        <div
          className="absolute noise-grain"
          style={{
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            opacity: 0.035,
          }}
        />

        {/* Vignette — dark edges, claustrophobic */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Rare cyan strobe flash */}
        <div
          className="absolute inset-0"
          style={{
            background: "var(--strobe)",
            animation: "strobeFlash 12s ease-in-out infinite",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          NAVIGATION — barely visible, reveals on hover
          ═══════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-700"
        style={{
          opacity: navVisible ? 0.95 : 0.3,
          background: navVisible ? "rgba(5,5,5,0.92)" : "transparent",
          backdropFilter: navVisible ? "blur(12px)" : "none",
          borderBottom: navVisible
            ? "1px solid rgba(204,0,0,0.08)"
            : "1px solid transparent",
        }}
        onMouseEnter={() => setNavVisible(true)}
        onMouseLeave={() => setNavVisible(false)}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-12 md:h-14">
          {/* Logo mark */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="glitch-hover"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              letterSpacing: "0.08em",
              color: "var(--fire)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textShadow: "0 0 20px rgba(204,0,0,0.4)",
            }}
          >
            ÄGAPĒ
          </button>

          {/* Nav links */}
          <div className="flex gap-3 md:gap-7">
            {[
              { label: "ABOUT", ref: aboutRef },
              { label: "ARTISTS", ref: artistsRef },
              { label: "TICKETS", ref: ticketsRef },
              { label: "CONTACT", ref: contactRef },
            ].map(({ label, ref }) => (
              <button
                key={label}
                onClick={() => scrollTo(ref)}
                className="glitch-hover transition-colors duration-300 hover:text-[var(--fire)]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.35em",
                  color: "#444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          HERO — Full-screen black void. Text from the abyss.
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background photo — barely visible, red-tinted */}
        <div className="absolute inset-0">
          <Image
            src={PHOTOS[4]}
            alt=""
            fill
            className="object-cover"
            style={{
              opacity: 0.1,
              filter: "grayscale(30%) brightness(0.25) contrast(1.3) sepia(0.15)",
            }}
            priority
          />
          {/* Red color overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(139,0,0,0.12)",
              mixBlendMode: "multiply",
            }}
          />
          {/* Radial red glow at center — behind text */}
          <div
            className="absolute inset-0 fog-breathe"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at center, rgba(204,0,0,0.18) 0%, transparent 60%)",
            }}
          />
          {/* Bottom darkness gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48"
            style={{
              background: "linear-gradient(to top, var(--void), transparent)",
            }}
          />
          {/* Top darkness gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-32"
            style={{
              background: "linear-gradient(to bottom, var(--void), transparent)",
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={heroContainer}
        >
          {/* Festival name — massive, glitchy */}
          <motion.h1
            className="periodic-glitch"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.2rem, 13vw, 11rem)",
              lineHeight: 0.88,
              letterSpacing: "0.04em",
              color: "var(--fire)",
              textShadow:
                "0 0 40px rgba(204,0,0,0.5), 0 0 80px rgba(204,0,0,0.2), 0 0 120px rgba(204,0,0,0.08)",
            }}
            variants={glitchIn}
          >
            {FESTIVAL.name}
          </motion.h1>

          {/* Tagline — date, flickers into existence */}
          <motion.p
            className="mt-4 md:mt-7 tracking-[0.5em] uppercase subtle-flicker"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.65rem, 1.4vw, 0.9rem)",
              color: "#555",
            }}
            variants={flickerIn}
          >
            {FESTIVAL.tagline}
          </motion.p>

          {/* Venue */}
          <motion.p
            className="mt-2 tracking-[0.35em] uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.55rem, 1.1vw, 0.75rem)",
              color: "#3a3a3a",
            }}
            variants={flickerIn}
          >
            {FESTIVAL.venue.full}
          </motion.p>

          {/* CTA — ENTER THE VOID */}
          <motion.div className="mt-10 md:mt-14" variants={fadeUp}>
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pulse-glow glitch-hover transition-all duration-300 hover:bg-[var(--blood)] hover:text-black"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
                letterSpacing: "0.5em",
                color: "var(--fire)",
                padding: "0.9rem 2.5rem",
                border: "1px solid var(--blood)",
              }}
            >
              ENTER THE VOID
            </a>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="mt-16 md:mt-24"
            variants={fadeUp}
            style={{ color: "#222" }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.4em",
              }}
            >
              ▼
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ABOUT — Text emerging from pure darkness
          ═══════════════════════════════════════════════════ */}
      <section
        ref={aboutRef}
        id="about"
        className="relative py-24 md:py-36 px-5 md:px-8"
      >
        {/* Red fog — left */}
        <div
          className="absolute top-0 left-0 w-2/3 h-full pointer-events-none fog-breathe"
          style={{
            background:
              "radial-gradient(ellipse at -20% 40%, rgba(139,0,0,0.07) 0%, transparent 55%)",
          }}
        />
        {/* Red fog — right */}
        <div
          className="absolute top-0 right-0 w-2/3 h-full pointer-events-none fog-breathe"
          style={{
            background:
              "radial-gradient(ellipse at 120% 60%, rgba(139,0,0,0.05) 0%, transparent 50%)",
            animationDelay: "-3s",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <Reveal>
            <p
              className="leading-snug md:leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)",
                letterSpacing: "0.04em",
                color: "#ccc",
              }}
            >
              {COPY.about.split(/(ÄGAPĒ)/g).map((segment, i) =>
                segment === "ÄGAPĒ" ? (
                  <span
                    key={i}
                    className="glitch-hover"
                    style={{
                      color: "var(--fire)",
                      textShadow: "0 0 15px rgba(204,0,0,0.3)",
                    }}
                  >
                    {segment}
                  </span>
                ) : (
                  <span key={i}>{segment}</span>
                )
              )}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className="mt-8 md:mt-12 max-w-2xl"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.7rem, 1vw, 0.82rem)",
                lineHeight: "2",
                color: "#4a4a4a",
              }}
            >
              {COPY.aboutExtended}
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="mt-10 flex items-center gap-4">
              <div
                className="w-10 h-[1px]"
                style={{ background: "var(--crimson)" }}
              />
              <span
                className="text-[10px] tracking-[0.6em] uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--crimson)",
                }}
              >
                {COPY.origin}
              </span>
              <div
                className="flex-1 h-[1px] opacity-20"
                style={{ background: "var(--crimson)" }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Section divider ──────────────────────────────── */}
      <div
        className="w-full h-[1px] max-w-4xl mx-auto"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(204,0,0,0.12), transparent)",
        }}
      />

      {/* ═══════════════════════════════════════════════════
          VIDEO — HTML5 video with red tint + RGB split
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 px-4 md:px-8">
        <Reveal>
          <div className="relative max-w-4xl mx-auto overflow-hidden">
            {/* RGB split effect via offset shadows */}
            <div
              style={{
                boxShadow:
                  "-5px 0 0 rgba(255,0,0,0.25), 5px 0 0 rgba(0,255,255,0.15)",
                borderRadius: "1px",
                overflow: "hidden",
              }}
            >
              {/* Video element */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full block"
                style={{
                  filter: "brightness(0.5) contrast(1.3) saturate(0.7)",
                }}
              >
                <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
                <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
              </video>

              {/* Red tint */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,0,0,0.2), rgba(204,0,0,0.1))",
                  mixBlendMode: "multiply",
                }}
              />

              {/* Scan lines over video */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
                }}
              />

              {/* Bottom fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, var(--void), transparent)",
                }}
              />
            </div>

            {/* Label */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full subtle-flicker"
                style={{ background: "var(--blood)" }}
              />
              <span
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#333",
                }}
              >
                David Löhlein — Live Set
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          TICKETS CTA — Massive, urgent, almost threatening
          ═══════════════════════════════════════════════════ */}
      <section
        ref={ticketsRef}
        id="tickets"
        className="relative py-24 md:py-36 px-4 md:px-8 overflow-hidden"
      >
        {/* Ambient red fog behind CTA */}
        <div
          className="absolute inset-0 pointer-events-none fog-breathe"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at center, rgba(204,0,0,0.07) 0%, transparent 60%)",
          }}
        />

        <div className="relative text-center">
          <Reveal>
            <h2
              className="periodic-glitch"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.5rem, 16vw, 14rem)",
                lineHeight: 0.82,
                letterSpacing: "0.02em",
                color: "var(--fire)",
                textShadow:
                  "0 0 60px rgba(204,0,0,0.45), 0 0 120px rgba(204,0,0,0.15), 0 0 200px rgba(204,0,0,0.05)",
              }}
            >
              GET
              <br />
              TICKETS
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              className="mt-5 tracking-[0.5em] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "#3a3a3a",
              }}
            >
              Before it&apos;s too late
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-10 md:mt-14 heartbeat-border transition-all duration-400 hover:bg-[var(--fire)] hover:text-black hover:tracking-[0.7em]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1rem, 2vw, 1.3rem)",
                letterSpacing: "0.5em",
                color: "var(--fire)",
                padding: "1.1rem 3rem",
                border: "2px solid var(--blood)",
                textShadow: "0 0 20px rgba(204,0,0,0.4)",
              }}
            >
              PURCHASE NOW
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Section divider ──────────────────────────────── */}
      <div
        className="w-full h-[1px] max-w-5xl mx-auto"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(204,0,0,0.1), transparent)",
        }}
      />

      {/* ═══════════════════════════════════════════════════
          ARTISTS — "CHOOSE YOUR FIGHTER"
          Grid by Day/Stage, dark cards, glitch expand
          ═══════════════════════════════════════════════════ */}
      <section
        ref={artistsRef}
        id="artists"
        className="relative py-24 md:py-32 px-4 md:px-8"
      >
        {/* Section fog */}
        <div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(204,0,0,0.04) 0%, transparent 60%)",
          }}
        />

        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2
              className="text-center mb-16 md:mb-24 periodic-glitch"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 7vw, 5rem)",
                letterSpacing: "0.08em",
                color: "var(--fire)",
                textShadow: "0 0 30px rgba(204,0,0,0.3)",
              }}
            >
              CHOOSE YOUR FIGHTER
            </h2>
          </Reveal>

          {stages.map((stage, stageIdx) => (
            <div key={`${stage.day}-${stage.stage}`} className="mb-14 md:mb-20">
              {/* Stage header */}
              <Reveal delay={stageIdx * 0.08}>
                <div className="flex items-center gap-3 mb-5 md:mb-7 flex-wrap">
                  <div
                    className="w-5 h-[1px]"
                    style={{ background: "var(--crimson)" }}
                  />
                  <span
                    className="text-[10px] md:text-xs tracking-[0.35em] uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--blood)",
                    }}
                  >
                    {stage.dayLabel}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#222",
                    }}
                  >
                    //
                  </span>
                  <span
                    className="text-[10px] md:text-xs tracking-[0.3em] uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#4a4a4a",
                    }}
                  >
                    {stage.stage} stage
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#222",
                    }}
                  >
                    //
                  </span>
                  <span
                    className="text-[10px] md:text-xs tracking-[0.25em] uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#383838",
                    }}
                  >
                    hosted by {stage.host}
                  </span>
                  <div
                    className="flex-1 h-[1px] hidden md:block"
                    style={{ background: "rgba(204,0,0,0.06)" }}
                  />
                </div>
              </Reveal>

              {/* Artist cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2.5">
                {stage.artists.map((artist, i) => (
                  <Reveal
                    key={`${stage.day}-${stage.stage}-${artist.name}-${i}`}
                    delay={0.04 * i}
                  >
                    <ArtistCard
                      artist={artist}
                      isExpanded={
                        expandedArtist ===
                        `${stage.day}-${stage.stage}-${artist.name}`
                      }
                      onToggle={() =>
                        toggleArtist(
                          `${stage.day}-${stage.stage}-${artist.name}`
                        )
                      }
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PHOTO STRIP — glimpses from the dungeon
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-10 md:py-16 overflow-hidden">
        <Reveal>
          <div
            className="flex gap-2 md:gap-3 px-4 overflow-x-auto no-scrollbar mask-fade-horizontal"
          >
            {PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="shrink-0 relative overflow-hidden"
                style={{
                  width: "clamp(11rem, 22vw, 18rem)",
                  aspectRatio: "3/2",
                  borderRadius: "1px",
                }}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover"
                  style={{
                    filter:
                      "grayscale(45%) brightness(0.3) contrast(1.25) sepia(0.15)",
                  }}
                />
                {/* Red overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(139,0,0,0.12)",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          MERCH — "COMING SOON" in a dark hallway
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 px-4 md:px-8">
        <div className="text-center">
          <Reveal>
            <h3
              className="flicker"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                letterSpacing: "0.2em",
                color: "var(--blood)",
                textShadow:
                  "0 0 25px rgba(139,0,0,0.3), 0 0 50px rgba(139,0,0,0.1)",
              }}
            >
              MERCH
            </h3>
          </Reveal>

          <Reveal delay={0.12}>
            <p
              className="mt-4 tracking-[0.5em] uppercase subtle-flicker"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "#2a2a2a",
              }}
            >
              {COPY.merchComingSoon}
            </p>
          </Reveal>

          {/* Decorative — flickering neon line */}
          <Reveal delay={0.25}>
            <div className="mt-8 mx-auto max-w-[120px]">
              <div
                className="h-[1px] subtle-flicker"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--crimson), transparent)",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PARTNERS — Logos from the shadows
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-14 md:py-22 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p
              className="text-center mb-8 md:mb-10 tracking-[0.6em] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "#2a2a2a",
              }}
            >
              Partners
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-7 md:gap-12">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="transition-all duration-500 cursor-default group"
                  style={{
                    opacity: 0.2,
                    filter:
                      "grayscale(100%) brightness(0.4) sepia(0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.75";
                    e.currentTarget.style.filter =
                      "grayscale(20%) brightness(0.8) sepia(0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.2";
                    e.currentTarget.style.filter =
                      "grayscale(100%) brightness(0.4) sepia(0.4)";
                  }}
                >
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={90}
                      height={45}
                      className="h-7 md:h-9 w-auto object-contain"
                    />
                  ) : (
                    <span
                      className="tracking-[0.35em] uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "#444",
                      }}
                    >
                      {partner.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER — Minimal. Red on black. Scan lines.
          ═══════════════════════════════════════════════════ */}
      <footer
        ref={contactRef}
        id="contact"
        className="relative py-14 md:py-18 px-4 md:px-8"
        style={{ borderTop: "1px solid rgba(204,0,0,0.06)" }}
      >
        {/* Scan lines on footer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.015) 2px, rgba(255,0,0,0.015) 4px)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo / festival name */}
            <div className="flex items-center gap-4">
              {/* Small agape icon */}
              <Image
                src={LOGOS.agapeIcon}
                alt=""
                width={28}
                height={28}
                className="opacity-30"
                style={{ filter: "brightness(0.6)" }}
              />
              <span
                className="tracking-wider"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "var(--crimson)",
                }}
              >
                {FESTIVAL.name} {FESTIVAL.year}
              </span>
            </div>

            {/* Socials */}
            <div className="flex gap-5 md:gap-8">
              {SOCIALS.map((social) => (
                <a
                  key={social.handle}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glitch-hover transition-colors duration-300 hover:text-[var(--fire)]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    color: "#3a3a3a",
                  }}
                >
                  {social.handle}
                </a>
              ))}
            </div>

            {/* Email */}
            <a
              href={`mailto:${FESTIVAL.contactEmail}`}
              className="glitch-hover transition-colors duration-300 hover:text-[var(--fire)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "#3a3a3a",
              }}
            >
              {FESTIVAL.contactEmail}
            </a>
          </div>

          {/* Bottom tagline */}
          <div className="mt-10 text-center">
            <p
              className="tracking-[0.6em] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                color: "#1a1a1a",
              }}
            >
              From the underground, for the underground
            </p>
          </div>

          {/* Very bottom — tiny copyright */}
          <div className="mt-4 text-center">
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.45rem",
                letterSpacing: "0.3em",
                color: "#111",
              }}
            >
              &copy; {FESTIVAL.year} ÄGAPĒ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
