"use client";

import { useEffect, useState, type ReactNode } from "react";
import { afterLoadIdle } from "@/components/winter/page/idle";

/**
 * What surrounds the (untouched) flyer section: the still the v3 flyer is
 * printed on, held behind its sticky stage, so the flyer layers settle onto
 * their own photograph instead of plain black. The still sits inside the
 * browser's lazy-load distance, so it is armed like the flyer layers: on the
 * first scroll intent, or once the page is idle.
 *
 * Layout: an absolute layer spanning the whole flyer section holds a sticky,
 * one-screen frame, so the still can never stick past the section's end.
 */
export function FlyerBackdrop({ still, children }: { still: { src: string; width: number; height: number }; children: ReactNode }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const arm = () => setArmed(true);
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    if (window.scrollY > 0) arm();
    const cancel = afterLoadIdle(arm);
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      cancel();
    };
  }, []);

  return (
    <div className="pp-flyer">
      <div className="pp-flyer__bg" aria-hidden="true">
        <div className="pp-flyer__frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={armed ? still.src : undefined} width={still.width} height={still.height} alt="" decoding="async" data-on={armed || undefined} />
        </div>
      </div>
      {children}
    </div>
  );
}
