"use client";

import { useEffect } from "react";

/**
 * One short fade-and-rise per section as it first scrolls in. Sections that
 * are already on screen (or above it) at load are left alone, so nothing that
 * is visible ever blinks; without JS everything simply shows.
 */
export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const below = els.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    below.forEach((el) => el.setAttribute("data-reveal", "armed"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-reveal", "in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    below.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
