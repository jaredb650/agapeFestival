"use client";

import { useEffect } from "react";

// ---- Autoplay resilience (iOS Low Power Mode), ported from the Sept site ----
// Low Power Mode rejects every programmatic play(), and iOS draws a
// struck-through ▶ badge over any *visible* paused <video>. Two-part strategy:
//  1. Every video stays at opacity 0 until its `playing` event fires, so a
//     blocked video is never visible, only its poster art is.
//  2. play() rejections queue a retry that runs inside the user's next tap;
//     Safari allows play() from a genuine gesture even in Low Power Mode.
const blockedVideoWakers = new Set<() => void>();

export function playWithRescue(vid: HTMLVideoElement | null) {
  if (!vid) return;
  const p = vid.play();
  if (p !== undefined) {
    p.catch(() => {
      blockedVideoWakers.add(() => {
        if (vid.isConnected) vid.play().catch(() => {});
      });
    });
  }
}

/** Mounted once; retries every blocked video on the first tap after a rejection. */
export function GestureRescue() {
  useEffect(() => {
    const rescue = () => {
      if (blockedVideoWakers.size === 0) return;
      const wakers = [...blockedVideoWakers];
      blockedVideoWakers.clear();
      wakers.forEach((wake) => wake());
    };
    window.addEventListener("touchend", rescue, { passive: true });
    window.addEventListener("pointerdown", rescue, { passive: true });
    return () => {
      window.removeEventListener("touchend", rescue);
      window.removeEventListener("pointerdown", rescue);
    };
  }, []);
  return null;
}
