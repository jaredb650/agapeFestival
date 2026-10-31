import type { CSSProperties } from "react";
import { WINTER } from "@/data/winter";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "@/components/winter/page/media";
import { Countdown } from "./Countdown";
import { HeroVideo } from "./HeroVideo";

/**
 * The old landing page, kept: the Kobosil footage full-bleed and dimmed on
 * black, the festival logo centred, Winter Edition, the dates, the thin red
 * divider, a countdown and one deep red Get tickets button.
 */
export function Hero() {
  const style = { "--hero-pos": HERO.desktop.objectPosition, "--hero-pos-m": HERO.mobile.objectPosition } as CSSProperties;
  const { provider, url, cta } = WINTER.tickets;

  return (
    <section id="hero" className="pp-hero" aria-labelledby="hero-title" style={style}>
      <div className="pp-hero__media" aria-hidden="true">
        <picture>
          <source media={HERO_PORTRAIT_QUERY} srcSet={HERO.mobile.src} width={HERO.mobile.width} height={HERO.mobile.height} />
          <img className="pp-hero__img" src={HERO.desktop.src} width={HERO.desktop.width} height={HERO.desktop.height} alt="" fetchPriority="high" />
        </picture>
      </div>
      {HERO.video && <HeroVideo video={HERO.video} />}
      <div className="pp-hero__scrim" aria-hidden="true" />

      <div className="pp-hero__content">
        <h1 id="hero-title" className="pp-hero__title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pp-hero__logo"
            src={HERO_LOGO.src}
            srcSet={HERO_LOGO.srcSet}
            sizes="(max-width: 640px) 80vw, 480px"
            width={HERO_LOGO.width}
            height={HERO_LOGO.height}
            alt="ÄGAPĒ Festival"
            fetchPriority="high"
            draggable={false}
          />
          <span className="pp-hero__edition">{WINTER.edition}</span>
        </h1>
        <p className="pp-hero__when">
          {WINTER.dates.shortWithYear}
          <span aria-hidden="true"> · </span>
          <span className="pp-sr"> at </span>
          {WINTER.venue.name}, {WINTER.venue.city}
        </p>
        <span className="pp-hero__divider" aria-hidden="true" />
        {/* Targets midnight New York on Feb 19. TODO_CONFIRM: Day 1 doors time (winter.ts). */}
        <Countdown targetIso={WINTER.countdown.targetIso} label={WINTER.countdown.ariaLabel} />
        <a className="pp-btn pp-btn--lg" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${cta} on ${provider} (opens in a new tab)`} data-hero-cta>
          {cta}
        </a>
      </div>
      {HERO.credit && <p className="pp-hero__credit">{HERO.credit}</p>}
    </section>
  );
}
