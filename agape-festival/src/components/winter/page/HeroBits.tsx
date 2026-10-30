"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle } from "./idle";
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

// ---- Hero video ---------------------------------------------------------
// The video and its pause control live in different parts of the hero (the
// control can't sit inside the feathered, fading media box), so they share
// this tiny store.
type HeroVideoState = "off" | "waiting" | "playing" | "paused";
let hvState: HeroVideoState = "off";
let hvUserPaused = false;
let hvEl: HTMLVideoElement | null = null;
const hvSubs = new Set<() => void>();
const setHvState = (s: HeroVideoState) => {
  if (s === hvState) return;
  hvState = s;
  hvSubs.forEach((f) => f());
};
const subscribeHv = (cb: () => void) => {
  hvSubs.add(cb);
  return () => void hvSubs.delete(cb);
};
const useHvState = () => useSyncExternalStore(subscribeHv, () => hvState, () => "off" as HeroVideoState);

/** Poster-first, decorative hero video. */
export function HeroVideo({ video }: { video: HeroVideoConfig }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  // Decide once, after load: the poster is the LCP, the video never competes with it.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduced.matches || conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const portrait = window.matchMedia("(max-aspect-ratio: 3/4)").matches;
    const cancel = afterLoadIdle(() => setSrc(portrait && video.srcMobile ? video.srcMobile : video.src), 200);
    const onMotion = () => reduced.matches && setSrc(null);
    reduced.addEventListener("change", onMotion);
    return () => {
      cancel();
      reduced.removeEventListener("change", onMotion);
    };
  }, [video.src, video.srcMobile]);

  // Play while the hero is on screen (until its media has faded out), else pause.
  useEffect(() => {
    const vid = ref.current;
    const hero = document.getElementById("hero");
    if (!src || !vid || !hero) return;
    hvEl = vid;
    setHvState("waiting");
    let inView = true;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (!inView) vid.pause();
        else if (!hvUserPaused) playWithRescue(vid);
      },
      { rootMargin: "-50% 0px 0px 0px" },
    );
    io.observe(hero);
    if (!hvUserPaused) playWithRescue(vid);
    return () => {
      io.disconnect();
      if (hvEl === vid) hvEl = null;
      setHvState("off");
    };
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
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => {
        setPlaying(true);
        setHvState("playing");
      }}
      onPause={() => {
        setPlaying(false);
        setHvState("paused");
      }}
      onError={() => {
        setPlaying(false);
        setHvState("off");
      }}
    />
  );
}

/** Pause/play for the hero video (WCAG 2.2.2: motion longer than 5 s can be stopped). */
export function HeroVideoToggle() {
  const state = useHvState();
  if (state === "off") return null;
  const playing = state === "playing";
  return (
    <button
      type="button"
      className="whero__toggle"
      aria-label={playing ? "Pause background video" : "Play background video"}
      onClick={() => {
        const vid = hvEl;
        if (!vid) return;
        if (playing) {
          hvUserPaused = true;
          vid.pause();
        } else {
          hvUserPaused = false;
          vid.play().catch(() => {});
        }
      }}
    >
      <svg viewBox="0 0 10 10" aria-hidden="true">
        {playing ? <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" fill="currentColor" /> : <path d="M2 1l7 4-7 4z" fill="currentColor" />}
      </svg>
      <span aria-hidden="true">{playing ? "Pause" : "Play"}</span>
    </button>
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
