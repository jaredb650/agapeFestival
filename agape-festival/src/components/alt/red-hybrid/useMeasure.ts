"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The bezels' measuring hook (c9688b5 HudBezel / MerchBezel / TerminalFrame): the
 * element's content box in whole pixels, re-measured on resize only, so the SVG can
 * be drawn at its real size and chamfers / notches never stretch.
 */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s && Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: Math.round(width), h: Math.round(height) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}
