"use client";

// DOM-only effects for the kit (c9688b5 nav/decode.ts + page/hudFx.ts). Nothing here
// sets React state per frame: text is written straight to the node and entrance
// states are attributes the CSS keys off.

const GLYPHS = "#%&*+/<>=?@[]_\\|01:ΛΞ";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Job {
  el: HTMLElement;
  text: string;
  start: number;
  ms: number;
}

const jobs = new Set<Job>();
let raf = 0;

function frame(now: number) {
  jobs.forEach((job) => {
    if (now < job.start) return;
    const t = Math.min(1, (now - job.start) / job.ms);
    const settled = Math.floor(t * job.text.length);
    let out = "";
    for (let i = 0; i < job.text.length; i++) {
      const ch = job.text[i];
      out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    job.el.textContent = out;
    if (t >= 1) jobs.delete(job);
  });
  raf = jobs.size ? requestAnimationFrame(frame) : 0;
}

/**
 * HUD text decode: characters cycle through pixel glyphs and resolve left to right.
 * Decodes `text` into `el` after `delay` ms over `ms` ms (one shared rAF loop drives every
 * running decode). `pre` shows noise right away so the final text never flashes first.
 * Returns a cancel that snaps to the final text. Reduced motion: sets the text.
 */
export function decode(el: HTMLElement, text: string, { ms = 420, delay = 0, pre = false } = {}): () => void {
  if (prefersReducedMotion()) {
    el.textContent = text;
    return () => {};
  }
  jobs.forEach((j) => j.el === el && jobs.delete(j));
  if (pre) el.textContent = text.replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
  const job: Job = { el, text, start: performance.now() + delay, ms };
  jobs.add(job);
  if (!raf) raf = requestAnimationFrame(frame);
  return () => {
    if (jobs.delete(job)) el.textContent = text;
  };
}

/**
 * Entrance trigger: once `el` comes within view, set `data-in` on it and call `onEnter`.
 * Before that it carries `data-armed` (the CSS hides it only while armed, so no-JS and
 * reduced motion see everything).
 */
export function armEntrance(el: HTMLElement, onEnter?: () => void, rootMargin = "0px 0px -12% 0px"): () => void {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    el.setAttribute("data-in", "");
    onEnter?.();
    return () => {};
  }
  el.setAttribute("data-armed", "");
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.setAttribute("data-in", "");
      onEnter?.();
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Toggle `attr` on `el` while it is off screen (the CSS parks its loops). */
export function parkOffscreen(el: HTMLElement, attr = "data-off"): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(([e]) => el.toggleAttribute(attr, !e.isIntersecting), { rootMargin: "-8px 0px" });
  io.observe(el);
  return () => io.disconnect();
}
