"use client";

import { useEffect, type RefObject } from "react";

const GLYPHS = "ÄĒ#%&*+/<>=?@[]_\\|01:";

/** Cycle an element's characters through pixel glyphs, resolving left to right. Writes textContent (no React renders). */
export function decode(el: HTMLElement, text: string, ms = 520) {
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
}

/**
 * Scroll-in choreography for a section, without React state:
 * - `data-live` while on (or near) screen: CSS pauses idle loops otherwise.
 * - `data-armed` once mounted (motion allowed): intro animations wait, paused, in their first frame.
 * - `data-boot` when `threshold` of it is visible: intro plays once.
 * Elements with `data-decode="<ms>"` decode their text that long after boot;
 * `data-decode-from` is shown until then. Server HTML and reduced motion get the final state.
 */
export function useBoot(ref: RefObject<HTMLElement | null>, threshold = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const live = new IntersectionObserver(([e]) => el.toggleAttribute("data-live", e.isIntersecting), { rootMargin: "80px 0px" });
    live.observe(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => live.disconnect();

    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-decode]")).map((t) => ({
      t,
      text: t.textContent ?? "",
      at: Number(t.dataset.decode) || 0,
      from: t.dataset.decodeFrom,
    }));
    targets.forEach(({ t, from }) => from && (t.textContent = from));
    el.setAttribute("data-armed", "");

    const timers: number[] = [];
    const cancels: (() => void)[] = [];
    const boot = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        boot.disconnect();
        el.setAttribute("data-boot", "");
        targets.forEach(({ t, text, at }) => timers.push(window.setTimeout(() => cancels.push(decode(t, text)), at)));
      },
      { threshold },
    );
    boot.observe(el);

    return () => {
      live.disconnect();
      boot.disconnect();
      timers.forEach(clearTimeout);
      cancels.forEach((c) => c());
      targets.forEach(({ t, text }) => (t.textContent = text));
      el.removeAttribute("data-armed");
      el.removeAttribute("data-boot");
    };
  }, [ref, threshold]);
}
