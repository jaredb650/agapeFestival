// GSAP + ScrollTrigger are only needed once the page is interactive and
// scrolling, so they load as a separate chunk after hydration instead of
// sitting on the critical path in front of the hero.
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

export interface GsapKit {
  gsap: typeof Gsap;
  ScrollTrigger: typeof ST;
}

let kit: Promise<GsapKit> | null = null;

/**
 * ScrollTrigger.enable() starts a perpetual, empty requestAnimationFrame loop
 * (`_rafBugFix`: "in some browsers (like Firefox), screen repaints weren't
 * consistent unless we had SOMETHING queued up"). Everywhere else it only
 * forces a main-thread frame (style + commit) at 60 Hz for the life of the
 * page, even when nothing moves. The loop re-arms only from inside itself, so
 * swallowing its first call during registration ends it; scroll-driven
 * updates are unaffected (they run off scroll events + GSAP's own ticker).
 * Fail-safe: only a tiny `x && requestAnimationFrame(self)` function is
 * swallowed, so a GSAP update that changes the shape just keeps the loop.
 */
function registerWithoutIdleLoop(register: () => void) {
  if (/firefox/i.test(navigator.userAgent)) return register();
  const raf = window.requestAnimationFrame;
  let armed = true;
  window.requestAnimationFrame = function (cb: FrameRequestCallback) {
    if (armed) {
      const src = String(cb);
      if (src.length < 120 && /&&\s*requestAnimationFrame\(\s*[\w$]+\s*\)/.test(src)) {
        armed = false;
        return 0;
      }
    }
    return raf.call(window, cb);
  };
  try {
    register();
  } finally {
    armed = false;
    window.requestAnimationFrame = raf;
  }
}

export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    registerWithoutIdleLoop(() => g.gsap.registerPlugin(s.ScrollTrigger));
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return kit;
}

/** Run GSAP setup once loaded; the returned cleanup is safe to call before then. */
export function withGsap(setup: (kit: GsapKit) => (() => void) | void): () => void {
  let dispose: (() => void) | void;
  let cancelled = false;
  loadGsap().then((k) => {
    if (!cancelled) dispose = setup(k);
  });
  return () => {
    cancelled = true;
    dispose?.();
  };
}
