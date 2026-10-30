"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cx } from "./cx";

/** Dispatch on a GlitchLayer root (`.w-glitch`) to fire one burst from outside. */
export const GLITCH_EVENT = "w-glitch-burst";

export interface GlitchLayerProps {
  /** Ideally one transparent <img> (a floating flyer layer). It is cloned twice while a burst runs. */
  children: ReactNode;
  /** Offset scale of the RGB split and slices. Default "medium" (5px). */
  intensity?: "subtle" | "medium" | "strong";
  /** React to hover / tap / click / focus. Default true. */
  interactive?: boolean;
  /** Fire an unprompted burst every ~N ms (±40%) while on screen. Off by default. */
  idleEvery?: number;
  /** Burst length, ms. Matches the CSS keyframes (460). */
  burstMs?: number;
  as?: "div" | "figure" | "span";
  className?: string;
  style?: CSSProperties;
}

/**
 * Hover/tap glitch for parallax flyer layers: stepped RGB split along the
 * layer's alpha edges, two horizontal slice copies, a scanline sweep, and a
 * faint ice glow while hovered (fine pointers). Touch: a tap fires one burst
 * and never blocks scrolling. Disabled under prefers-reduced-motion.
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
  const [burst, setBurst] = useState(0); // 0 = idle; otherwise the burst count (keys the clone layers)
  const [hover, setHover] = useState(false);
  const reduced = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => (reduced.current = mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      clearTimeout(timer.current);
    };
  }, []);

  // One burst at a time; re-triggers during a burst are ignored (the CSS
  // keyframes can't restart without remounting the image).
  const fire = useCallback(() => {
    if (reduced.current || timer.current) return;
    setBurst((n) => (n % 1000) + 1);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setBurst(0);
    }, burstMs);
  }, [burstMs]);

  // External trigger: dispatch `new Event(GLITCH_EVENT)` on the layer's root
  // (e.g. on a cut in the background footage). Same reduced-motion and
  // one-at-a-time rules as a hover burst, and no React re-render to trigger it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.addEventListener(GLITCH_EVENT, fire);
    return () => el.removeEventListener(GLITCH_EVENT, fire);
  }, [fire]);

  // Idle bursts, only while on screen and the tab is visible.
  useEffect(() => {
    if (!idleEvery) return;
    const el = root.current;
    const io =
      el && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => (visible.current = e.isIntersecting))
        : null;
    if (el && io) io.observe(el);
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (visible.current && document.visibilityState === "visible") fire();
        loop();
      }, idleEvery * (0.6 + Math.random() * 0.8));
    };
    loop();
    return () => {
      clearTimeout(t);
      io?.disconnect();
    };
  }, [idleEvery, fire]);

  const handlers = interactive
    ? {
        onPointerEnter: (e: ReactPointerEvent) => {
          if (e.pointerType === "mouse") {
            setHover(true);
            fire();
          }
        },
        onPointerLeave: (e: ReactPointerEvent) => {
          if (e.pointerType === "mouse") setHover(false);
        },
        onPointerDown: (e: ReactPointerEvent) => {
          if (e.pointerType !== "mouse" || e.button === 0) fire();
        },
        onFocusCapture: fire,
      }
    : {};

  return (
    <Tag
      ref={root}
      className={cx("w-glitch", className)}
      style={style}
      data-intensity={intensity === "medium" ? undefined : intensity}
      data-burst={burst ? "" : undefined}
      data-hover={hover || undefined}
      {...handlers}
    >
      <div className="w-glitch__base">
        {children}
      </div>
      {burst > 0 && (
        <>
          <div className="w-glitch__copy w-glitch__copy--a" aria-hidden="true" key={`a${burst}`}>
            {children}
          </div>
          <div className="w-glitch__copy w-glitch__copy--b" aria-hidden="true" key={`c${burst}`}>
            {children}
          </div>
        </>
      )}
      <div className="w-glitch__sweep" aria-hidden="true" />
    </Tag>
  );
}
