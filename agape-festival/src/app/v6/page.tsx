"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V6: MONOLITH
// Editorial. Massive type. Dramatic scale. Full-bleed.
// The typography IS the design. Enormous Bebas Neue headlines
// contrasted with tiny Space Mono labels. Hover an artist name
// to reveal their photo as a background wash.
// ============================================================

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Bebas_Neue, Space_Mono } from "next/font/google";
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
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// ---- Minimal CSS ----
const STYLES = `
  html { scroll-behavior: smooth; }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// SIGNATURE ELEMENT: Ruled Section Divider
// Horizontal rules with inline labels — the editorial motif
// that threads through the entire page.
// ============================================================
function Rule({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <div className={`h-[1px] bg-white/[0.08] ${className}`} />;
  }
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="h-[1px] bg-white/[0.08] flex-1" />
      <span
        className={`${spaceMono.className} text-[9px] tracking-[0.2em] text-white/20 uppercase shrink-0`}
      >
        {label}
      </span>
      <div className="h-[1px] bg-white/[0.08] flex-1" />
    </div>
  );
}

// ---- Marquee ----
function Marquee({
  children,
  speed = 20,
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

// ============================================================
// ARTIST ROW — Hover reveals image as background
// Each artist name is MASSIVE. Hovering fades in their photo.
// ============================================================
function ArtistRow({
  artist,
  onHover,
  onLeave,
  isHovered,
}: {
  artist: Artist;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="border-b border-white/[0.06] group cursor-default"
    >
      <div className="flex items-baseline justify-between py-3 sm:py-4 px-2">
        <h3
          className={`${bebas.className} text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] leading-[0.85] tracking-[0.02em] transition-colors duration-300 ${
            isHovered ? "text-[#ff2020]" : "text-white/70 group-hover:text-[#ff2020]"
          }`}
        >
          {artist.name}
        </h3>
        <div className="flex items-center gap-4 shrink-0">
          {artist.note && (
            <span
              className={`${spaceMono.className} text-[9px] tracking-[0.15em] text-[#ff2020]/60`}
            >
              {artist.note}
            </span>
          )}
          <span
            className={`${spaceMono.className} text-[9px] tracking-[0.1em] text-white/15 hidden sm:block`}
          >
            {artist.stageHost}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAGE SECTION — Artist list with hover-reveal background
// ============================================================
function StageSection({
  stage,
}: {
  stage: ReturnType<typeof getStages>[number];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredArtist = hoveredIdx !== null ? stage.artists[hoveredIdx] : null;

  return (
    <div className="relative">
      {/* Hover-reveal background image */}
      <AnimatePresence>
        {hoveredArtist?.imageUrl && (
          <motion.div
            key={hoveredArtist.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <Image
              src={hoveredArtist.imageUrl}
              alt=""
              fill
              className="object-cover opacity-[0.12] blur-sm scale-105"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage header */}
      <div className="relative z-10 flex items-baseline justify-between mb-6">
        <div>
          <span
            className={`${spaceMono.className} text-[10px] tracking-[0.15em] text-white/20`}
          >
            {stage.dayLabel.toUpperCase()}
          </span>
          <h3
            className={`${bebas.className} text-4xl sm:text-5xl md:text-6xl tracking-[0.02em] text-white/40 mt-1`}
          >
            {stage.stage.toUpperCase()} STAGE
          </h3>
        </div>
        <span
          className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-white/15`}
        >
          {stage.host}
        </span>
      </div>

      {/* Artist list */}
      <div className="relative z-10">
        {stage.artists.map((artist, i) => (
          <ArtistRow
            key={`${artist.name}-${stage.day}-${stage.stage}`}
            artist={artist}
            onHover={() => setHoveredIdx(i)}
            onLeave={() => setHoveredIdx(null)}
            isHovered={hoveredIdx === i}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Monolith() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const stages = getStages();
  const totalArtists = stages.reduce((a, s) => a + s.artists.length, 0);

  return (
    <div className={`${spaceMono.className} min-h-screen bg-black text-white`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ========== NAVIGATION — Minimal sticky bar ========== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/[0.06]"
            : ""
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <Image
              src={LOGOS.agapeIcon}
              alt=""
              width={14}
              height={14}
              className="invert opacity-40 group-hover:opacity-100 transition-opacity"
            />
            <span
              className={`${bebas.className} text-lg tracking-[0.08em] text-white/50 group-hover:text-white transition-colors`}
            >
              ÄGAPĒ
            </span>
          </a>

          {/* Desktop: just key links */}
          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#lineup"
              className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-white/25 hover:text-white transition-colors`}
            >
              LINEUP
            </a>
            <a
              href="#about"
              className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-white/25 hover:text-white transition-colors`}
            >
              ABOUT
            </a>
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-[#ff2020] hover:text-white transition-colors border border-[#ff2020]/30 hover:border-white/30 px-4 py-2`}
            >
              TICKETS →
            </a>
          </div>

          {/* Mobile ticket link */}
          <a
            href={FESTIVAL.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden text-[10px] tracking-[0.1em] text-[#ff2020] border border-[#ff2020]/30 px-3 py-1.5"
          >
            TICKETS
          </a>
        </div>
      </nav>

      {/* ========== HERO — Massive type, instant ========== */}
      <section
        id="hero"
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.2) contrast(1.2)" }}
        >
          <source src={VIDEOS.flyerAnimated.webm} type="video/webm" />
          <source src={VIDEOS.flyerAnimated.mp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative z-10 text-center px-6 w-full"
        >
          {/* Tiny location label */}
          <p
            className={`${spaceMono.className} text-[10px] tracking-[0.3em] text-white/25 mb-6`}
          >
            BROOKLYN, NEW YORK
          </p>

          {/* MASSIVE festival name */}
          <h1
            className={`${bebas.className} text-[22vw] sm:text-[18vw] md:text-[15vw] leading-[0.82] tracking-[0.02em] text-white`}
          >
            ÄGAPĒ
          </h1>
          <h2
            className={`${bebas.className} text-[8vw] sm:text-[6vw] md:text-[5vw] leading-[0.9] tracking-[0.15em] text-white/30 -mt-1`}
          >
            FESTIVAL
          </h2>

          {/* Date strip */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="h-[1px] w-8 bg-white/15" />
            <p
              className={`${spaceMono.className} text-[11px] tracking-[0.15em] text-white/40`}
            >
              SEPT 5 + 6 — 2026
            </p>
            <div className="h-[1px] w-8 bg-white/15" />
          </div>

          {/* Venue */}
          <p
            className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-white/20 mt-3`}
          >
            INDUSTRY CITY
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span
              className={`${spaceMono.className} text-[8px] tracking-[0.3em] text-white/15`}
            >
              SCROLL
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* ========== STATS BAR ========== */}
      <div className="border-y border-white/[0.06] bg-black">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6 flex flex-wrap items-center justify-between gap-4">
          {[
            `${totalArtists} ARTISTS`,
            "2 DAYS",
            "4 STAGES",
            "1 CITY",
          ].map((stat, i) => (
            <span
              key={i}
              className={`${bebas.className} text-2xl sm:text-3xl tracking-[0.08em] text-white/20`}
            >
              {stat}
            </span>
          ))}
        </div>
      </div>

      {/* ========== ABOUT ========== */}
      <section id="about" className="py-28 sm:py-40 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <Rule label="ABOUT" className="mb-16" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Giant pull quote */}
            <Reveal className="lg:col-span-7">
              <h2
                className={`${bebas.className} text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] tracking-[0.01em] text-white/90`}
              >
                From raw warehouse
                <br />
                sessions to
                <br />
                <span className="text-[#ff2020]">full-scale raves</span>
              </h2>
            </Reveal>

            {/* Body text — right column */}
            <Reveal delay={0.15} className="lg:col-span-5 flex flex-col justify-end">
              <p
                className={`${spaceMono.className} text-[13px] leading-[2] text-white/40 mb-6`}
              >
                {COPY.aboutExtended}
              </p>
              <p
                className={`${spaceMono.className} text-[10px] tracking-[0.12em] text-white/15`}
              >
                — {COPY.origin.toUpperCase()}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== FULL-BLEED PHOTO ========== */}
      <Reveal>
        <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
          <Image
            src={PHOTOS[0]}
            alt="ÄGAPĒ crowd"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          <div className="absolute bottom-6 left-6 lg:left-12">
            <span
              className={`${spaceMono.className} text-[9px] tracking-[0.2em] text-white/30`}
            >
              PAST EVENTS — BROOKLYN, NY
            </span>
          </div>
        </div>
      </Reveal>

      {/* ========== FLYER SECTION ========== */}
      <section className="py-28 sm:py-40 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <Rule label="THE LINEUP" className="mb-16" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Flyer */}
            <Reveal>
              <div className="max-w-lg mx-auto lg:mx-0">
                <Image
                  src={`${BASE_PATH}/assets/1000x1778.avif`}
                  alt="ÄGAPĒ FESTIVAL 2026 — Full Lineup"
                  width={600}
                  height={1067}
                  className="w-full h-auto"
                />
              </div>
            </Reveal>

            {/* Copy */}
            <Reveal delay={0.1}>
              <h3
                className={`${bebas.className} text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[0.02em] text-white mb-8`}
              >
                A STACKED
                <br />
                WEEKEND
              </h3>
              <p
                className={`${spaceMono.className} text-[13px] leading-[2] text-white/40 mb-6`}
              >
                Two days of unrelenting sound across indoor and outdoor stages
                at Industry City, Brooklyn. From internationally acclaimed
                headliners to rising underground talent — every set is curated
                to deliver the energy ÄGAPĒ is known for.
              </p>
              <p
                className={`${spaceMono.className} text-[12px] leading-[2] text-white/25 mb-10`}
              >
                Day one brings the raw power of the ÄGAPĒ and Face 2 Face
                stages. Day two escalates with 44 taking over both rooms for a
                relentless closing chapter.
              </p>
              <a
                href={FESTIVAL.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-[#ff2020]/30 hover:border-[#ff2020] px-8 py-4 transition-all duration-300 group"
              >
                <span
                  className={`${spaceMono.className} text-[11px] tracking-[0.12em] text-[#ff2020] group-hover:text-white transition-colors`}
                >
                  SECURE YOUR SPOT →
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== FULL-BLEED PHOTO #2 ========== */}
      <Reveal>
        <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
          <Image
            src={PHOTOS[4]}
            alt="ÄGAPĒ event"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
      </Reveal>

      {/* ========== LINEUP — Hover reveal ========== */}
      <section id="lineup" className="py-28 sm:py-40 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <Rule label="ARTISTS" className="mb-8" />
            <div className="flex items-baseline justify-between mb-16">
              <h2
                className={`${bebas.className} text-6xl sm:text-8xl md:text-9xl tracking-[0.02em] text-white leading-[0.85]`}
              >
                THE
                <br />
                LINEUP
              </h2>
              <span
                className={`${spaceMono.className} text-[10px] tracking-[0.1em] text-white/15 hidden sm:block`}
              >
                {totalArtists} ARTISTS
                <br />4 STAGES
              </span>
            </div>
          </Reveal>

          <div className="space-y-20">
            {stages.map((stage) => (
              <Reveal key={`${stage.day}-${stage.stage}`}>
                <StageSection stage={stage} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TICKETS CTA ========== */}
      <section className="relative py-32 sm:py-44 overflow-hidden">
        {/* Video bg */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.12) saturate(0.3)" }}
        >
          <source src={VIDEOS.redStrobes.mp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-6">
          <Reveal>
            <p
              className={`${spaceMono.className} text-[10px] tracking-[0.3em] text-white/20 mb-8`}
            >
              SECURE YOUR ENTRY
            </p>
            <h2
              className={`${bebas.className} text-[18vw] sm:text-[14vw] md:text-[12vw] leading-[0.82] tracking-[0.02em] text-white mb-6`}
            >
              GET
              <br />
              TICKETS
            </h2>
            <p
              className={`${spaceMono.className} text-[11px] tracking-[0.12em] text-white/30 mb-12`}
            >
              {FESTIVAL.tagline} — {FESTIVAL.venue.full}
            </p>
            <a
              href={FESTIVAL.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-[#ff2020] hover:bg-[#ff2020] px-12 py-5 transition-all duration-300 group"
            >
              <span
                className={`${bebas.className} text-2xl tracking-[0.15em] text-[#ff2020] group-hover:text-white transition-colors`}
              >
                BUY NOW →
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ========== PHOTO STRIP ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-white/[0.04]">
        {PHOTOS.slice(0, 4).map((photo, i) => (
          <div key={photo} className="relative aspect-square overflow-hidden group">
            <Image
              src={photo}
              alt={`Event ${i + 1}`}
              fill
              className="object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-700"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      {/* ========== PARTNERS ========== */}
      <section className="py-20 sm:py-28 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <Rule label="PARTNERS" className="mb-14" />
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
                        className="opacity-25 group-hover:opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500 object-contain max-h-[45px] w-auto"
                      />
                    </a>
                  ) : (
                    <span
                      className={`${spaceMono.className} text-[11px] tracking-[0.1em] text-white/15 group-hover:text-white/50 transition-colors`}
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

      {/* ========== MARQUEE ========== */}
      <div className="py-4 border-y border-white/[0.04]">
        <Marquee speed={25}>
          {[
            "ÄGAPĒ FESTIVAL",
            "BROOKLYN",
            "HARD TECHNO",
            "INDUSTRY CITY",
            "SEPTEMBER 2026",
          ].map((t, i) => (
            <span key={i}>
              <span
                className={`${bebas.className} text-xl tracking-[0.1em] text-white/10 mx-6`}
              >
                {t}
              </span>
              <span className="text-[#ff2020]/20 mx-2">×</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="bg-black px-6 lg:px-12 py-16 sm:py-24">
        <div className="max-w-[1600px] mx-auto">
          {/* Big logo text */}
          <Reveal>
            <h2
              className={`${bebas.className} text-[15vw] sm:text-[10vw] leading-[0.82] tracking-[0.02em] text-white/[0.04] mb-16`}
            >
              ÄGAPĒ
              <br />
              FESTIVAL
            </h2>
          </Reveal>

          <Rule className="mb-12" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Info */}
            <div>
              <p
                className={`${spaceMono.className} text-[9px] font-bold tracking-[0.2em] text-white/25 mb-4`}
              >
                INFO
              </p>
              <p className={`${spaceMono.className} text-[11px] text-white/20 leading-relaxed`}>
                {FESTIVAL.venue.full}
                <br />
                {FESTIVAL.tagline}
              </p>
            </div>

            {/* Navigate */}
            <div>
              <p
                className={`${spaceMono.className} text-[9px] font-bold tracking-[0.2em] text-white/25 mb-4`}
              >
                NAVIGATE
              </p>
              <div className="flex flex-col gap-2">
                {["#about", "#lineup"].map((href) => (
                  <a
                    key={href}
                    href={href}
                    className={`${spaceMono.className} text-[11px] text-white/20 hover:text-white transition-colors`}
                  >
                    {href.replace("#", "").toUpperCase()}
                  </a>
                ))}
                <a
                  href={FESTIVAL.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${spaceMono.className} text-[11px] text-[#ff2020]/50 hover:text-[#ff2020] transition-colors`}
                >
                  TICKETS
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <p
                className={`${spaceMono.className} text-[9px] font-bold tracking-[0.2em] text-white/25 mb-4`}
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
                    className={`${spaceMono.className} text-[11px] text-white/20 hover:text-white transition-colors`}
                  >
                    {s.handle}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p
                className={`${spaceMono.className} text-[9px] font-bold tracking-[0.2em] text-white/25 mb-4`}
              >
                CONTACT
              </p>
              <a
                href={`mailto:${FESTIVAL.contactEmail}`}
                className={`${spaceMono.className} text-[11px] text-white/20 hover:text-white transition-colors`}
              >
                {FESTIVAL.contactEmail}
              </a>
            </div>
          </div>

          <Rule className="my-12" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p
              className={`${spaceMono.className} text-[9px] tracking-[0.1em] text-white/10`}
            >
              © {FESTIVAL.year} {FESTIVAL.name}
            </p>
            <p
              className={`${spaceMono.className} text-[9px] tracking-[0.1em] text-white/10`}
            >
              ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
