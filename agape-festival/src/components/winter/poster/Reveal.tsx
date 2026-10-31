"use client";

import { useEffect } from "react";

/**
 * One short fade-and-rise per section as it first enters the viewport. Only
 * sections still below the fold are armed, so nothing already on screen ever
 * blinks out; without JS or with reduced motion everything is simply visible.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.9,
    );
    if (!els.length) return;
    els.forEach((el) => el.setAttribute("data-reveal", "armed"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-reveal", "in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
