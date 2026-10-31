import type { CSSProperties } from "react";
import { WINTER } from "@/data/winter";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "@/components/winter/page/media";
import { Countdown } from "./Countdown";
import { HeroVideo, VideoToggle } from "./HeroVideo";

/**
 * The old landing page, kept: the Kobosil footage on black, the big logo,
 * Winter Edition and the dates, a short red rule, the countdown and one red
 * Get tickets button. The footage dissolves into the page at the bottom edge.
 */
export function Hero() {
  const style = { "--pos": HERO.desktop.objectPosition, "--pos-m": HERO.mobile.objectPosition } as CSSProperties;
  return (
    <section id="hero" className="s-hero" aria-labelledby="hero-title" style={style}>
      <div className="s-hero__media">
        <picture>
          <source media={HERO_PORTRAIT_QUERY} srcSet={HERO.mobile.src} width={HERO.mobile.width} height={HERO.mobile.height} />
          <img
            className="s-hero__img"
            src={HERO.desktop.src}
            width={HERO.desktop.width}
            height={HERO.desktop.height}
            alt={HERO.alt}
            fetchPriority="high"
          />
        </picture>
        {HERO.video && <HeroVideo video={HERO.video} />}
      </div>
      <div className="s-hero__shade" aria-hidden="true" />

      <div className="s-hero__copy">
        <h1 id="hero-title" className="s-hero__logo">
          <span className="s-sr">ÄGAPĒ Winter Festival</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_LOGO.src}
            srcSet={HERO_LOGO.srcSet}
            sizes="(max-width: 640px) 80vw, 480px"
            width={HERO_LOGO.width}
            height={HERO_LOGO.height}
            alt=""
            fetchPriority="high"
            draggable={false}
          />
        </h1>
        <p className="s-hero__edition">{WINTER.edition}</p>
        <p className="s-hero__when">
          <span className="s-sr">
            {WINTER.dates.display}, {WINTER.venue.full}
          </span>
          <span className="s-mono" aria-hidden="true">
            {WINTER.dates.shortWithYear} · {WINTER.venue.name}, {WINTER.venue.city}
          </span>
        </p>
        <span className="s-rule" aria-hidden="true" />
        {/* Target = WINTER.countdown.targetIso (midnight NY, Feb 19). TODO_CONFIRM: Day 1 doors time (see winter.ts). */}
        <Countdown targetIso={WINTER.countdown.targetIso} label={WINTER.countdown.ariaLabel} />
        <a className="s-btn s-btn--primary s-btn--lg" href={WINTER.tickets.url} target="_blank" rel="noopener noreferrer">
          {WINTER.tickets.cta}
        </a>
      </div>

      {HERO.video && <VideoToggle />}
    </section>
  );
}
