"use client";

import { useEffect, useRef } from "react";
import { onSecondWhileVisible } from "@/components/winter/perf";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

/**
 * Days / hours / minutes / seconds, as plain tabular figures. The digits are
 * written straight into the DOM on the page's shared 1 Hz tick, only while the
 * countdown is on screen and the tab is visible. Static HTML ships dashes.
 */
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    const cells = Array.from(box.querySelectorAll<HTMLElement>("[data-n]"));
    const target = Date.parse(targetIso);
    return onSecondWhileVisible(box, (now) => {
      const s = Math.max(0, Math.floor((target - now) / 1000));
      const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      cells.forEach((cell, i) => {
        const text = String(parts[i]).padStart(2, "0");
        if (cell.textContent !== text) cell.textContent = text;
      });
    });
  }, [targetIso]);

  return (
    <div ref={root} className="s-count" role="timer" aria-label={label} data-nosnippet>
      {UNITS.map((unit, i) => (
        <div key={unit} className="s-count__part" data-days={i === 0 || undefined}>
          <span className="s-count__n" data-n="">
            --
          </span>
          <span className="s-count__u">{unit}</span>
        </div>
      ))}
    </div>
  );
}
