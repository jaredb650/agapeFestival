"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

/** Dispatch on a GlitchLayer root (`.w-glitch`) to fire one burst from outside. */
export const GLITCH_EVENT = "w-glitch-burst";

export interface GlitchLayerProps {
  /** Ideally one transparent <img> (a floating flyer layer). Rendered twice: base + slice copy. */
  children: ReactNode;
  /** Offset scale of the RGB split and slices. Default "medium" (5px). */
  intensity?: "subtle" | "medium" | "strong";
  /** React to mouse hover, click/tap and keyboard focus. Default true. */
  interactive?: boolean;
  /** Fire an unprompted burst every ~N ms (±40%) while on screen. Off by default. */
  idleEvery?: number;
  /** Burst length, ms. Matches the CSS keyframes (460). */
  burstMs?: number;
  as?: "div" | "figure" | "span";
  className?: string;
  style?: CSSProperties;
}

// Content scrolling under a resting mouse fires pointerenter; that is not a
// hover and must not glitch (it was a burst per layer per scroll). One shared,
// passive listener records the last scroll.
let lastScroll = -1e9;
let scrollWatchers = 0;
const onScroll = () => {
  lastScroll = performance.now();
};
function watchScroll() {
  if (scrollWatchers++ === 0) window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    if (--scrollWatchers === 0) window.removeEventListener("scroll", onScroll);
  };
}

/**
 * Glitch bursts for floating flyer layers: the layer jitters, a red and a cyan
 * silhouette (the layer's own alpha, via mask) split off its edges, one slice
 * copy tears sideways and a scan band sweeps down.
 *
 * Built for scroll performance: the effect DOM is always present but
 * `display: none` between bursts (no React render, no mount), a burst is one
 * attribute toggle, and the motion is transform/opacity only. No filters, no
 * blend modes, no isolation group. Mouse: real hover or click. Touch: tap
 * (`click`), never the touch that starts a scroll. Off under reduced motion.
 */
export function GlitchLayer({
  children,
  intensity = "medium",
  interactive = true,
  idleEvery,
  burstMs = 460,
  as = "div",
  className,
  style,
}: GlitchLayerProps) {
  const Tag = as as "div";
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let maskSrc = "";
    let onScreen = true;

    const fire = () => {
      if (reduced.matches || timer) return;
      const img = el.querySelector<HTMLImageElement>(".w-glitch__base img");
      const src = img?.currentSrc || img?.src;
      if (!img || !src || !img.complete || !img.naturalWidth) return; // nothing painted yet
      if (src !== maskSrc) {
        el.style.setProperty("--w-glitch-src", `url("${src}")`);
        maskSrc = src;
      }
      el.setAttribute("data-burst", "");
      timer = window.setTimeout(() => {
        timer = 0;
        el.removeAttribute("data-burst");
      }, burstMs);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && performance.now() - lastScroll > 220) fire();
    };
    el.addEventListener(GLITCH_EVENT, fire);
    const unwatch = interactive ? watchScroll() : () => {};
    if (interactive) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("click", fire);
      el.addEventListener("focusin", fire);
    }

    // Idle bursts, only while on screen and the tab is visible.
    let idleTimer = 0;
    let io: IntersectionObserver | null = null;
    if (idleEvery) {
      io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
      io.observe(el);
      const loop = () => {
        idleTimer = window.setTimeout(() => {
          if (onScreen && document.visibilityState === "visible") fire();
          loop();
        }, idleEvery * (0.6 + Math.random() * 0.8));
      };
      loop();
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(idleTimer);
      io?.disconnect();
      unwatch();
      el.removeEventListener(GLITCH_EVENT, fire);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("click", fire);
      el.removeEventListener("focusin", fire);
      el.removeAttribute("data-burst");
    };
  }, [burstMs, idleEvery, interactive]);

  return (
    <Tag
      ref={root}
      className={cx("w-glitch", className)}
      style={style}
      data-intensity={intensity === "medium" ? undefined : intensity}
    >
      <span className="w-glitch__fringe w-glitch__fringe--r" aria-hidden="true" />
      <span className="w-glitch__fringe w-glitch__fringe--c" aria-hidden="true" />
      <div className="w-glitch__base">{children}</div>
      <div className="w-glitch__slice" aria-hidden="true">
        {children}
      </div>
      <span className="w-glitch__sweep" aria-hidden="true" />
    </Tag>
  );
}
