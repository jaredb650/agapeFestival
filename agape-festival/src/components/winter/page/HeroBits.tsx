"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { withGsap } from "./loadGsap";
import { GlitchLayer } from "@/components/winter/ui";
import { playWithRescue } from "./GestureRescue";
import type { HeroVideo as HeroVideoConfig } from "./media";

// three.js only ships to desktop mice: phones get the CSS GlitchLayer (tap burst)
// and never download WebGL. GlitchLogo itself renders on demand (idle until touched).
const GlitchLogo = dynamic(() => import("@/components/GlitchLogo"), { ssr: false });

// PNG is the WebGL texture (desktop); phones get the 21 KB WebP of the same art.
const LOGO = { src: "/assets/logos/aFestWhite.png", webp: "/assets/logos/aFestWhite.webp", width: 586, height: 310 };

export function HeroLogo() {
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches &&
      navigator.maxTouchPoints === 0;
    if (!ok) return;
    const id = window.setTimeout(() => setWebgl(true), 1500);
    return () => clearTimeout(id);
  }, []);

  if (webgl) return <GlitchLogo imageSrc={LOGO.src} />;
  return (
    <GlitchLayer intensity="subtle" className="whero__logo-static">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO.webp} width={LOGO.width} height={LOGO.height} alt="" draggable={false} fetchPriority="high" />
    </GlitchLayer>
  );
}

const noSubscribe = () => () => {};

/** "T–112 DAYS": a date count (not a clock), since doors time isn't announced. */
export function DaysOut({ startIso, label }: { startIso: string; label: string }) {
  // Server render (static export) has no "today"; the client fills it in after hydration.
  const days = useSyncExternalStore(
    noSubscribe,
    () => Math.ceil((Date.parse(`${startIso}T00:00:00-05:00`) - Date.now()) / 86_400_000),
    () => null,
  );
  if (days === null || days <= 0) return null;
  return (
    <p className="w-hud whero__count" aria-label={`${days} days until ${label}`}>
      <span aria-hidden="true">T–{days} days</span>
    </p>
  );
}

function useMedia(query: string): boolean | null {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => null,
  );
}

/** Optional hero video over the photo: playing-gated opacity + first-tap rescue (iOS Low Power Mode). */
export function HeroVideo({ video, portraitQuery }: { video: HeroVideoConfig; portraitQuery: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const portrait = useMedia(portraitQuery);
  const src = reduced !== false ? null : portrait && video.srcMobile ? video.srcMobile : video.src;
  useEffect(() => {
    if (src) playWithRescue(ref.current);
  }, [src]);
  if (!src) return null;
  return (
    <video
      ref={ref}
      className="whero__video"
      data-playing={playing || undefined}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => setPlaying(false)}
    />
  );
}

/** As the hero leaves, the photo sinks and dissolves into the tower behind it; the copy lifts away. */
export function HeroExit() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    return withGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const media = hero.querySelector("[data-hero-media]");
        const copy = hero.querySelector("[data-hero-copy]");
        const meta = hero.querySelectorAll("[data-hero-meta]");
        // Parallax over the whole exit; the photo has fully dissolved by ~48% (and its bottom edge is feathered) so
        // the hero's bottom edge never shows as a seam over the tower.
        gsap.to(media, {
          yPercent: 16,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.fromTo(
          media,
          { opacity: 1 },
          { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "5% top", end: "48% top", scrub: true } },
        );
        gsap.to(copy, {
          y: () => -0.16 * window.innerHeight,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "45% top", scrub: true, invalidateOnRefresh: true },
        });
        gsap.to(meta, {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: true },
        });
      });
      return () => mm.revert();
    });
  }, []);
  return null;
}
