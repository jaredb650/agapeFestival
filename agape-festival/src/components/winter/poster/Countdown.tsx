"use client";

import { useEffect, useRef } from "react";
import { onSecondWhileVisible } from "@/components/winter/perf/ticker";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Days / hours / minutes / seconds as plain tabular figures. The digits are
 * written straight into the DOM on the page's shared 1 Hz tick, only while the
 * countdown is on screen and the tab is visible (no React re-render). The
 * static HTML ships dashes, since it has no "now".
 */
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const target = Date.parse(targetIso);
    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-u]"));
    return onSecondWhileVisible(el, (now) => {
      const s = Math.max(0, Math.floor((target - now) / 1000));
      const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      parts.forEach((v, i) => {
        const text = pad(v);
        if (cells[i] && cells[i].textContent !== text) cells[i].textContent = text;
      });
    });
  }, [targetIso]);

  return (
    <div ref={root} className="pp-count" role="timer" aria-label={label} data-nosnippet>
      {UNITS.map((u) => (
        <div key={u} className="pp-count__cell">
          <span className="pp-count__n" data-u={u}>
            ––
          </span>
          <span className="pp-count__u">{u}</span>
        </div>
      ))}
    </div>
  );
}
