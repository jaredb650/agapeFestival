"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/winter/ui";
import "@/styles/sections/cta.css";

/** Sections the floating CTA steps aside for. Add `data-cta-hide` to any element to join them. */
const HIDE_ON = "#tickets, #footer, [data-cta-hide]";
/** Phones only: one-screen sections whose bottom edge holds key UI (the flyer's date, the profiler grid). */
const HIDE_ON_MOBILE = "#flyer, #artists";
const MOBILE = "(max-width: 899px)";

/**
 * Floating Get tickets: a glowing hologram CTA docked at the bottom centre of
 * the viewport, in HUD chrome (rails, ticks, readouts). It docks once the
 * hero's CTA has scrolled out of view and steps aside while the Tickets
 * section, the footer (or any `data-cta-hide` element; on phones also the
 * flyer and the artist profiler) is on screen. Visibility is a data
 * attribute toggled from IntersectionObservers: no React state, no re-render.
 * Hidden = `inert` + `visibility: hidden`, so it is never tabbable unseen.
 */
export function FloatingCta({ href, label, meta }: { href: string; label: string; meta: { left: string; right: string } }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mobile = window.matchMedia(MOBILE);
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
      const sel = mobile.matches ? `${HIDE_ON}, ${HIDE_ON_MOBILE}` : HIDE_ON;
      document.querySelectorAll(sel).forEach((n) => blockIo.observe(n));
      update();
    };
    observeBlockers();
    mobile.addEventListener("change", observeBlockers);

    return () => {
      heroIo.disconnect();
      blockIo.disconnect();
      mobile.removeEventListener("change", observeBlockers);
    };
  }, []);

  return (
    <div ref={root} className="wcta" inert>
      <div className="wcta__rig" aria-hidden="true">
        <span className="wcta__floor" />
        <span className="wcta__rail" data-side="l">
          <b>{meta.left}</b>
        </span>
        <span className="wcta__rail" data-side="r">
          <b>{meta.right}</b>
        </span>
        <span className="wcta__pip" />
      </div>
      <Button href={href} external size="md" className="wcta__btn">
        {label}
      </Button>
    </div>
  );
}
