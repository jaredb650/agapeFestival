"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle } from "./idle";
import type { FlyerLayer, Still } from "./media";

/**
 * The flyer's text layers, still (classic-notext A/B variant): every layer sits at its exact flyer
 * position (manifest bboxes in 2160x3840 space) from the first paint, so the sticky stage reads as the
 * v3 flyer the moment it scrolls in. No scroll timelines, no glitch bursts, no GPU promotion: plain
 * images in a sticky box. On portrait screens the flyer box matches the background's cover crop, so
 * layer + footage line up with the original poster.
 */

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

  // Decode the layers as soon as they're armed (they sit below the fold), so the
  // stage never scrolls in on an undecoded image.
  useEffect(() => {
    if (!armed) return;
    stageRef.current?.querySelectorAll<HTMLImageElement>(".wflyer__layer img, .wflyer__scrim").forEach((img) => {
      img.decode?.().catch(() => {});
    });
  }, [armed]);

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
          </div>
        ))}
      </div>
    </div>
  );
}
