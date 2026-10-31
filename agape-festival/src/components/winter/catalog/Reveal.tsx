"use client";

import { useEffect } from "react";

/**
 * One short fade-and-rise per section, once, the first time it enters the
 * viewport. Without JS (or with reduced motion) everything is simply there.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    // Only sections still below the fold are hidden; anything already passed stays put.
    els.forEach((el) => {
      el.setAttribute("data-wait", "");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
