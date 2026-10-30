"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";

export interface MarqueeProps {
  items: ReactNode[];
  /** Seconds per loop. Default 40. */
  duration?: number;
  reverse?: boolean;
  /** Between items. Default the flyer's "•". */
  separator?: ReactNode;
  className?: string;
  /** Accessible summary; the moving copy is aria-hidden. */
  label?: string;
}

/** CSS-transform ticker. Pauses offscreen; static under reduced motion. */
export function Marquee({ items, duration = 40, reverse, separator = "•", className, label }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const run = (copy: number) =>
    items.map((item, i) => (
      <Fragment key={`${copy}-${i}`}>
        <span className="w-marquee__item">{item}</span>
        <span className="w-marquee__sep" aria-hidden="true">{separator}</span>
      </Fragment>
    ));

  return (
    <div
      ref={ref}
      className={cx("w-marquee", className)}
      data-reverse={reverse || undefined}
      data-paused={paused || undefined}
      style={{ ["--w-marquee-dur" as string]: `${duration}s` }}
    >
      {label && <span className="w-sr-only">{label}</span>}
      <div className="w-marquee__track" aria-hidden="true">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
