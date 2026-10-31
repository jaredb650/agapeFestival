"use client";

// Small DOM-only effects shared by the FAQ terminal and the footer HUD.
// Nothing here sets React state per frame: text is written straight to the
// node and entrance states are attributes the CSS keys off.

const GLYPHS = "ÄĒ#%&*+/<>=?@[]_\\|01:";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * rootMargin for "is this section live" observers. IntersectionObserver counts an
 * edge-adjacent target (0px visible, e.g. the next section right after a nav jump)
 * as intersecting, which left loops running unseen; 8px in from each edge fixes that.
 */
export const LIVE_MARGIN = "-8px 0px";

// ---- Shared 1 Hz ticker ------------------------------------------------------
// One timer for every on-screen clock/countdown in the bottom half (tickets
// T-minus, footer CONTINUE?). Subscribers join only while their panel is
// visible; with no subscribers there is no timer at all. Ticks land just after
// each wall-clock second, so countdown digits change on the second.
// (Local stand-in for a site-wide perf util; safe to merge into one later.)
const secondSubs = new Set<() => void>();
let secondTimer = 0;
function scheduleSecond() {
  secondTimer = window.setTimeout(() => {
    secondSubs.forEach((fn) => fn());
    if (secondSubs.size) scheduleSecond();
    else secondTimer = 0;
  }, 1000 - (Date.now() % 1000) + 8);
}
/** Call `fn` once a second until the returned unsubscribe runs. */
export function onSecond(fn: () => void): () => void {
  secondSubs.add(fn);
  if (!secondTimer) scheduleSecond();
  return () => {
    secondSubs.delete(fn);
    if (!secondSubs.size && secondTimer) {
      clearTimeout(secondTimer);
      secondTimer = 0;
    }
  };
}

/**
 * Decode `el` to `text`: characters cycle through pixel glyphs and resolve
 * left to right over `ms`. Returns a cancel function that snaps to the final
 * text. Under reduced motion it just sets the text.
 */
export function decodeText(el: HTMLElement, text: string, ms = 420): () => void {
  if (prefersReducedMotion() || !text) {
    el.textContent = text;
    return () => {};
  }
  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const settled = Math.floor(t * text.length);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      out += i < settled || ch === " " || ch === "\n" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
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
 * Entrance trigger: once `root` comes within view, set `data-in` on it and
 * call `onEnter`. Before that the root carries `data-armed` (the CSS hides
 * the pieces only while armed, so no-JS and reduced motion see everything).
 */
export function armEntrance(root: HTMLElement, onEnter?: () => void, rootMargin = "0px 0px -12% 0px"): () => void {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    root.setAttribute("data-in", "");
    return () => {};
  }
  root.setAttribute("data-armed", "");
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      root.setAttribute("data-in", "");
      onEnter?.();
    },
    { rootMargin },
  );
  io.observe(root);
  return () => io.disconnect();
}

/**
 * Batched stagger for long lists: each `items` element gets `data-in` as it
 * scrolls into view; elements entering together get rising `--d` delays.
 */
export function staggerIn(items: HTMLElement[], step = 55, rootMargin = "0px 0px -6% 0px"): () => void {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    items.forEach((el) => el.setAttribute("data-in", ""));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      entering.sort((a, b) => items.indexOf(a) - items.indexOf(b));
      entering.forEach((el, k) => {
        el.style.setProperty("--d", `${k * step}ms`);
        el.setAttribute("data-in", "");
        io.unobserve(el);
      });
    },
    { rootMargin },
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
