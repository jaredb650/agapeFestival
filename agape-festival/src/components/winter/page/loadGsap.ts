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

export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
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
