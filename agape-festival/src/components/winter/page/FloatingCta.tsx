"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/winter/ui";
import "@/styles/sections/cta.css";

/** Sections the floating CTA steps aside for. Add `data-cta-hide` to any element to join them. */
const HIDE_ON = "#tickets, #footer, [data-cta-hide]";
/** Phones only: the artist profiler, whose grid runs to the bottom edge. */
const HIDE_ON_MOBILE = "#artists";
const MOBILE = "(max-width: 899px)";
/** The flyer's date sits low on the poster: the CTA steps aside there on phones and on short desktop windows, where it would crowd it. */
const HIDE_ON_SHORT = "#flyer";
const SHORT = "(max-width: 899px), (max-height: 860px)";

/**
 * Floating Get tickets: the deployed red ticket button (flat, corner ticks, the
 * soft 4s breathing glow) docked at the bottom centre of the viewport. It docks
 * once the hero's CTA has scrolled out of view and steps aside while the
 * Tickets section, the footer (or any `data-cta-hide` element; on phones also
 * the artist profiler; on phones and short windows also the flyer) is on
 * screen. Visibility is a data attribute toggled from IntersectionObservers: no
 * React state, no re-render. Hidden = `inert` + `visibility: hidden`, so it is
 * never tabbable unseen.
 */
export function FloatingCta({ href, label }: { href: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mobile = window.matchMedia(MOBILE);
    const short = window.matchMedia(SHORT);
    let heroGone = !document.querySelector("[data-hero-cta]");
    const blockers = new Set<Element>();

    const update = () => {
      const shown = heroGone && blockers.size === 0;
      el.toggleAttribute("data-shown", shown);
      el.inert = !shown;
    };

    // The hero CTA fades out as the hero lifts away, so it counts as gone once it is above the top 35% of the viewport.
    const heroIo = new IntersectionObserver(
      ([e]) => {
        heroGone = !e.isIntersecting && e.boundingClientRect.top < window.innerHeight / 2;
        update();
      },
      { rootMargin: "-35% 0px 0px 0px" },
    );
    const heroCta = document.querySelector("[data-hero-cta]");
    if (heroCta) heroIo.observe(heroCta);

    // A blocker counts once it reaches the lower part of the screen, where the CTA docks.
    const blockIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target)));
        update();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const observeBlockers = () => {
      blockIo.disconnect();
      blockers.clear();
      const sel = [HIDE_ON, mobile.matches && HIDE_ON_MOBILE, short.matches && HIDE_ON_SHORT].filter(Boolean).join(", ");
      document.querySelectorAll(sel).forEach((n) => blockIo.observe(n));
      update();
    };
    observeBlockers();
    mobile.addEventListener("change", observeBlockers);
    short.addEventListener("change", observeBlockers);

    return () => {
      heroIo.disconnect();
      blockIo.disconnect();
      mobile.removeEventListener("change", observeBlockers);
      short.removeEventListener("change", observeBlockers);
    };
  }, []);

  return (
    <div ref={root} className="wcta" inert>
      <span className="wcta__pool" aria-hidden="true" />
      <Button href={href} external size="md" className="wcta__btn">
        {label}
      </Button>
    </div>
  );
}
