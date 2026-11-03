"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "./cx";

export interface CtaRigProps {
  /** The button the rig frames (a HoloButton in the original). */
  children: ReactNode;
  /** Pixel readout over the left rail, e.g. "02.19–20.27". */
  left?: ReactNode;
  /** Pixel readout over the right rail (ice), e.g. "DICE.FM". */
  right?: ReactNode;
  /** Rails extend and readouts type in while shown. Default true (plays once on mount). */
  shown?: boolean;
  className?: string;
}

/**
 * The floating Get tickets' HUD chrome (c9688b5 FloatingCta + cta.css): a legibility pool with
 * an ice bloom on the button's pulse beat, hairline rails with tick rulers running out of both
 * sides, typed readouts on the rails and a pip under the button. Docking / hiding logic is not
 * included: drive `shown` yourself.
 */
export function CtaRig({ children, left, right, shown = true, className }: CtaRigProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Next frame, so the rails transition in on mount instead of starting extended.
    const raf = requestAnimationFrame(() => el.toggleAttribute("data-shown", shown));
    return () => cancelAnimationFrame(raf);
  }, [shown]);
  return (
    <div ref={ref} className={cx("rhk-rig", className)}>
      <div className="rhk-rig__rig" aria-hidden="true">
        <span className="rhk-rig__floor" />
        <span className="rhk-rig__rail" data-side="l">
          {left && <b>{left}</b>}
        </span>
        <span className="rhk-rig__rail" data-side="r">
          {right && <b>{right}</b>}
        </span>
        <span className="rhk-rig__pip" />
      </div>
      {children}
    </div>
  );
}
