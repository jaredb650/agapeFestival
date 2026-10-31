"use client";

import { useEffect, type RefObject } from "react";
import { LIVE_MARGIN } from "@/components/winter/page/hudFx";

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
 * - `data-live` while on screen: CSS runs idle loops only then.
 * - `data-armed` once mounted (motion allowed): CSS shows the intro's first frame as static styles
 *   (no animations attached yet: a paused animation still pins its element to a GPU layer).
 * - `data-boot` when `threshold` of it is visible: CSS attaches the intro, which plays once.
 * - `data-booted` `settleMs` later, once the intro is over: CSS detaches the one-shot animations.
 * Elements with `data-decode="<ms>"` decode their text that long after boot;
 * `data-decode-from` is shown until then. Server HTML and reduced motion get the final state.
 */
export function useBoot(ref: RefObject<HTMLElement | null>, threshold = 0.3, settleMs = 4200) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Live only while actually on screen (no pre-roll margin: loops resume without a visible restart).
    const live = new IntersectionObserver((entries) => el.toggleAttribute("data-live", entries[entries.length - 1].isIntersecting), {
      rootMargin: LIVE_MARGIN,
    });
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
        timers.push(window.setTimeout(() => el.setAttribute("data-booted", ""), settleMs));
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
      el.removeAttribute("data-booted");
    };
  }, [ref, threshold, settleMs]);
}
