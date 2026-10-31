"use client";

import { useEffect } from "react";
import { pauseWhenOffscreen } from "./inView";

/** Opt-in attribute: any element carrying it parks its CSS animations while off screen. */
export const PAUSE_ATTR = "data-pause-offscreen";

/**
 * Render once per page. Parks the looping CSS animations of every
 * `[data-pause-offscreen]` element while it is off screen, through one shared
 * IntersectionObserver and the `[data-offscreen]` rule in winter.css.
 * Server components get offscreen pausing without becoming client components.
 * Elements mounted later (lazy chunks) can call pauseWhenOffscreen themselves.
 */
export function OffscreenPauser() {
  useEffect(() => {
    const undo = new Map<Element, () => void>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>(`[${PAUSE_ATTR}]`).forEach((el) => {
        if (!undo.has(el)) undo.set(el, pauseWhenOffscreen(el, { rootMargin: "64px 0px" }));
      });
    };
    scan();
    // Lazy sections hydrate a little later: one more pass once the page is idle.
    const ric = typeof window.requestIdleCallback === "function";
    const id = ric ? window.requestIdleCallback(scan, { timeout: 4000 }) : window.setTimeout(scan, 1500);
    return () => {
      if (ric) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      undo.forEach((fn) => fn());
    };
  }, []);
  return null;
}
