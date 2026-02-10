"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V5: SIGNAL
// Restrained. Framed. Numbered. Disciplined.
// Inspired by Teletech's cohesion: ONE signature motif (corner
// frames) repeated everywhere. 2 fonts. 3 colors. No 3D.
// ============================================================

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Syne, JetBrains_Mono } from "next/font/google";
import Image from "next/image";
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

// ---- Fonts (2 only) ----
const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// ---- Minimal CSS ----
const STYLES = `
  html { scroll-behavior: smooth; }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

// ---- Animation Variants ----
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

// ============================================================
// SIGNATURE ELEMENT: Corner Frame
// This ONE motif appears on every content block, card, button,
// and image. It is the visual thread that ties the entire page
// together — like Teletech's corner SVGs.
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
  const c = accent ? "border-[#c41818]/40" : "border-white/[0.1]";
  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${c} pointer-events-none z-10`}
      />
      <div
        className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${c} pointer-events-none z-10`}
      />
      <div
        className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${c} pointer-events-none z-10`}
      />
      <div
        className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${c} pointer-events-none z-10`}
      />
      {children}
    </div>
  );
}

// ---- Scroll Reveal ----
function Reveal({
  children,
  className = "",
  id,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
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
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---- Section Label ----
function Label({ num, text }: { num: string; text: string }) {
  return (
    <p
      className={`${mono.className} text-[11px] tracking-[0.12em] text-white/25`}
    >
      <span className="text-[#c41818]/50">{num}</span>
      <span className="mx-2">—</span>
      {text}
    </p>
  );
}

// ---- Marquee ----
function Marquee({
  children,
  speed = 28,
}: {
  children: ReactNode;
  speed?: number;
}) {
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

// ---- Nav Links ----
const NAV_LINKS = [
  { num: "01", label: "ABOUT", href: "#about" },
  { num: "02", label: "LINEUP", href: "#lineup" },
  { num: "03", label: "TICKETS", href: FESTIVAL.ticketUrl, external: true },
];

// ---- Artist Card ----
function ArtistCard({ artist }: { artist: Artist }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div variants={fadeUp}>
      <Frame className="group">
        <div className="bg-[#080808]">
          <div className="aspect-[4/3] relative overflow-hidden bg-[#050505]">
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                className={`object-cover transition-all duration-700 grayscale group-hover:grayscale-0 ${
                  loaded
                    ? "opacity-50 group-hover:opacity-90"
                    : "opacity-0"
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onLoad={() => setLoaded(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${mono.className} text-[10px] text-white/10`}>
                  —
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.04]">
            <span
              className={`${syne.className} text-[12px] font-semibold tracking-[0.04em] text-white/70 group-hover:text-white transition-colors duration-300`}
            >
              {artist.name}
            </span>
            {artist.note && (
              <span
                className={`${mono.className} text-[9px] tracking-[0.1em] text-[#c41818]/60`}
              >
                {artist.note}
              </span>
            )}
          </div>
        </div>
      </Frame>
    </motion.div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Signal() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const stages = getStages();
  const totalArtists = stages.reduce((a, s) => a + s.artists.length, 0);

  return (
    <div className={`${mono.className} min-h-screen bg-black text-[#d4d4d4]`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ========== NAVIGATION ========== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/[0.06]"
            : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <Image
              src={LOGOS.agapeIcon}
              alt=""
              width={16}
              height={16}
              className="invert opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            />
            <span
              className={`${syne.className} text-[11px] font-bold tracking-[0.2em] text-white/50 group-hover:text-white transition-colors duration-300`}
            >
              ÄGAPĒ
            </span>
            <span
              className={`${mono.className} text-[9px] tracking-[0.12em] text-white/15`}
            >
              2026
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`${mono.className} text-[10px] tracking-[0.1em] text-white/30 hover:text-white transition-colors duration-300`}
              >
                <span className="text-[#c41818]/50 mr-1.5">{link.num}</span>
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
            <span
              className={`block w-5 h-[1px] bg-white/40 transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[3px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1px] bg-white/40 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1px] bg-white/40 transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[3px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-6 py-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={() => setMenuOpen(false)}
                    className={`${mono.className} text-[11px] tracking-[0.12em] text-white/40 hover:text-white transition-colors`}
                  >
                    <span className="text-[#c41818]/50 mr-2">{link.num}</span>
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========== HERO ========== */}
      <section
        id="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video background — immediate, no intro delay */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.3) contrast(1.1)" }}
        >
          <source src={VIDEOS.flyerAnimated.webm} type="video/webm" />
          <source src={VIDEOS.flyerAnimated.mp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />

        {/* Hero content — fades in quickly */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center px-6"
        >
          {/* Location badge */}
          <Frame className="inline-block mb-10">
            <p
              className={`${mono.className} text-[10px] tracking-[0.2em] text-white/30 px-4 py-1.5`}
            >
              BROOKLYN, NEW YORK
            </p>
          </Frame>

          {/* Festival logo */}
          <div className="mb-10">
            <Image
              src={LOGOS.festivalWhiteTransparent}
              alt="ÄGAPĒ FESTIVAL"
              width={460}
              height={460}
              className="w-[240px] sm:w-[340px] md:w-[420px] h-auto mx-auto"
              priority
            />
          </div>

          {/* Thin divider */}
          <div className="w-12 h-[1px] bg-white/20 mx-auto mb-10" />

          {/* Date + venue */}
          <p
            className={`${mono.className} text-[12px] tracking-[0.15em] text-white/50 mb-2`}
          >
            SEPTEMBER 5 + 6, 2026
          </p>
          <p
            className={`${mono.className} text-[11px] tracking-[0.1em] text-white/25 mb-14`}
          >
            INDUSTRY CITY — BROOKLYN, NYC
          </p>

          {/* CTA — accent framed */}
          <Frame accent className="inline-block">
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-10 py-4 bg-[#c41818]/[0.08] hover:bg-[#c41818]/20 transition-all duration-300"
            >
              <span
                className={`${syne.className} text-[11px] font-semibold tracking-[0.2em] text-white/80`}
              >
                GET TICKETS
              </span>
            </a>
          </Frame>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className={`${mono.className} text-[9px] tracking-[0.2em] text-white/15`}
          >
            SCROLL
          </span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ========== MARQUEE TICKER ========== */}
      <div className="py-4 border-y border-white/[0.04] bg-black">
        <Marquee speed={30}>
          {[
            "ÄGAPĒ FESTIVAL 2026",
            "SEPTEMBER 5 + 6",
            "INDUSTRY CITY — BROOKLYN",
            "2 DAYS — 4 STAGES",
            `${totalArtists} ARTISTS`,
          ].map((t, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`${mono.className} text-[10px] tracking-[0.15em] text-white/20 mx-8`}
              >
                {t}
              </span>
              <span className="text-[#c41818]/30 text-[8px]">&#x25C6;</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ========== ABOUT ========== */}
      <section id="about" className="py-28 sm:py-36 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <Label num="01" text="ABOUT" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 mt-10 items-start">
            {/* Text block — framed */}
            <Reveal delay={0.1}>
              <Frame>
                <div className="p-6 sm:p-8 lg:p-10">
                  <p
                    className={`${syne.className} text-xl sm:text-2xl md:text-3xl font-bold leading-snug tracking-[0.02em] text-white/90 mb-8`}
                  >
                    {COPY.about}
                  </p>
                  <div className="h-[1px] bg-white/[0.06] mb-8" />
                  <p
                    className={`${mono.className} text-[13px] sm:text-sm leading-[1.9] text-white/40`}
                  >
                    {COPY.aboutExtended}
                  </p>
                  <p
                    className={`${mono.className} text-[10px] tracking-[0.1em] text-white/15 mt-8`}
                  >
                    {COPY.origin}
                  </p>
                </div>
              </Frame>
            </Reveal>

            {/* Photo — framed */}
            <Reveal delay={0.2}>
              <Frame>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src={PHOTOS[6]}
                    alt="ÄGAPĒ event"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </Frame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== VIDEO BREAK ========== */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.25) grayscale(1) contrast(1.1)" }}
        >
          <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
          <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Reveal>
            <h2
              className={`${syne.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.04em] text-white text-center px-6`}
            >
              TWO DAYS.
              <br />
              FOUR STAGES.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ========== FLYER + COPY ========== */}
      <section className="py-24 sm:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Flyer — framed */}
            <Reveal>
              <Frame>
                <Image
                  src={`${BASE_PATH}/assets/1000x1778.avif`}
                  alt="ÄGAPĒ FESTIVAL 2026 — Full Lineup"
                  width={600}
                  height={1067}
                  className="w-full h-auto"
                />
              </Frame>
            </Reveal>

            {/* Copy */}
            <Reveal delay={0.1}>
              <Label num="—" text="FULL LINEUP" />
              <h3
                className={`${syne.className} text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.03em] text-white mt-4 mb-8`}
              >
                A STACKED WEEKEND
              </h3>
              <p
                className={`${mono.className} text-[13px] sm:text-sm leading-[1.9] text-white/50 mb-6`}
              >
                Two days of unrelenting sound across indoor and outdoor stages
                at Industry City, Brooklyn. From internationally acclaimed
                headliners to rising underground talent — every set is curated
                to deliver the energy ÄGAPĒ is known for.
              </p>
              <p
                className={`${mono.className} text-[12px] sm:text-[13px] leading-[1.9] text-white/30 mb-10`}
              >
                Day one brings the raw power of the ÄGAPĒ and Face 2 Face
                stages. Day two escalates with 44 taking over both rooms for a
                relentless closing chapter. Expect bold sound design, elevated
                production, and an atmosphere built on genuine connection.
              </p>
              <Frame accent className="inline-block">
                <a
                  href={FESTIVAL.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-8 py-3 bg-[#c41818]/[0.06] hover:bg-[#c41818]/20 transition-all duration-300"
                >
                  <span
                    className={`${mono.className} text-[11px] tracking-[0.15em] text-white/60 hover:text-white transition-colors`}
                  >
                    SECURE YOUR SPOT →
                  </span>
                </a>
              </Frame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== TICKETS CTA ========== */}
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
                <Label num="03" text="TICKETS" />
                <h2
                  className={`${syne.className} text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.04em] text-white mt-6 mb-6`}
                >
                  SECURE YOUR
                  <br />
                  ENTRY
                </h2>
                <p
                  className={`${mono.className} text-[12px] tracking-[0.1em] text-white/35 mb-2`}
                >
                  {FESTIVAL.tagline}
                </p>
                <p
                  className={`${mono.className} text-[11px] tracking-[0.08em] text-white/20 mb-12`}
                >
                  {FESTIVAL.venue.full}
                </p>
                <Frame accent className="inline-block">
                  <a
                    href={FESTIVAL.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-12 py-5 bg-[#c41818]/10 hover:bg-[#c41818]/25 transition-all duration-300"
                  >
                    <span
                      className={`${syne.className} text-[12px] font-semibold tracking-[0.2em] text-white/90`}
                    >
                      GET TICKETS →
                    </span>
                  </a>
                </Frame>
              </div>
            </Frame>
          </Reveal>
        </div>
      </section>

      {/* ========== LINEUP ========== */}
      <section id="lineup" className="py-24 sm:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <Label num="02" text="LINEUP" />
            <h2
              className={`${syne.className} text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.04em] text-white mt-4 mb-3`}
            >
              THE LINEUP
            </h2>
            <p
              className={`${mono.className} text-[11px] tracking-[0.1em] text-white/20 mb-20`}
            >
              {totalArtists} ARTISTS · 2 DAYS · 4 STAGES
            </p>
          </Reveal>

          {stages.map((stage, stageIdx) => (
            <div
              key={`${stage.day}-${stage.stage}`}
              className={stageIdx > 0 ? "mt-20" : ""}
            >
              {/* Stage header */}
              <Reveal>
                <div className="flex items-baseline justify-between mb-4">
                  <p
                    className={`${syne.className} text-[13px] font-bold tracking-[0.06em] text-white/60`}
                  >
                    {stage.dayLabel.toUpperCase()} ·{" "}
                    {stage.stage.toUpperCase()} STAGE
                  </p>
                  <p
                    className={`${mono.className} text-[10px] tracking-[0.1em] text-white/20`}
                  >
                    Hosted by {stage.host}
                  </p>
                </div>
                <div className="h-[1px] bg-white/[0.06] mb-8" />
              </Reveal>

              {/* Artist grid */}
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* ========== PHOTO GALLERY ========== */}
      <section className="py-24 sm:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <Label num="04" text="GALLERY" />
            <h3
              className={`${syne.className} text-xl sm:text-2xl font-bold tracking-[0.04em] text-white/80 mt-4 mb-12`}
            >
              PAST EVENTS
            </h3>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHOTOS.slice(0, 6).map((photo, i) => (
              <Reveal key={photo} delay={i * 0.05}>
                <Frame className="group">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={photo}
                      alt={`ÄGAPĒ event ${i + 1}`}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </Frame>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARTNERS ========== */}
      <section className="py-20 sm:py-28 px-6 lg:px-12 border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <Label num="05" text="PARTNERS" />
            <p
              className={`${syne.className} text-sm font-semibold tracking-[0.15em] text-white/40 mt-4 mb-14`}
            >
              PRESENTED BY
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14 lg:gap-16">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="group h-[45px] flex items-center"
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
                        width={110}
                        height={40}
                        className="opacity-30 group-hover:opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500 object-contain max-h-[45px] w-auto"
                      />
                    </a>
                  ) : (
                    <span
                      className={`${mono.className} text-[11px] tracking-[0.1em] text-white/20 group-hover:text-white/50 transition-colors`}
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

      {/* ========== BOTTOM MARQUEE ========== */}
      <div className="py-3 border-y border-white/[0.04]">
        <Marquee speed={35}>
          {[
            "ELEVATED PRODUCTION",
            "BOLD SOUND DESIGN",
            "GENUINE INCLUSIVE ATMOSPHERE",
            "ÄGAPĒ FESTIVAL",
          ].map((t, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`${mono.className} text-[10px] tracking-[0.15em] text-white/10 mx-8`}
              >
                {t}
              </span>
              <span className="text-white/10 text-[6px]">&#x25C6;</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/[0.04] bg-black">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <Image
                src={LOGOS.festivalWhiteTransparent}
                alt={FESTIVAL.name}
                width={120}
                height={120}
                className="opacity-15 w-[100px] h-auto mb-5"
              />
              <p
                className={`${mono.className} text-[10px] text-white/15 tracking-[0.08em]`}
              >
                {FESTIVAL.venue.full}
              </p>
              <p
                className={`${mono.className} text-[10px] text-white/15 tracking-[0.08em] mt-1`}
              >
                {FESTIVAL.tagline}
              </p>
            </div>

            {/* Navigation + Social */}
            <div className="flex flex-col gap-8">
              <div>
                <p
                  className={`${syne.className} text-[10px] font-semibold tracking-[0.15em] text-white/25 mb-3`}
                >
                  NAVIGATION
                </p>
                <div className="flex flex-col gap-2">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`${mono.className} text-[11px] text-white/20 hover:text-white transition-colors duration-300`}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className={`${syne.className} text-[10px] font-semibold tracking-[0.15em] text-white/25 mb-3`}
                >
                  SOCIAL
                </p>
                <div className="flex flex-col gap-2">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.handle}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${mono.className} text-[11px] text-white/20 hover:text-white transition-colors duration-300`}
                    >
                      {s.handle}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="md:text-right">
              <p
                className={`${syne.className} text-[10px] font-semibold tracking-[0.15em] text-white/25 mb-3`}
              >
                CONTACT
              </p>
              <a
                href={`mailto:${FESTIVAL.contactEmail}`}
                className={`${mono.className} text-[11px] text-white/20 hover:text-white transition-colors duration-300`}
              >
                {FESTIVAL.contactEmail}
              </a>
              <p
                className={`${mono.className} text-[10px] text-white/10 mt-6`}
              >
                For bookings, press, and
                <br />
                partnership inquiries.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/[0.04] my-12" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p
              className={`${mono.className} text-[9px] tracking-[0.1em] text-white/10`}
            >
              © {FESTIVAL.year} {FESTIVAL.name}. ALL RIGHTS RESERVED.
            </p>
            <p
              className={`${mono.className} text-[9px] tracking-[0.1em] text-white/10`}
            >
              BROOKLYN, NEW YORK
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
