"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle } from "./idle";
import { pickHeroVideo } from "../load/videoSource";
import { withGsap } from "./loadGsap";
import { GLITCH_EVENT, GlitchLayer } from "@/components/winter/ui";
import { playWithRescue } from "./GestureRescue";
import { onSecondWhileVisible } from "@/components/winter/perf";
import type { HeroVideo as HeroVideoConfig } from "./media";

// three.js only ships to desktop mice: phones get the CSS GlitchLayer (tap burst)
// and never download WebGL. GlitchLogo itself renders on demand (idle until touched).
const GlitchLogo = dynamic(() => import("@/components/GlitchLogo"), { ssr: false });

export interface HeroLogoAsset {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

/**
 * The big centred ÄGAPĒ Festival logo. The static <img> paints on the first
 * frame (the CSS power-on jitters it, never hides it, so it stays an early
 * LCP candidate); one glitch burst fires as the HUD assembles. Desktop mice
 * swap in the WebGL distortion once the intro is done, using the same
 * (already cached) WebP as its texture.
 */
export function HeroLogo({ logo, sizes }: { logo: HeroLogoAsset; sizes: string }) {
  const [webgl, setWebgl] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const burst = motionOk
      ? window.setTimeout(() => box.current?.querySelector(".w-glitch")?.dispatchEvent(new Event(GLITCH_EVENT)), 560)
      : 0;
    const fine =
      motionOk && window.matchMedia("(hover: hover) and (pointer: fine)").matches && navigator.maxTouchPoints === 0;
    const swap = fine ? window.setTimeout(() => setWebgl(true), 2400) : 0;
    return () => {
      clearTimeout(burst);
      clearTimeout(swap);
    };
  }, []);

  return (
    <div ref={box} className="wh__logo-box">
      {webgl ? (
        <GlitchLogo imageSrc={logo.src} />
      ) : (
        <GlitchLayer intensity="medium" idleEvery={9000} className="wh__logo-static">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            srcSet={logo.srcSet}
            sizes={sizes}
            width={logo.width}
            height={logo.height}
            alt=""
            draggable={false}
            fetchPriority="high"
          />
        </GlitchLayer>
      )}
    </div>
  );
}

// ---- Countdown -----------------------------------------------------------

const pad = (n: number, w: number) => String(n).padStart(w, "0");
const DECODE_MS = 700;
const LCD_ON_MS = 1000;

/**
 * DDD:HH:MM:SS LCD readout. The digits are written straight into the DOM once a
 * second (no React state, no re-render) on the page's shared 1 Hz tick, aligned
 * to the wall-clock second, and only while the readout is on screen and the tab
 * is visible. On start the digits decode in left to right from noise. Server
 * HTML (static export) has no "now", so it ships dashes over the unlit 8s.
 */
export function Countdown({
  targetIso,
  label,
  lead,
  meta,
}: {
  targetIso: string;
  /** Accessible name of the timer. */
  label: string;
  /** Header, left (e.g. "T–MINUS"). */
  lead: string;
  /** Header, right (e.g. "DAY 01 ▸ 02.19.27"). */
  meta: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const sr = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const target = Date.parse(targetIso);
    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-d]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let decodeTimer = 0;
    let decodeEnd = 0;

    const digitsNow = (now = Date.now()) => {
      const left = Math.max(0, Math.floor((target - now) / 1000));
      const d = Math.min(999, Math.floor(left / 86400));
      el.toggleAttribute("data-short", d < 100);
      el.toggleAttribute("data-done", left === 0);
      return { left, d, str: pad(d, 3) + pad(Math.floor(left / 3600) % 24, 2) + pad(Math.floor(left / 60) % 60, 2) + pad(left % 60, 2) };
    };
    const write = (s: string) => {
      for (let i = 0; i < cells.length; i++) if (cells[i].textContent !== s[i]) cells[i].textContent = s[i];
    };

    // The one-off decode: noisy digits locking in left to right, ~20 fps, then the shared tick takes over.
    const decodeStep = () => {
      decodeTimer = 0;
      const { str } = digitsNow();
      const now = performance.now();
      if (now >= decodeEnd) return write(str);
      const locked = Math.max(0, Math.floor((1 - (decodeEnd - now) / DECODE_MS) * cells.length));
      let noisy = "";
      for (let i = 0; i < str.length; i++) noisy += i < locked ? str[i] : String((Math.random() * 10) | 0);
      write(noisy);
      decodeTimer = window.setTimeout(decodeStep, 48);
    };

    // First reading: decode in (once), and give screen readers a one-off summary.
    const first = digitsNow();
    if (sr.current) sr.current.textContent = `${first.d} days, ${Math.floor(first.left / 3600) % 24} hours to go.`;
    // The decode waits for the LCD's CSS power-on (~1s after navigation start) so it is seen.
    if (!reduced) decodeEnd = Math.max(performance.now(), LCD_ON_MS) + DECODE_MS;

    // Digits change once a second on the page's shared, wall-clock-aligned tick, only while the readout is on
    // screen and the tab is visible (perf/ticker).
    const off = onSecondWhileVisible(el, (now) => {
      if (!el.hasAttribute("data-live")) el.setAttribute("data-live", "");
      if (performance.now() < decodeEnd) {
        if (!decodeTimer) decodeStep();
        return;
      }
      write(digitsNow(now).str);
    });
    return () => {
      off();
      clearTimeout(decodeTimer);
    };
  }, [targetIso]);

  const cell = (i: number) => (
    <span className="wh-lcd__d" data-d={i} key={i}>
      -
    </span>
  );
  const groups: [string, number[]][] = [
    ["Days", [0, 1, 2]],
    ["Hrs", [3, 4]],
    ["Min", [5, 6]],
    ["Sec", [7, 8]],
  ];

  return (
    <div ref={root} className="wh-lcd" role="timer" aria-label={label} data-nosnippet>
      <span className="wh-lcd__bar" aria-hidden="true">
        <span className="wh-lcd__orb" />
        <span className="wh-lcd__lead">{lead}</span>
        <span className="wh-lcd__rule" />
        <span className="wh-lcd__meta">{meta}</span>
        <span className="wh-lcd__orb" data-blink />
      </span>
      <span className="wh-lcd__screen" aria-hidden="true">
        <span className="wh-lcd__digits">
          {groups.map(([unit, idx], g) => (
            <span key={unit} className="wh-lcd__grp" data-unit={unit.toLowerCase()}>
              {g > 0 && <span className="wh-lcd__colon">:</span>}
              <span className="wh-lcd__cells">{idx.map(cell)}</span>
              <span className="wh-lcd__unit">{unit}</span>
            </span>
          ))}
        </span>
      </span>
      <span ref={sr} className="w-sr-only" />
    </div>
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
    const cancel = afterLoadIdle(() => void pickHeroVideo(video, portrait).then(setSrc), 200);
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

/** Pause/play for the hero video (WCAG 2.2.2: motion longer than 5 s can be stopped). A HUD transport chip. */
export function HeroVideoToggle() {
  const state = useHvState();
  if (state === "off") return null;
  const playing = state === "playing";
  return (
    <button
      type="button"
      className="wh-chip"
      data-playing={playing || undefined}
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
      <span className="wh-chip__led" aria-hidden="true" />
      <span className="wh-chip__feed" aria-hidden="true">
        Feed 01
      </span>
      <svg viewBox="0 0 10 10" aria-hidden="true">
        {playing ? <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" fill="currentColor" /> : <path d="M2 1l7 4-7 4z" fill="currentColor" />}
      </svg>
      <span className="wh-chip__label" aria-hidden="true">
        {playing ? "Pause" : "Play"}
      </span>
    </button>
  );
}

/**
 * Scroll exit: the footage sinks and dissolves into the tower behind it, the
 * copy lifts away, the HUD pulls back and fades. Also parks the HUD's looping
 * animations (`data-off`) while the hero is off screen.
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
        // Past a tween's end its layer sits at opacity 0: flag it so CSS parks the loops inside (hero.css).
        const parkWhenFaded = (attr: string) => ({
          onLeave: () => hero.setAttribute(attr, ""),
          onEnterBack: () => hero.removeAttribute(attr),
          onRefresh: (self: { progress: number }) => hero.toggleAttribute(attr, self.progress >= 1),
        });
        const media = hero.querySelector("[data-hero-media]");
        const copy = hero.querySelector("[data-hero-copy]");
        const hud = hero.querySelector("[data-hero-hud]");
        const meta = hero.querySelectorAll("[data-hero-meta]");
        // Parallax over the whole exit; the footage has fully dissolved by ~48% (and its bottom edge is feathered) so
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
          scrollTrigger: { trigger: hero, start: "top top", end: "45% top", scrub: true, invalidateOnRefresh: true, ...parkWhenFaded("data-faded") },
        });
        if (hud) {
          gsap.to(hud, {
            scale: 1.08,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "34% top", scrub: true, ...parkWhenFaded("data-hud-off") },
          });
        }
        gsap.to(meta, {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: true },
        });
        return () => {
          hero.removeAttribute("data-hud-off");
          hero.removeAttribute("data-faded");
        };
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
