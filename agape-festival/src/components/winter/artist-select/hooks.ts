"use client";

import { useEffect, useRef, useState } from "react";

/** Live `matchMedia` flag (false during SSR and the first client render). */
export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

// Deprecated: the roster no longer uses the decode effect. Kept only while the Merch, FAQ and Getting here
// sections still import it; delete it (and this note) once nothing does.
const GLYPHS = "ÄĒ#%&*+/<>=?@[]_\\|01:";

/**
 * Decode effect: when `text` changes, the element's characters cycle through
 * pixel glyphs and resolve left to right (~`ms`). Writes textContent directly
 * (no React renders per frame). React still renders `text` as the children,
 * so SSR, screen readers (via aria-label on the parent) and reduced motion get
 * the plain string.
 */
export function useScramble<T extends HTMLElement>(text: string, { ms = 420, disabled = false } = {}) {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current || disabled) {
      first.current = false;
      el.textContent = text;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const settled = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, ms, disabled]);
  return ref;
}
