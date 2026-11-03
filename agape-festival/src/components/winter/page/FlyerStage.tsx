"use client";

import { useEffect, useRef, useState } from "react";
import { GLITCH_EVENT, GlitchLayer } from "@/components/winter/ui";
import { afterLoadIdle } from "./idle";
import { withGsap } from "./loadGsap";
import { BG_GLITCH_EVENT } from "./events";
import type { FlyerLayer, Still } from "./media";
import { TOUCH_QUERY } from "./viewport";

/**
 * The flyer's text layers float up out of the tower footage at independent
 * depths and lock into their exact flyer positions (manifest bboxes in
 * 2160x3840 space), so at the lock point the screen reads as the v3 flyer.
 * On portrait screens the flyer box matches the background's cover crop, so
 * layer + footage line up with the original poster.
 *
 * Server-rendered in the assembled state: with reduced motion (or no JS)
 * the flyer simply sits there.
 */

interface Motion {
  /** Start offset below the lock position, in viewport heights (the parallax depth). */
  d: number;
  /** Horizontal drift, in viewport widths. */
  x?: number;
  /** Start rotation, degrees. */
  r?: number;
  /** Window inside the assembly timeline (0–1). */
  s: number;
  e: number;
  /** Extra lift while the stage leaves (exit parallax), viewport heights. */
  out: number;
}

const MOTION: Record<string, Motion> = {
  "logo-mark": { d: 1.2, x: -0.05, s: 0.0, e: 0.6, out: 0.35 },
  "logo-festival": { d: 0.95, x: 0.04, s: 0.04, e: 0.62, out: 0.22 },
  title: { d: 1.05, s: 0.1, e: 0.68, out: 0.28 },
  "day1-label": { d: 1.6, r: -7, s: 0.16, e: 0.74, out: 0.5 },
  "day1-names": { d: 1.3, s: 0.2, e: 0.78, out: 0.18 },
  "day2-label": { d: 1.8, r: 6, s: 0.26, e: 0.84, out: 0.55 },
  "day2-names": { d: 1.45, s: 0.3, e: 0.88, out: 0.12 },
  date: { d: 2.1, r: -4, x: 0.03, s: 0.36, e: 0.97, out: 0.42 },
};

interface Props {
  layers: FlyerLayer[];
  scrim: Still;
  space: { width: number; height: number };
}

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(4)}%`;

/**
 * `sizes` for a layer: its share of the flyer box, whose width is
 * min(max(100vw, 56.25vh), 90vh) (winter-page.css .wflyer__box), so the browser
 * picks the 0.5x / 0.75x / full file by the size it is actually drawn at.
 */
const layerSizes = (w: number, of: number) => {
  const k = (n: number) => `${((n * w) / of).toFixed(2)}`;
  return `(max-aspect-ratio: 9/16) ${k(56.25)}vh, (max-aspect-ratio: 9/10) ${k(100)}vw, ${k(90)}vh`;
};

export function FlyerStage({ layers, scrim, space }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  // The layers (~500 KB) sit just below the hero, inside the browser's lazy-load
  // distance, so `loading="lazy"` alone would fetch them alongside the hero.
  // Arm them on the first scroll intent, or once the page is idle.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const arm = () => setArmed(true);
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    if (window.scrollY > 0) arm();
    const cancelIdle = afterLoadIdle(arm);
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      cancelIdle();
    };
  }, []);

  // Decode the layers as soon as they're armed (they sit at opacity 0 below the
  // fold), so the first frames of the assembly never wait on an image decode.
  useEffect(() => {
    if (!armed) return;
    stageRef.current?.querySelectorAll<HTMLImageElement>(".w-glitch__base img, .wflyer__scrim").forEach((img) => {
      img.decode?.().catch(() => {});
    });
  }, [armed]);

  // Layers are promoted (will-change) only while the section is near the
  // viewport, so eight GPU layers don't sit around for the rest of the page.
  useEffect(() => {
    const stage = stageRef.current;
    const section = stage?.closest("section");
    if (!stage || !section) return;
    const io = new IntersectionObserver(([e]) => stage.toggleAttribute("data-live", e.isIntersecting), { rootMargin: "100% 0px" });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Cuts in the background footage glitch a few layers at once.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(stage);
    const onCut = () => {
      if (!onScreen) return;
      const roots = [...stage.querySelectorAll<HTMLElement>(".w-glitch")];
      const picks = new Set<HTMLElement>();
      while (picks.size < Math.min(3, roots.length)) picks.add(roots[Math.floor(Math.random() * roots.length)]);
      picks.forEach((el) => el.dispatchEvent(new Event(GLITCH_EVENT)));
    };
    window.addEventListener(BG_GLITCH_EVENT, onCut);
    return () => {
      io.disconnect();
      window.removeEventListener(BG_GLITCH_EVENT, onCut);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const section = stage?.closest("section");
    const lock = section?.querySelector<HTMLElement>("[data-flyer-lock]");
    const release = section?.querySelector<HTMLElement>("[data-flyer-release]");
    if (!stage || !section || !lock || !release) return;
    return withGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", touch: TOUCH_QUERY }, (ctx) => {
        const { motion, touch } = ctx.conditions as { motion: boolean; touch: boolean };
        if (!motion) return;
        const els = gsap.utils.toArray<HTMLElement>("[data-layer]", stage);
        const scrimEl = stage.querySelector<HTMLElement>("[data-flyer-scrim]");
        const vh = () => window.innerHeight;
        const vw = () => window.innerWidth;

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            endTrigger: lock,
            end: "top top",
            // Touch: 1:1 with the finger. A smoothed scrub trails the swipe and keeps writing styles
            // for 0.7 s after it, which on a phone reads as the page being caught. Mouse wheels step,
            // so they keep the smoothing.
            scrub: touch ? true : 0.7,
            invalidateOnRefresh: true,
          },
        });
        els.forEach((el) => {
          const m = MOTION[el.dataset.layer!];
          if (!m) return;
          const dur = m.e - m.s;
          tl.fromTo(
            el,
            { y: () => m.d * vh(), x: () => (m.x ?? 0) * vw(), rotation: m.r ?? 0 },
            { y: 0, x: 0, rotation: 0, duration: dur },
            m.s,
          );
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur * 0.4, ease: "none" }, m.s);
        });
        if (scrimEl) tl.fromTo(scrimEl, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "none" }, 0.55);
        tl.to({}, { duration: 0.03 }); // pad so the last layer settles exactly at the lock

        // Exit: once released, layers lift at their own depths as the lineup arrives.
        const exit = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: release,
            start: "top top",
            endTrigger: section,
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        els.forEach((el) => {
          const m = MOTION[el.dataset.layer!];
          if (m) exit.to(el, { y: () => -m.out * vh(), opacity: 0.15, duration: 1 }, 0);
        });
        if (scrimEl) exit.to(scrimEl, { opacity: 0, duration: 0.8 }, 0);
      });
      return () => mm.revert();
    });
  }, []);

  return (
    <div className="wflyer__stage" ref={stageRef}>
      <div className="wflyer__box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="wflyer__scrim"
          data-flyer-scrim
          src={armed ? scrim.src : undefined}
          width={scrim.width}
          height={scrim.height}
          alt=""
          decoding="async"
        />
        {layers.map((l) => (
          <div
            key={l.id}
            className="wflyer__layer"
            data-layer={l.id}
            style={{
              left: pct(l.x, space.width),
              top: pct(l.y, space.height),
              width: pct(l.width, space.width),
            }}
          >
            <GlitchLayer
              intensity={l.id === "logo-mark" ? "strong" : l.width > 1000 ? "medium" : "subtle"}
              idleEvery={l.id === "logo-mark" ? 7000 : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                sizes={l.srcSet ? layerSizes(l.width, space.width) : undefined}
                srcSet={armed ? l.srcSet : undefined}
                src={armed ? l.src : undefined}
                width={l.width}
                height={l.height}
                alt=""
                decoding="async"
                draggable={false}
              />
            </GlitchLayer>
          </div>
        ))}
      </div>
    </div>
  );
}
