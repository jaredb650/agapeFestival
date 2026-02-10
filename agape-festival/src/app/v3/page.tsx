"use client";

// ============================================================
// ÄGAPĒ FESTIVAL 2026 — V3: TYPOGRAPHIC EDITORIAL
// Inspired by SSENSE, Resident Advisor, luxury fashion editorial.
// Type-driven design. Black and white. Every pixel intentional.
// ============================================================

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Cormorant_Garamond, Darker_Grotesque } from "next/font/google";
import Image from "next/image";
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

/* ─── Fonts ─────────────────────────────────────────────── */

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const sans = Darker_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ─── Constants ─────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NAV_LINKS = [
  { num: "01", label: "LINEUP", href: "#lineup" },
  { num: "02", label: "ABOUT", href: "#about" },
  { num: "03", label: "TICKETS", href: "#tickets" },
  { num: "04", label: "MERCH", href: "#merch" },
];

const MARQUEE_PHRASE =
  "SEPTEMBER 5+6 2026 \u2014 INDUSTRY CITY \u2014 BROOKLYN NYC \u00a0\u00a0\u2022\u00a0\u00a0 ";

/* ─── Injected Styles ───────────────────────────────────── */

const PAGE_CSS = `
  html { scroll-behavior: smooth; }
  [id] { scroll-margin-top: 72px; }

  @keyframes ticker-slide {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-track {
    animation: ticker-slide 45s linear infinite;
    will-change: transform;
  }

  ::selection {
    background: #fff;
    color: #000;
  }
`;

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTag({ number, title }: { number: string; title: string }) {
  return (
    <FadeIn className="flex items-center gap-3 mb-10 md:mb-16">
      <span
        className={`${sans.className} text-[10px] tracking-[0.5em] uppercase opacity-25 font-medium`}
      >
        {number}
      </span>
      <span className="w-6 h-px bg-white/20 inline-block" />
      <span
        className={`${sans.className} text-[10px] tracking-[0.5em] uppercase font-medium`}
      >
        {title}
      </span>
    </FadeIn>
  );
}

function CornerBrackets({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const arm = "absolute border-white/25";
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
    >
      {/* top-left */}
      <span
        className={`${arm} top-0 left-0 w-5 h-5 md:w-8 md:h-8 border-t border-l`}
      />
      {/* top-right */}
      <span
        className={`${arm} top-0 right-0 w-5 h-5 md:w-8 md:h-8 border-t border-r`}
      />
      {/* bottom-left */}
      <span
        className={`${arm} bottom-0 left-0 w-5 h-5 md:w-8 md:h-8 border-b border-l`}
      />
      {/* bottom-right */}
      <span
        className={`${arm} bottom-0 right-0 w-5 h-5 md:w-8 md:h-8 border-b border-r`}
      />
      {children}
    </motion.div>
  );
}

function RuledLine({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-white/[0.07] ${className}`} />;
}

/* ─── Marquee Ticker ─────────────────────────────────────── */

function Ticker() {
  const block = Array(12).fill(MARQUEE_PHRASE).join("");
  return (
    <div className="overflow-hidden border-t border-white/[0.07] py-4">
      <div className="ticker-track flex whitespace-nowrap">
        <span
          className={`${sans.className} text-[9px] md:text-[11px] tracking-[0.4em] uppercase opacity-40 shrink-0`}
        >
          {block}
        </span>
        <span
          className={`${sans.className} text-[9px] md:text-[11px] tracking-[0.4em] uppercase opacity-40 shrink-0`}
        >
          {block}
        </span>
      </div>
    </div>
  );
}

/* ─── Navigation ─────────────────────────────────────────── */

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/90 backdrop-blur-md border-b border-white/[0.08]">
        {/* Bar */}
        <div className="flex items-center justify-between px-6 md:px-12 h-14 md:h-[60px]">
          <a
            href="#"
            className={`${serif.className} text-[17px] md:text-[19px] tracking-[0.1em] hover:opacity-50 transition-opacity duration-300`}
          >
            ÄGAPĒ
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${sans.className} text-[10px] tracking-[0.35em] uppercase hover:opacity-40 transition-opacity duration-300 font-medium`}
              >
                <span className="opacity-25 mr-1.5">{item.num}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`${sans.className} md:hidden text-[10px] tracking-[0.4em] uppercase font-medium hover:opacity-50 transition-opacity cursor-pointer`}
          >
            {menuOpen ? "CLOSE" : "MENU"}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`${sans.className} text-[11px] tracking-[0.4em] uppercase font-medium hover:opacity-50 transition-opacity`}
                  >
                    <span className="opacity-25 mr-2">{item.num}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

/* ─── Artist Name (expandable) ───────────────────────────── */

function ArtistName({ artist, index }: { artist: Artist; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -14 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.045, ease: EASE }}
      className="border-b border-white/[0.05]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left group flex items-baseline justify-between py-3 md:py-5 cursor-pointer"
      >
        <div className="flex items-baseline gap-3 md:gap-5 min-w-0">
          <span
            className={`${sans.className} text-[9px] md:text-[10px] tracking-[0.2em] opacity-[0.12] font-medium tabular-nums shrink-0`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`${serif.className} font-semibold tracking-[-0.015em] group-hover:translate-x-2 transition-transform duration-500 truncate`}
            style={{
              fontSize: "clamp(1.9rem, 5.2vw, 5.2rem)",
              lineHeight: 1.08,
            }}
          >
            {artist.name}
          </span>
          {artist.note && (
            <span
              className={`${sans.className} text-[8px] md:text-[9px] tracking-[0.35em] uppercase opacity-20 shrink-0`}
            >
              {artist.note}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`${sans.className} text-sm md:text-base opacity-[0.15] group-hover:opacity-40 transition-opacity shrink-0 ml-4`}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 items-start pb-7 pl-8 md:pl-14 max-w-2xl">
              {/* Placeholder avatar */}
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/[0.04] border border-white/[0.08] shrink-0 mt-0.5" />
              <p
                className={`${sans.className} text-[13px] md:text-[15px] leading-[1.75] opacity-35 font-light`}
              >
                {artist.bio}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function V3Page() {
  const stages = getStages();

  return (
    <div
      className={`${sans.className} bg-black text-white min-h-screen relative`}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <Navigation />

      {/* ═══ HERO ═══════════════════════════════════════════ */}

      <section className="h-screen flex flex-col justify-between pt-14 md:pt-[60px] relative overflow-hidden">
        {/* Centred title block */}
        <div className="flex-1 flex items-center justify-center px-4">
          <CornerBrackets className="px-6 py-8 md:px-14 md:py-12 lg:px-20 lg:py-14">
            <div className="text-center">
              {/* Date label */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                className={`${sans.className} text-[8px] md:text-[10px] tracking-[0.6em] uppercase opacity-35 mb-5 md:mb-8 font-medium`}
              >
                {FESTIVAL.tagline}
              </motion.p>

              {/* ÄGAPĒ */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
                className={`${serif.className} font-normal leading-[0.85] tracking-[-0.035em]`}
                style={{ fontSize: "clamp(3.2rem, 12.5vw, 10.5rem)" }}
              >
                ÄGAPĒ
              </motion.h1>

              {/* FESTIVAL */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
                className={`${serif.className} font-normal leading-[0.85] tracking-[-0.035em] mt-0.5 md:mt-1`}
                style={{ fontSize: "clamp(3.2rem, 12.5vw, 10.5rem)" }}
              >
                FESTIVAL
              </motion.h1>

              {/* Venue label */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.05, ease: EASE }}
                className={`${sans.className} text-[8px] md:text-[10px] tracking-[0.6em] uppercase opacity-35 mt-5 md:mt-8 font-medium`}
              >
                {FESTIVAL.venue.name} &mdash; {FESTIVAL.venue.location}
              </motion.p>
            </div>
          </CornerBrackets>
        </div>

        {/* Marquee ticker at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Ticker />
        </motion.div>
      </section>

      {/* ═══ ABOUT ══════════════════════════════════════════ */}

      <section
        id="about"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-40 lg:py-48"
      >
        <SectionTag number="02" title="ABOUT" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6">
          {/* Pull-quote — wide column */}
          <FadeIn className="md:col-span-7" delay={0.1}>
            <p
              className={`${serif.className} font-light leading-[1.38] tracking-[-0.01em]`}
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.8rem)" }}
            >
              &ldquo;{COPY.about}&rdquo;
            </p>
          </FadeIn>

          {/* Extended copy — offset narrow column */}
          <div className="md:col-span-4 md:col-start-9 md:pt-24">
            <FadeIn delay={0.25}>
              <p
                className={`${sans.className} text-[13px] md:text-[14px] leading-[1.85] opacity-35 font-light`}
              >
                {COPY.aboutExtended}
              </p>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p
                className={`${sans.className} text-[9px] tracking-[0.5em] uppercase opacity-[0.15] mt-8 font-medium`}
              >
                {COPY.origin}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <RuledLine />

      {/* ═══ VIDEO ══════════════════════════════════════════ */}

      <section className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-36">
        <FadeIn>
          <p
            className={`${sans.className} text-[9px] tracking-[0.5em] uppercase opacity-25 mb-6 font-medium`}
          >
            FEATURED
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="max-w-4xl mx-auto border border-white/[0.08] relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full block"
            >
              <source src={VIDEOS.davidLohlein.webm} type="video/webm" />
              <source src={VIDEOS.davidLohlein.mp4} type="video/mp4" />
            </video>
          </div>
        </FadeIn>
      </section>

      <RuledLine />

      {/* ═══ TICKETS ════════════════════════════════════════ */}

      <section
        id="tickets"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-32 md:py-48 lg:py-56"
      >
        <SectionTag number="03" title="TICKETS" />

        <FadeIn delay={0.1}>
          <a
            href={FESTIVAL.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${serif.className} font-normal leading-[0.95] tracking-[-0.03em] hover:opacity-40 transition-opacity duration-500 inline-block group`}
            style={{ fontSize: "clamp(2.8rem, 9vw, 8rem)" }}
          >
            GET TICKETS{" "}
            <span className="inline-block group-hover:translate-x-4 transition-transform duration-500">
              &rarr;
            </span>
          </a>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p
            className={`${sans.className} text-[9px] tracking-[0.4em] uppercase opacity-20 mt-8 md:mt-12 font-medium`}
          >
            {FESTIVAL.venue.full} &mdash; {FESTIVAL.tagline}
          </p>
        </FadeIn>
      </section>

      <RuledLine />

      {/* ═══ LINEUP ═════════════════════════════════════════ */}

      <section
        id="lineup"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-40 lg:py-48"
      >
        <SectionTag number="04" title="LINEUP" />

        {stages.map((stage, si) => (
          <div
            key={`${stage.day}-${stage.stage}`}
            className={si > 0 ? "mt-16 md:mt-28" : ""}
          >
            {/* Stage header */}
            <FadeIn className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-5 md:mb-8">
              <span
                className={`${sans.className} text-[10px] tracking-[0.4em] uppercase opacity-45 font-medium`}
              >
                {stage.dayLabel}
              </span>
              <span
                className={`${sans.className} text-[10px] tracking-[0.15em] opacity-[0.12]`}
              >
                /
              </span>
              <span
                className={`${sans.className} text-[10px] tracking-[0.4em] uppercase opacity-45 font-medium`}
              >
                {stage.stage} stage
              </span>
              <span
                className={`${sans.className} text-[10px] tracking-[0.15em] opacity-[0.12]`}
              >
                /
              </span>
              <span
                className={`${sans.className} text-[10px] tracking-[0.4em] uppercase opacity-25 font-medium`}
              >
                Hosted by {stage.host}
              </span>
            </FadeIn>

            <RuledLine className="mb-0.5" />

            {/* Artist names */}
            {stage.artists.map((artist, ai) => (
              <ArtistName
                key={`${stage.day}-${stage.stage}-${artist.name}`}
                artist={artist}
                index={ai}
              />
            ))}
          </div>
        ))}
      </section>

      <RuledLine />

      {/* ═══ MERCH ══════════════════════════════════════════ */}

      <section
        id="merch"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-36"
      >
        <SectionTag number="05" title="MERCH" />

        <FadeIn>
          <div className="py-16 md:py-24 flex flex-col items-center">
            <RuledLine className="max-w-md mx-auto mb-10 md:mb-14" />
            <p
              className={`${sans.className} text-[11px] md:text-[12px] tracking-[0.55em] uppercase opacity-25 font-medium text-center`}
            >
              COMING SOON
            </p>
            <p
              className={`${sans.className} text-[9px] tracking-[0.3em] uppercase opacity-[0.12] font-medium text-center mt-3`}
            >
              {COPY.merchComingSoon}
            </p>
            <RuledLine className="max-w-md mx-auto mt-10 md:mt-14" />
          </div>
        </FadeIn>
      </section>

      <RuledLine />

      {/* ═══ PARTNERS ═══════════════════════════════════════ */}

      <section className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-36">
        <SectionTag number="06" title="PARTNERS" />

        <FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-y-8">
            {PARTNERS.map((partner, i) => (
              <div key={partner.name} className="flex items-center">
                {i > 0 && (
                  <div className="w-px h-5 bg-white/[0.08] mx-5 md:mx-9 shrink-0 hidden sm:block" />
                )}
                {partner.logoUrl ? (
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    width={120}
                    height={48}
                    className="h-6 md:h-8 w-auto opacity-35 hover:opacity-60 transition-opacity duration-300 object-contain brightness-0 invert"
                  />
                ) : (
                  <span
                    className={`${sans.className} text-[11px] tracking-[0.4em] uppercase opacity-30 hover:opacity-55 transition-opacity duration-300 font-medium`}
                  >
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <RuledLine />

      {/* ═══ FOOTER ═════════════════════════════════════════ */}

      <footer className="px-6 md:px-12 lg:px-20 xl:px-28 py-14 md:py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {SOCIALS.map((s) => (
              <a
                key={s.handle}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${sans.className} text-[10px] tracking-[0.35em] uppercase opacity-25 hover:opacity-55 transition-opacity duration-300 font-medium`}
              >
                {s.handle}
              </a>
            ))}
            <a
              href={`mailto:${FESTIVAL.contactEmail}`}
              className={`${sans.className} text-[10px] tracking-[0.35em] uppercase opacity-25 hover:opacity-55 transition-opacity duration-300 font-medium`}
            >
              {FESTIVAL.contactEmail}
            </a>
          </div>

          {/* Copyright */}
          <p
            className={`${sans.className} text-[10px] tracking-[0.4em] uppercase opacity-[0.15] font-medium`}
          >
            &copy; {FESTIVAL.year} ÄGAPĒ
          </p>
        </div>
      </footer>
    </div>
  );
}
