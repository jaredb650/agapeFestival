"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
} from "@/data/festival";
import Image from "next/image";
import {
  Special_Elite,
  Permanent_Marker,
  IBM_Plex_Mono,
} from "next/font/google";

// ─── FONTS ───────────────────────────────────────────────
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
});

// ─── NOISE SVG (base64-encoded for inline use) ──────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`;

// ─── COMPONENT ───────────────────────────────────────────
export default function V1BrutalistRaw() {
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -120]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stages = getStages();

  const toggleArtist = (key: string) => {
    setExpandedArtist((prev) => (prev === key ? null : key));
  };

  // ── shake animation variants ──
  const shakeVariants = {
    hover: {
      x: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.4, repeat: Infinity, repeatType: "mirror" as const },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20, rotate: Math.random() * 4 - 2 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  const typewriterVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.05 },
    }),
  };

  return (
    <div
      className={`${specialElite.variable} ${permanentMarker.variable} ${ibmPlexMono.variable} relative bg-black text-white overflow-x-hidden selection:bg-[#cc0000] selection:text-white`}
    >
      {/* ═══════ GLOBAL STYLES ═══════ */}
      <style>{`
        :root {
          --brutal-red: #cc0000;
          --brutal-black: #000;
          --brutal-white: #fff;
          --brutal-paper: #f0ece4;
          --brutal-ink: #1a1a1a;
          --font-display: var(--font-permanent-marker), cursive;
          --font-body: var(--font-ibm-mono), monospace;
          --font-typewriter: var(--font-special-elite), monospace;
        }

        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 2%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(4%, -2%); }
          50% { transform: translate(-3%, 1%); }
          60% { transform: translate(2%, -4%); }
          70% { transform: translate(-4%, 3%); }
          80% { transform: translate(1%, -1%); }
          90% { transform: translate(3%, 4%); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.7; }
          94% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
        }

        @keyframes inkDrip {
          0% { transform: scaleY(0); opacity: 0; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1.2); opacity: 0.6; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes roughShake {
          0% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(1px, 1px) rotate(0.5deg); }
          50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          75% { transform: translate(1px, -1px) rotate(0.5deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }

        @keyframes stamp {
          0% { transform: scale(3) rotate(-12deg); opacity: 0; }
          60% { transform: scale(1.05) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(-3deg); opacity: 1; }
        }

        .grain-overlay {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: ${NOISE_SVG};
          background-repeat: repeat;
          opacity: 0.035;
          pointer-events: none;
          z-index: 9999;
          animation: grainShift 0.5s steps(6) infinite;
        }

        .torn-edge-top {
          clip-path: polygon(
            0% 8%, 3% 0%, 7% 6%, 11% 1%, 15% 5%, 19% 0%, 23% 7%, 27% 2%,
            31% 6%, 35% 0%, 39% 4%, 43% 1%, 47% 7%, 51% 0%, 55% 5%, 59% 2%,
            63% 6%, 67% 0%, 71% 4%, 75% 1%, 79% 7%, 83% 0%, 87% 5%, 91% 2%,
            95% 6%, 100% 0%, 100% 100%, 0% 100%
          );
        }

        .torn-edge-bottom {
          clip-path: polygon(
            0% 0%, 100% 0%, 100% 92%, 97% 100%, 93% 94%, 89% 100%, 85% 95%,
            81% 100%, 77% 93%, 73% 100%, 69% 96%, 65% 100%, 61% 94%, 57% 100%,
            53% 95%, 49% 100%, 45% 93%, 41% 100%, 37% 96%, 33% 100%, 29% 94%,
            25% 100%, 21% 95%, 17% 100%, 13% 93%, 9% 100%, 5% 96%, 0% 100%
          );
        }

        .torn-card {
          clip-path: polygon(
            2% 0%, 5% 2%, 8% 0%, 12% 1%, 16% 0%, 20% 2%, 25% 0%, 30% 1%,
            35% 0%, 40% 2%, 45% 0%, 50% 1%, 55% 0%, 60% 2%, 65% 0%, 70% 1%,
            75% 0%, 80% 2%, 85% 0%, 90% 1%, 95% 0%, 98% 2%, 100% 0%,
            100% 3%, 99% 7%, 100% 12%, 99% 17%, 100% 22%, 99% 28%,
            100% 33%, 99% 39%, 100% 45%, 99% 51%, 100% 57%, 99% 63%,
            100% 69%, 99% 75%, 100% 81%, 99% 87%, 100% 93%, 99% 97%, 100% 100%,
            97% 100%, 93% 99%, 88% 100%, 83% 99%, 78% 100%, 73% 99%,
            68% 100%, 63% 99%, 58% 100%, 53% 99%, 48% 100%, 43% 99%,
            38% 100%, 33% 99%, 28% 100%, 23% 99%, 18% 100%, 13% 99%,
            8% 100%, 3% 99%, 0% 100%,
            0% 97%, 1% 93%, 0% 88%, 1% 83%, 0% 78%, 1% 73%,
            0% 68%, 1% 63%, 0% 58%, 1% 53%, 0% 48%, 1% 43%,
            0% 38%, 1% 33%, 0% 28%, 1% 23%, 0% 18%, 1% 13%,
            0% 8%, 1% 3%
          );
        }

        .ink-splatter::before {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          background: radial-gradient(ellipse at center, #cc0000 0%, transparent 70%);
          border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        .paper-bg {
          background-color: var(--brutal-paper);
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0,0,0,0.05) 0%, transparent 40%),
            linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 40%, rgba(0,0,0,0.03) 100%);
        }

        .scanline-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.03);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }

        .brush-border {
          border: 3px solid var(--brutal-white);
          border-image: repeating-linear-gradient(
            90deg,
            var(--brutal-white) 0px,
            var(--brutal-white) 4px,
            transparent 4px,
            transparent 6px
          ) 3;
        }

        .rough-border {
          box-shadow:
            inset 0 0 0 2px var(--brutal-white),
            3px 3px 0 0 var(--brutal-red),
            -1px -1px 0 0 rgba(204,0,0,0.3);
        }

        .redacted {
          background: var(--brutal-black);
          color: var(--brutal-black);
          padding: 2px 8px;
          display: inline;
          text-decoration: none;
        }

        .redacted:hover {
          color: var(--brutal-red);
        }
      `}</style>

      {/* ═══════ GRAIN OVERLAY ═══════ */}
      <div className="grain-overlay" />

      {/* ═══════ SCANLINE ═══════ */}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <div
          className="w-full h-[2px] bg-white/[0.02]"
          style={{ animation: "scanline 8s linear infinite" }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[100] mix-blend-difference">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <a
            href="#hero"
            className="font-[family-name:var(--font-typewriter)] text-white text-sm md:text-base tracking-[0.3em] uppercase no-underline hover:text-[#cc0000] transition-colors"
          >
            ÄGAPĒ FESTIVAL
          </a>
          <div className="flex gap-3 md:gap-6 font-[family-name:var(--font-body)] text-[10px] md:text-xs uppercase tracking-[0.2em]">
            {[
              { label: "ABOUT", href: "#about" },
              { label: "ARTISTS", href: "#artists" },
              { label: "TICKETS", href: "#tickets" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white no-underline hover:text-[#cc0000] transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#cc0000] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
        {/* rough divider line */}
        <div
          className="h-[1px] w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff 0px, #fff 8px, transparent 8px, transparent 12px)",
            opacity: 0.3,
          }}
        />
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background ink splatter accents */}
        <div
          className="absolute top-[10%] left-[-5%] w-[300px] h-[300px] rounded-[40%_60%_55%_45%] opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, #cc0000 0%, transparent 70%)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute bottom-[15%] right-[-8%] w-[400px] h-[200px] rounded-[60%_40%_45%_55%] opacity-[0.06] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, #cc0000 0%, transparent 60%)",
            transform: "rotate(25deg)",
          }}
        />

        <motion.div
          style={{ y: heroParallax }}
          className="relative z-10 flex flex-col items-center px-4"
        >
          {/* Rotated date tag */}
          <motion.div
            initial={{ opacity: 0, rotate: -8, x: -50 }}
            animate={mounted ? { opacity: 1, rotate: -5, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="absolute top-[-40px] md:top-[-60px] left-[5%] md:left-[-80px] font-[family-name:var(--font-typewriter)] text-xs md:text-sm text-[#cc0000] tracking-[0.3em] uppercase border border-[#cc0000] px-3 py-1"
            style={{
              transform: "rotate(-5deg)",
              boxShadow: "2px 2px 0 #cc0000",
            }}
          >
            SEPT 5+6 2026
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, scale: 1.3, rotate: -2 }}
            animate={mounted ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="font-[family-name:var(--font-display)] text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[10rem] leading-[0.85] text-center uppercase tracking-tight"
            style={{
              textShadow:
                "3px 3px 0 #cc0000, -1px -1px 0 rgba(204,0,0,0.4)",
              animation: "flicker 4s infinite",
            }}
          >
            ÄGAPĒ
            <br />
            <span className="text-[2rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[6rem] tracking-[0.15em]">
              FESTIVAL
            </span>
          </motion.h1>

          {/* Venue — rotated */}
          <motion.p
            initial={{ opacity: 0, x: 40, rotate: 4 }}
            animate={mounted ? { opacity: 1, x: 0, rotate: 3 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 font-[family-name:var(--font-typewriter)] text-xs md:text-sm tracking-[0.4em] uppercase text-white/60"
            style={{ transform: "rotate(3deg)" }}
          >
            {FESTIVAL.venue.name} — {FESTIVAL.venue.location}
          </motion.p>

          {/* GET TICKETS button */}
          <motion.a
            href={FESTIVAL.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.4 }}
            whileHover="hover"
            variants={shakeVariants}
            className="mt-10 md:mt-16 inline-block px-8 md:px-12 py-3 md:py-4 bg-[#cc0000] text-white font-[family-name:var(--font-display)] text-lg md:text-2xl tracking-[0.2em] uppercase no-underline relative"
            style={{
              boxShadow: "4px 4px 0 #fff, -2px -2px 0 rgba(255,255,255,0.2)",
              clipPath:
                "polygon(0 0, 98% 2%, 100% 100%, 2% 98%)",
            }}
          >
            GET TICKETS
          </motion.a>

          {/* Small vertical text on the side */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 0.3 } : {}}
            transition={{ delay: 1.2, duration: 1 }}
            className="hidden md:block absolute right-[-120px] top-[50%] font-[family-name:var(--font-body)] text-[9px] tracking-[0.5em] uppercase"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            NEW YORK CITY — UNDERGROUND TECHNO
          </motion.div>
        </motion.div>

        {/* Bottom torn edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30px] bg-black torn-edge-top"
          style={{ transform: "rotate(180deg)" }}
        />

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 font-[family-name:var(--font-body)] text-[10px] tracking-[0.3em] text-white/30 uppercase"
        >
          SCROLL ↓
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="relative py-20 md:py-32 px-4 md:px-8">
        {/* Ink drip from top */}
        <div className="absolute top-0 left-[15%] w-[3px] h-[80px] bg-[#cc0000] origin-top" style={{ animation: "inkDrip 3s ease-in-out infinite" }} />
        <div className="absolute top-0 left-[45%] w-[2px] h-[50px] bg-[#cc0000]/50 origin-top" style={{ animation: "inkDrip 4s ease-in-out infinite 0.5s" }} />

        <div className="max-w-6xl mx-auto relative">
          {/* Section tag */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.5em] uppercase text-[#cc0000] mb-8"
          >
            [ ABOUT ]
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 relative">
            {/* Main text block */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-7 relative"
            >
              <p className="font-[family-name:var(--font-typewriter)] text-lg md:text-2xl lg:text-3xl leading-relaxed text-white/90">
                {COPY.about}
              </p>
              <div
                className="mt-6 h-[2px] w-[60%]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 10px, transparent 10px, transparent 14px)",
                }}
              />
            </motion.div>

            {/* Overlapping pull quote */}
            <motion.div
              initial={{ opacity: 0, rotate: 6, x: 40 }}
              whileInView={{ opacity: 1, rotate: 4, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="md:col-span-5 md:mt-[-40px] md:ml-[-40px] relative z-10"
            >
              <div
                className="bg-[#cc0000] text-white p-6 md:p-8 font-[family-name:var(--font-display)] text-xl md:text-3xl leading-snug"
                style={{
                  transform: "rotate(3deg)",
                  clipPath:
                    "polygon(2% 0%, 100% 1%, 98% 100%, 0% 97%)",
                }}
              >
                &ldquo;BORN IN NEW YORK CITY&rdquo;
                <div className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.3em] mt-4 opacity-70 uppercase">
                  {COPY.origin}
                </div>
              </div>
            </motion.div>

            {/* Extended copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="md:col-span-8 md:col-start-2 mt-8 md:mt-12"
            >
              <p className="font-[family-name:var(--font-body)] text-xs md:text-sm leading-loose text-white/60 max-w-2xl">
                {COPY.aboutExtended}
              </p>
            </motion.div>
          </div>

          {/* Diagonal stamp text */}
          <motion.div
            initial={{ opacity: 0, scale: 3, rotate: -12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-[-20px] right-0 md:right-[10%] font-[family-name:var(--font-display)] text-4xl md:text-6xl text-[#cc0000]/10 uppercase pointer-events-none select-none"
          >
            UNDERGROUND
          </motion.div>
        </div>
      </section>

      {/* ═══════ TORN DIVIDER ═══════ */}
      <div className="relative h-[60px]">
        <div className="absolute inset-0 bg-[#cc0000]/10 torn-edge-bottom" />
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIDEO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.5em] uppercase text-[#cc0000] mb-6"
          >
            [ VIDEO ]
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative ink-splatter"
          >
            {/* Ink splatter accent */}
            <div
              className="absolute top-[-30px] right-[-20px] w-[100px] h-[100px] rounded-[40%_60%_55%_45%] opacity-20 pointer-events-none z-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, #cc0000 0%, transparent 70%)",
                transform: "rotate(30deg)",
              }}
            />

            {/* Video container with rough edges */}
            <div
              className="relative overflow-hidden bg-black"
              style={{
                boxShadow:
                  "6px 6px 0 #cc0000, -2px -2px 0 rgba(255,255,255,0.1)",
                clipPath:
                  "polygon(0 0, 99% 1%, 100% 100%, 1% 99%)",
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto block"
              >
                <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
                <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
              </video>

              {/* Scanline overlay on video */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                }}
              />
            </div>

            {/* Caption */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-4 font-[family-name:var(--font-typewriter)] text-xs text-white/40 tracking-[0.2em] uppercase"
              style={{ transform: "rotate(-1deg)" }}
            >
              David Löhlein — Live
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TICKETS CTA
      ═══════════════════════════════════════════════════════ */}
      <section
        id="tickets"
        className="relative py-20 md:py-32 overflow-hidden"
      >
        {/* Background red bleed */}
        <div className="absolute inset-0 bg-[#cc0000]/5" />
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 20px, transparent 20px, transparent 28px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #cc0000 0px, #cc0000 20px, transparent 20px, transparent 28px)",
          }}
        />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 2.5, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <motion.div
                whileHover="hover"
                variants={shakeVariants}
                className="inline-block"
              >
                <span
                  className="font-[family-name:var(--font-display)] text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[12rem] text-[#cc0000] uppercase leading-none"
                  style={{
                    textShadow:
                      "4px 4px 0 rgba(0,0,0,0.8), -2px -2px 0 rgba(255,255,255,0.1)",
                    WebkitTextStroke: "1px rgba(255,255,255,0.15)",
                  }}
                >
                  GET
                  <br />
                  TICKETS
                </span>
              </motion.div>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 font-[family-name:var(--font-typewriter)] text-xs md:text-sm tracking-[0.3em] text-white/40 uppercase"
          >
            {FESTIVAL.dates.day1} — {FESTIVAL.dates.day2}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-2 font-[family-name:var(--font-body)] text-[10px] tracking-[0.4em] text-white/25 uppercase"
          >
            {FESTIVAL.venue.full}
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ARTISTS — "CHOOSE YOUR FIGHTER"
      ═══════════════════════════════════════════════════════ */}
      <section id="artists" className="relative py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.5em] uppercase text-[#cc0000] mb-4"
          >
            [ LINEUP ]
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl md:text-7xl uppercase mb-12 md:mb-20"
            style={{
              textShadow: "2px 2px 0 #cc0000",
            }}
          >
            CHOOSE YOUR
            <br />
            <span className="text-[#cc0000]">FIGHTER</span>
          </motion.h2>

          {/* Stages */}
          {stages.map((stageInfo, stageIdx) => (
            <motion.div
              key={`${stageInfo.day}-${stageInfo.stage}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="mb-16 md:mb-24"
            >
              {/* Stage header */}
              <motion.div
                variants={staggerItem}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-8 border-b border-white/10 pb-4"
              >
                <span className="font-[family-name:var(--font-typewriter)] text-xs tracking-[0.3em] text-white/40 uppercase">
                  {stageInfo.dayLabel}
                </span>
                <span className="font-[family-name:var(--font-display)] text-xl md:text-3xl uppercase">
                  {stageInfo.stage === "outdoor" ? "OUTDOOR" : "INDOOR"} STAGE
                </span>
                <span className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.3em] text-[#cc0000] uppercase">
                  hosted by {stageInfo.host}
                </span>
              </motion.div>

              {/* Artist cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {stageInfo.artists.map((artist, idx) => {
                  const artistKey = `${stageInfo.day}-${stageInfo.stage}-${artist.name}`;
                  const isExpanded = expandedArtist === artistKey;
                  const rotation = ((idx % 5) - 2) * 0.8;

                  return (
                    <motion.div
                      key={artistKey}
                      variants={staggerItem}
                      whileHover={{
                        scale: 1.03,
                        rotate: 0,
                        transition: { duration: 0.2 },
                      }}
                      className="relative cursor-pointer"
                      style={{ transform: `rotate(${rotation}deg)` }}
                      onClick={() => toggleArtist(artistKey)}
                    >
                      <div
                        className="torn-card bg-[#0a0a0a] p-5 md:p-6 relative overflow-hidden transition-colors duration-200 hover:bg-[#111]"
                        style={{
                          boxShadow: isExpanded
                            ? "0 0 20px rgba(204,0,0,0.3), 3px 3px 0 #cc0000"
                            : "3px 3px 0 rgba(255,255,255,0.05)",
                        }}
                      >
                        {/* Crosshair icon */}
                        <div className="mb-4 w-10 h-10 md:w-12 md:h-12 relative">
                          <svg
                            viewBox="0 0 48 48"
                            fill="none"
                            className="w-full h-full"
                          >
                            <circle
                              cx="24"
                              cy="24"
                              r="18"
                              stroke={isExpanded ? "#cc0000" : "#fff"}
                              strokeWidth="1.5"
                              opacity={isExpanded ? 1 : 0.4}
                            />
                            <line
                              x1="24"
                              y1="2"
                              x2="24"
                              y2="46"
                              stroke={isExpanded ? "#cc0000" : "#fff"}
                              strokeWidth="1"
                              opacity={isExpanded ? 0.8 : 0.25}
                            />
                            <line
                              x1="2"
                              y1="24"
                              x2="46"
                              y2="24"
                              stroke={isExpanded ? "#cc0000" : "#fff"}
                              strokeWidth="1"
                              opacity={isExpanded ? 0.8 : 0.25}
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="4"
                              fill={isExpanded ? "#cc0000" : "transparent"}
                              stroke={isExpanded ? "#cc0000" : "#fff"}
                              strokeWidth="1"
                              opacity={isExpanded ? 1 : 0.3}
                            />
                          </svg>
                        </div>

                        {/* Artist name */}
                        <h3
                          className="font-[family-name:var(--font-display)] text-lg md:text-xl uppercase leading-tight"
                          style={{
                            color: isExpanded ? "#cc0000" : "#fff",
                          }}
                        >
                          {artist.name}
                        </h3>

                        {/* Note badge (B2B, F2F, etc.) */}
                        {artist.note && (
                          <span
                            className="inline-block mt-2 px-2 py-[2px] font-[family-name:var(--font-body)] text-[9px] tracking-[0.2em] uppercase border"
                            style={{
                              borderColor: isExpanded
                                ? "#cc0000"
                                : "rgba(255,255,255,0.2)",
                              color: isExpanded ? "#cc0000" : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {artist.note}
                          </span>
                        )}

                        {/* Expanded bio */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div
                                className="mt-4 pt-4"
                                style={{
                                  borderTop: "1px dashed rgba(204,0,0,0.4)",
                                }}
                              >
                                <p className="font-[family-name:var(--font-body)] text-[11px] leading-relaxed text-white/50">
                                  {artist.bio}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Corner marker */}
                        <div
                          className="absolute bottom-2 right-3 font-[family-name:var(--font-body)] text-[8px] tracking-[0.2em] uppercase"
                          style={{
                            color: isExpanded
                              ? "#cc0000"
                              : "rgba(255,255,255,0.15)",
                          }}
                        >
                          {isExpanded ? "[ — ]" : "[ + ]"}
                        </div>

                        {/* Red accent line */}
                        <div
                          className="absolute top-0 left-0 w-full h-[2px]"
                          style={{
                            background: isExpanded
                              ? "#cc0000"
                              : "transparent",
                            transition: "background 0.3s",
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ TORN DIVIDER ═══════ */}
      <div className="relative h-[40px]">
        <div className="absolute inset-0 bg-[#cc0000] opacity-[0.07] torn-edge-bottom" />
      </div>

      {/* ═══════════════════════════════════════════════════════
          MERCH — REDACTED
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.5em] uppercase text-[#cc0000] mb-8"
          >
            [ MERCH ]
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Redacted document feel */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-[family-name:var(--font-display)] text-3xl md:text-5xl uppercase text-white">
                  MERCH
                </span>
                <span
                  className="font-[family-name:var(--font-display)] text-3xl md:text-5xl uppercase bg-white text-black px-3 inline-block"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 2%, 99% 100%, 1% 98%)",
                  }}
                >
                  DROP
                </span>
              </div>

              <div className="mt-8 space-y-3">
                <p className="font-[family-name:var(--font-typewriter)] text-base md:text-lg text-white/70">
                  {COPY.merchComingSoon}
                </p>

                {/* Redacted lines for effect */}
                <div className="space-y-2 mt-6">
                  <div className="flex gap-2 items-center">
                    <span className="bg-white h-[14px] w-[120px] md:w-[180px] inline-block" />
                    <span className="bg-white h-[14px] w-[60px] md:w-[90px] inline-block" />
                    <span className="bg-[#cc0000] h-[14px] w-[40px] md:w-[60px] inline-block" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-white/30 h-[14px] w-[80px] md:w-[140px] inline-block" />
                    <span className="bg-white h-[14px] w-[100px] md:w-[200px] inline-block" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-[#cc0000] h-[14px] w-[50px] md:w-[100px] inline-block" />
                    <span className="bg-white h-[14px] w-[90px] md:w-[160px] inline-block" />
                    <span className="bg-white/20 h-[14px] w-[70px] md:w-[120px] inline-block" />
                  </div>
                </div>

                {/* CLASSIFIED stamp */}
                <motion.div
                  initial={{ opacity: 0, scale: 3, rotate: -15 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                  className="mt-8 inline-block border-[3px] border-[#cc0000] px-6 py-2"
                  style={{ transform: "rotate(-8deg)" }}
                >
                  <span className="font-[family-name:var(--font-display)] text-2xl md:text-4xl text-[#cc0000] tracking-[0.2em]">
                    CLASSIFIED
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARTNERS
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.5em] uppercase text-[#cc0000] mb-8"
          >
            [ PARTNERS ]
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap items-center gap-8 md:gap-12"
          >
            {PARTNERS.map((partner) => (
              <motion.div
                key={partner.name}
                variants={staggerItem}
                whileHover={{ scale: 1.1, rotate: Math.random() * 4 - 2 }}
                className="relative group"
              >
                {partner.logoUrl ? (
                  <div className="h-8 md:h-10 relative opacity-40 group-hover:opacity-80 transition-opacity duration-300 grayscale group-hover:grayscale-0">
                    <Image
                      src={partner.logoUrlAlt || partner.logoUrl}
                      alt={partner.name}
                      width={120}
                      height={40}
                      className="h-full w-auto object-contain invert"
                      style={{ filter: "invert(1) grayscale(1)" }}
                    />
                  </div>
                ) : (
                  <span
                    className="font-[family-name:var(--font-display)] text-2xl md:text-3xl text-white/40 group-hover:text-white/80 transition-colors uppercase"
                  >
                    {partner.name}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="relative py-16 md:py-20 px-4 md:px-8 border-t border-white/5">
        {/* Top rough line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(204,0,0,0.5) 0px, rgba(204,0,0,0.5) 6px, transparent 6px, transparent 12px)",
          }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand */}
            <div>
              <h3
                className="font-[family-name:var(--font-display)] text-xl md:text-2xl uppercase"
                style={{ textShadow: "1px 1px 0 #cc0000" }}
              >
                ÄGAPĒ
                <br />
                FESTIVAL
              </h3>
              <p className="mt-2 font-[family-name:var(--font-body)] text-[10px] tracking-[0.3em] text-white/30 uppercase">
                {FESTIVAL.year} — {FESTIVAL.venue.location}
              </p>
            </div>

            {/* Socials */}
            <div>
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4">
                FOLLOW
              </p>
              <div className="space-y-2">
                {SOCIALS.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-[family-name:var(--font-typewriter)] text-sm text-white/60 hover:text-[#cc0000] transition-colors no-underline"
                  >
                    {social.handle}
                    <span className="ml-2 text-[9px] text-white/20 uppercase">
                      [{social.platform}]
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4">
                CONTACT
              </p>
              <a
                href={`mailto:${FESTIVAL.contactEmail}`}
                className="font-[family-name:var(--font-typewriter)] text-sm text-white/60 hover:text-[#cc0000] transition-colors no-underline"
              >
                {FESTIVAL.contactEmail}
              </a>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="font-[family-name:var(--font-body)] text-[9px] tracking-[0.3em] text-white/15 uppercase">
              ÄGAPĒ FESTIVAL {FESTIVAL.year} — ALL RIGHTS RESERVED
            </p>
            <p className="font-[family-name:var(--font-body)] text-[9px] tracking-[0.3em] text-white/10 uppercase">
              V1 — BRUTALIST RAW
            </p>
          </div>
        </div>

        {/* Ink drip from footer top */}
        <div
          className="absolute top-0 right-[25%] w-[2px] h-[40px] bg-[#cc0000]/30 origin-top"
          style={{ animation: "inkDrip 5s ease-in-out infinite 1s" }}
        />
      </footer>
    </div>
  );
}
