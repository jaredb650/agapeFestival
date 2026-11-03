"use client";

import { useEffect, useRef } from "react";
import { Orb } from "./Orb";
import { decode, prefersReducedMotion } from "./fx";
import { cx } from "./cx";

export interface ChromeNotchProps {
  /** The LCD text (pixel caps). Decodes in on mount and on every change, with a sweep. */
  text: string;
  /** Glass orbs either side of the LCD. Default true. */
  orbs?: boolean;
  /** md = 228 × 18 (phones), lg = 300 × 22 (desktop). Inside HudBar it follows the bar. */
  size?: "md" | "lg";
  className?: string;
}

/**
 * The chrome housing hung under the HUD bar (c9688b5 Nav.tsx .whud-notch): a silver trapezoid
 * with a dark edge, two lit glass orbs and a recessed chamfered LCD. Decorative (aria-hidden).
 */
export function ChromeNotch({ text, orbs = true, size = "md", className }: ChromeNotchProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const booted = useRef(false);
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = text;
      return;
    }
    const first = !booted.current;
    booted.current = true;
    const cancel = decode(el, text, { ms: first ? 620 : 380, delay: first ? 520 : 0, pre: first });
    if (!first)
      sweepRef.current?.animate(
        [
          { transform: "translateX(-100%)", opacity: 1 },
          { transform: "translateX(100%)", opacity: 0.2 },
        ],
        { duration: 520, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
      );
    return cancel;
  }, [text]);
  return (
    <div className={cx("rhk-notch", className)} data-size={size === "lg" ? "lg" : undefined} aria-hidden="true">
      <span className="rhk-notch__body" />
      <svg className="rhk-notch__edge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path d="M0 0L8 99.5H92L100 0" />
      </svg>
      {orbs && <Orb size="sm" lit />}
      <span className="rhk-notch__lcd">
        <span ref={textRef} className="rhk-notch__text">
          {text}
        </span>
        <span className="rhk-notch__sweep">
          <span ref={sweepRef} />
        </span>
      </span>
      {orbs && <Orb size="sm" lit />}
    </div>
  );
}
