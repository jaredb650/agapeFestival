"use client";

import { useEffect, useRef } from "react";
import { onSecondWhileVisible } from "@/components/winter/perf/ticker";

const UNITS = ["Days", "Hours", "Min", "Sec"] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Quiet tabular countdown, the old landing page's four columns in the mono.
 * The digits are written straight into the DOM on the page's shared 1 Hz tick,
 * only while the countdown is on screen and the tab is visible. The static
 * export has no "now", so the server HTML ships dashes.
 */
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const target = Date.parse(targetIso);
    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-n]"));
    return onSecondWhileVisible(el, (now) => {
      const left = Math.max(0, Math.floor((target - now) / 1000));
      const values = [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60];
      values.forEach((v, i) => {
        const text = pad(v);
        if (cells[i] && cells[i].textContent !== text) cells[i].textContent = text;
      });
    });
  }, [targetIso]);

  return (
    <div ref={root} className="cat-count" role="timer" aria-label={label} data-nosnippet>
      {UNITS.map((unit) => (
        <span key={unit} className="cat-count__cell">
          <span className="cat-count__n" data-n="">
            --
          </span>
          <span className="cat-count__u">{unit}</span>
        </span>
      ))}
    </div>
  );
}
