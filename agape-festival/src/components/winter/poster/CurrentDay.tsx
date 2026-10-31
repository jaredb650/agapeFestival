"use client";

import { useEffect } from "react";

/**
 * The static HTML marks Day 1 as "Up next" (it is built before the festival).
 * On load this re-checks against today's date in New York: Day 1 or Day 2 is
 * "Today" during the festival, and nothing is marked once it is over.
 */
export function CurrentDay({ days }: { days: string[] }) {
  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
    let current = -1;
    let tag = "";
    if (today < days[0]) {
      current = 0;
      tag = "Up next";
    } else {
      current = days.indexOf(today);
      tag = current >= 0 ? "Today" : "";
    }
    days.forEach((_, i) => {
      const el = document.getElementById(`lineup-day-${i + 1}`);
      if (!el) return;
      el.toggleAttribute("data-current", i === current);
      const t = el.querySelector<HTMLElement>("[data-day-tag]");
      if (t) t.textContent = i === current ? tag : "";
    });
  }, [days]);
  return null;
}
