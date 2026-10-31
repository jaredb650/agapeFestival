"use client";

import { useEffect } from "react";

/**
 * One slow fade-and-rise per block as it first enters the screen, through one
 * IntersectionObserver that lets go of each block once it has shown. Only
 * blocks below the fold are armed ([data-reveal="armed"] is the hidden state),
 * so without JS, with reduced motion, or for anything mounted late, content is
 * simply visible.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-shown", "");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    const arm = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('[data-reveal=""]').forEach((el) => {
        if (el.getBoundingClientRect().top < vh) return; // already in view: leave it alone
        el.setAttribute("data-reveal", "armed");
        io.observe(el);
      });
    };
    arm();
    // The roster mounts from its own chunk: arm its blocks on a second pass.
    const late = window.setTimeout(arm, 1200);
    return () => {
      io.disconnect();
      clearTimeout(late);
    };
  }, []);
  return null;
}
