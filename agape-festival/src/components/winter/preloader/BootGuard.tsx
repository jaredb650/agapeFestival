"use client";

import { useLayoutEffect } from "react";

/**
 * The boot overlay only works when its inline script ran during the initial
 * HTML parse (it marks the overlay with data-js). On a client-side navigation
 * to the page, React inserts the markup but never runs the script: drop the
 * overlay before it paints.
 */
export function BootGuard() {
  useLayoutEffect(() => {
    const el = document.getElementById("wboot");
    if (el && !el.hasAttribute("data-js")) el.remove();
  }, []);
  return null;
}
