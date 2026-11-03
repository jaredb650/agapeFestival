"use client";

import { useEffect } from "react";
import { afterLoadIdle } from "@/components/winter/page/idle";
import { META_PIXEL_ID, pixelEnabled, track, trackCustom } from "./pixel";

/**
 * Meta Pixel, kept off the critical path: Meta's own queue stub is set up at once (so PageView and any
 * early click are recorded), but fbevents.js is only requested once the page has loaded and gone idle.
 * Live domain only (see pixelEnabled). Clicks are read from one delegated listener:
 *  - any link to DICE (every Get tickets, the promo's Apply on DICE, the FAQ links) → InitiateCheckout
 *  - the locker booking link → custom ReserveLocker
 *  - a mailto link → Contact
 * Artist bios (ViewContent) and the promo copy (custom CopyPromoCode) are tracked where they happen.
 */
export function MetaPixel() {
  useEffect(() => {
    if (!pixelEnabled() || window.fbq) return;

    // Meta's standard base code, minus the script tag (inserted after load below).
    const fbq: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq ??= fbq;
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");

    const cancel = afterLoadIdle(() => {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    }, 800);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.href;
      const label = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 80);
      if (/(^|\.)dice\.fm\//.test(href.replace(/^https?:\/\//, ""))) {
        track("InitiateCheckout", { content_name: label, promo: /[?&]code=/.test(href) ? "WINTER" : undefined });
      } else if (href.includes("elocke.rs")) {
        trackCustom("ReserveLocker");
      } else if (href.startsWith("mailto:")) {
        track("Contact");
      }
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      cancel();
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);
  return null;
}
