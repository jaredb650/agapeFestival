"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle } from "./idle";
import { pickHeroVideo } from "../load/videoSource";
import { withGsap } from "./loadGsap";
import { GlitchLayer } from "@/components/winter/ui";
import { playWithRescue } from "./GestureRescue";
import { onSecondWhileVisible } from "@/components/winter/perf";
import { onBootDone } from "@/components/winter/preloader/boot";
import type { HeroVideo as HeroVideoConfig } from "./media";

// three.js ships only to desktop mice, after the intro and an idle moment: phones get the static logo with a
// tap glitch (CSS GlitchLayer) and never download WebGL. On a scrolling page the deployed site's touch
// distortion (touch-action: none on the logo) would trap swipes that start on it.
const GlitchLogo = dynamic(() => import("@/components/GlitchLogo"), { ssr: false });

export interface HeroLogoAsset {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

/**
 * The ÄGAPĒ Festival logo, as deployed: the static image paints first (and
 * glitches in with the CSS `wh-logo-in`), then desktop mice get the deployed
 * three.js mouse-trail distortion (GlitchLogo, render-on-demand) using the same
 * cached file as its texture. Reduced motion: static image only.
 */
export function HeroLogo({ logo, sizes }: { logo: HeroLogoAsset; sizes: string }) {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const fine = motionOk && window.matchMedia("(hover: hover) and (pointer: fine)").matches && navigator.maxTouchPoints === 0;
    if (!fine) return;
    let swap = 0;
    let cancelIdle = () => {};
    // After the logo has glitched in (timed from the preloader's hand-off, or from mount without one).
    const off = onBootDone((at) => {
      const wait = at === null ? 2000 : Math.max(0, at + 2000 - performance.now());
      swap = window.setTimeout(() => {
        // Fetch the three.js chunk first and swap only once it's in: rendering the lazy component before
        // then leaves the logo box empty for a few frames, which jolts the whole lockup (text jumps).
        cancelIdle = afterLoadIdle(() => {
          void import("@/components/GlitchLogo").then(() => setWebgl(true), () => {});
        }, 0);
      }, wait);
    });
    return () => {
      off();
      clearTimeout(swap);
      cancelIdle();
    };
  }, []);

  if (webgl) return <GlitchLogo imageSrc={logo.src} />;
  return (
    <GlitchLayer intensity="subtle" className="wh__logo-static">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} srcSet={logo.srcSet} sizes={sizes} width={logo.width} height={logo.height} alt="" draggable={false} fetchPriority="high" />
    </GlitchLayer>
  );
}

// ---- Countdown -----------------------------------------------------------

const pad2 = (n: number) => String(n).padStart(2, "0");
const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

/**
 * The deployed 4-box countdown (DAYS · HOURS · MINUTES · SECONDS). The digits
 * are written straight into the DOM on the page's shared, wall-clock-aligned
 * 1 Hz tick, only while the countdown is on screen and the tab is visible (no
 * React state, no re-render). Static HTML ships dashes (there is no "now").
 */
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const target = Date.parse(targetIso);
    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-n]"));
    return onSecondWhileVisible(el, (now) => {
      const s = Math.max(0, Math.floor((target - now) / 1000));
      const v = [pad2(Math.floor(s / 86400)), pad2(Math.floor(s / 3600) % 24), pad2(Math.floor(s / 60) % 60), pad2(s % 60)];
      for (let i = 0; i < cells.length; i++) if (cells[i].textContent !== v[i]) cells[i].textContent = v[i];
    });
  }, [targetIso]);

  return (
    <div ref={root} className="wh-count" role="timer" aria-label={label} data-nosnippet>
      {UNITS.map((unit) => (
        <div className="wh-count__cell" key={unit}>
          <span className="wh-count__n" data-n="">
            ––
          </span>
          <span className="wh-count__unit">{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Hero video ---------------------------------------------------------
// The video and its pause control live in different parts of the hero (the
// control can't sit inside the fading media box), so they share this tiny store.
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

/** Poster-first, decorative hero video (AV1 / HEVC / H.264 picked by load/videoSource). */
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
    const cancel = afterLoadIdle(() => void pickHeroVideo(video, portrait).then(setSrc), 200);
    const onMotion = () => reduced.matches && setSrc(null);
    reduced.addEventListener("change", onMotion);
    return () => {
      cancel();
      reduced.removeEventListener("change", onMotion);
    };
  }, [video]);

  // Play while the hero is on screen (until its media has faded out), else pause.
  useEffect(() => {
    const vid = ref.current;
    const hero = document.getElementById("hero");
    if (!src || !vid || !hero) return;
    hvEl = vid;
    setHvState("waiting");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) vid.pause();
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
      className="wh__video"
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

/** The deployed pause/play button, bottom right (WCAG 2.2.2: motion longer than 5 s can be stopped). */
export function HeroVideoToggle() {
  const state = useHvState();
  if (state === "off") return null;
  const playing = state === "playing";
  return (
    <button
      type="button"
      className="wh__motion"
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
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        {playing ? (
          <>
            <rect x="4" y="2" width="2" height="12" />
            <rect x="10" y="2" width="2" height="12" />
          </>
        ) : (
          <path d="M4 2 14 8 4 14Z" />
        )}
      </svg>
    </button>
  );
}

/**
 * The deployed content fit: on short screens the lockup scales down (never
 * up) to fit the hero, so it always reads as one screen. Writes one custom
 * property from a ResizeObserver; the CSS applies it with the `scale`
 * property, which composes with the scroll exit's transform.
 */
export function HeroFit() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    const content = hero?.querySelector<HTMLElement>("[data-hero-copy]");
    if (!hero || !content) return;
    const fit = () => {
      const cs = getComputedStyle(hero);
      const avail = Math.max(1, hero.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom));
      content.style.setProperty("--content-scale", String(Math.min(1, avail / content.offsetHeight)));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(hero);
    ro.observe(content);
    fit();
    return () => ro.disconnect();
  }, []);
  return null;
}

/**
 * Scroll exit, adapted from the deployed single screen to the scrolling page:
 * the footage sinks and dissolves into the tower behind it, the lockup lifts
 * away, the corner ticks and controls fade. Also parks the hero's loops
 * (`data-off`) while it is off screen.
 */
export function HeroExit() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => hero.toggleAttribute("data-off", !e.isIntersecting));
    io.observe(hero);
    const undo = withGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const media = hero.querySelector("[data-hero-media]");
        const copy = hero.querySelector("[data-hero-copy]");
        const meta = hero.querySelectorAll("[data-hero-meta]");
        // The footage has fully dissolved by ~48% (and its bottom edge is feathered), so the hero's bottom edge
        // never shows as a seam over the tower.
        gsap.to(media, { yPercent: 16, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.fromTo(media, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "5% top", end: "48% top", scrub: true } });
        // fromTo, never to(): the intro's CSS fades start at opacity 0, and a to() would record that as its start.
        // (The CSS keyframes only set `from`, so once they finish the inline value GSAP writes shows through.)
        gsap.fromTo(
          copy,
          { y: 0, opacity: 1 },
          {
            y: () => -0.14 * window.innerHeight,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "45% top", scrub: true, invalidateOnRefresh: true },
          },
        );
        gsap.fromTo(meta, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "25% top", scrub: true } });
      });
      return () => mm.revert();
    });
    return () => {
      io.disconnect();
      undo();
    };
  }, []);
  return null;
}
