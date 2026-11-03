import type { CSSProperties } from "react";
import { Button } from "@/components/winter/ui";
import { SHOW_ARTIST_SELECT, WINTER } from "@/data/winter";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "./media";
import { Countdown, HeroExit, HeroFit, HeroLogo, HeroVideo, HeroVideoToggle } from "./HeroBits";
import "@/styles/sections/hero.css";

/** The section right below the hero (classic-notext: no flyer between them). */
const NEXT = SHOW_ARTIST_SELECT ? { href: "#artists", label: "Scroll to the roster" } : { href: "#lineup", label: "Scroll to the lineup" };

function Chevron() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
      <path d="M3 4 12 12 21 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The deployed hero (agape-festival.com), ported nearly pixel for pixel and
 * adapted to sit at the top of the scrolling page: the Kobosil footage under a
 * vignette, the corner frame, the GlitchLogo, WINTER EDITION and the date in
 * Chonky Pixels typing in, the red divider, the 4-box countdown, the red Get
 * tickets and the pause button. The global scanline layer (Grain) covers it.
 * The still is the LCP element (preloaded in page.tsx) and is visible from the
 * first frame; the video fades in over it only once it actually plays. The
 * intro is CSS from first paint; the preloader parks it until its hand-off.
 */
export function Hero() {
  const style = {
    "--hero-pos": HERO.desktop.objectPosition,
    "--hero-pos-m": HERO.mobile.objectPosition,
  } as CSSProperties;

  return (
    <section id="hero" className="wh" aria-labelledby="hero-title" style={style}>
      <div className="wh__bg" data-hero-media aria-hidden="true">
        <div className="wh__footage">
          {HERO.mobile.src === HERO.desktop.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="wh__poster" src={HERO.desktop.src} width={HERO.desktop.width} height={HERO.desktop.height} alt="" fetchPriority="high" />
          ) : (
            <picture>
              <source media={HERO_PORTRAIT_QUERY} srcSet={HERO.mobile.src} width={HERO.mobile.width} height={HERO.mobile.height} />
              <img className="wh__poster" src={HERO.desktop.src} width={HERO.desktop.width} height={HERO.desktop.height} alt="" fetchPriority="high" />
            </picture>
          )}
          {HERO.video && <HeroVideo video={HERO.video} />}
        </div>
        <div className="wh__vignette" />
      </div>
      <div className="wh__frame" data-hero-meta aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="wh__content" data-hero-copy>
        <h1 id="hero-title" className="wh__logo">
          <span className="w-sr-only">ÄGAPĒ Festival</span>
          <span className="wh__logo-box" data-boot-logo aria-hidden="true">
            <HeroLogo logo={HERO_LOGO} sizes="(max-width: 600px) 84vw, 510px" />
          </span>
        </h1>
        <div className="wh__details">
          <h2 className="wh__edition">
            <span>{WINTER.edition}</span>
          </h2>
          <p className="wh__date">
            <span>{WINTER.dates.short}</span>
          </p>
        </div>
        <div className="wh__reveal">
          <div className="wh__divider" data-boot-divider aria-hidden="true" />
          {/* Target = WINTER.countdown.targetIso (midnight NY, Feb 19). TODO_CONFIRM: Day 1 doors time (see winter.ts). */}
          <Countdown targetIso={WINTER.countdown.targetIso} label={WINTER.countdown.ariaLabel} />
          <Button href={WINTER.tickets.url} external className="wh__cta" data-hero-cta>
            {WINTER.tickets.cta}
          </Button>
        </div>
      </div>

      <a className="wh__next" href={NEXT.href} data-hero-meta aria-label={NEXT.label}>
        <Chevron />
      </a>
      {HERO.video && (
        <div className="wh__meta" data-hero-meta>
          <HeroVideoToggle />
        </div>
      )}
      <HeroFit />
      <HeroExit />
    </section>
  );
}
