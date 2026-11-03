"use client";

import { useEffect } from "react";

/**
 * The page's one scroll entrance. Mounted once (page.tsx). Every [data-reveal] container that is still
 * below the fold when the page hydrates is parked ("wait": children hidden 16px low), then released ("in")
 * as it comes into view; its children rise in 50ms apart (styles/classic.css). Containers already on
 * screen, reduced motion and no-JS all show the content as is. One IntersectionObserver, unobserved after
 * firing; no React state.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const vh = window.innerHeight;
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal) return;
      if (el.getBoundingClientRect().top < vh) return;
      el.dataset.reveal = "wait";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
