import type { CSSProperties } from "react";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "@/components/winter/page/media";
import { WINTER } from "@/data/winter";
import { Countdown } from "./Countdown";
import { HeroVideo, HeroVideoToggle } from "./HeroVideo";

/**
 * The old landing page, kept: the Kobosil footage dim and desaturated on
 * black, the logo centred, the edition and dates, the short crimson rule, the
 * countdown and one deep red Get tickets button.
 */
export function Hero() {
  const style = { "--pos": HERO.desktop.objectPosition, "--pos-m": HERO.mobile.objectPosition } as CSSProperties;
  return (
    <section id="hero" className="cat-hero" aria-labelledby="hero-title" style={style}>
      <div className="cat-hero__media" aria-hidden="true">
        <picture>
          {HERO.mobile.src !== HERO.desktop.src && (
            <source media={HERO_PORTRAIT_QUERY} srcSet={HERO.mobile.src} width={HERO.mobile.width} height={HERO.mobile.height} />
          )}
          <img className="cat-hero__img" src={HERO.desktop.src} width={HERO.desktop.width} height={HERO.desktop.height} alt="" fetchPriority="high" />
        </picture>
        {HERO.video && <HeroVideo video={HERO.video} />}
        <div className="cat-hero__shade" />
      </div>

      <div className="cat-hero__copy">
        <h1 id="hero-title" className="cat-hero__title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="cat-hero__logo"
            src={HERO_LOGO.src}
            srcSet={HERO_LOGO.srcSet}
            sizes="(max-width: 640px) 78vw, 480px"
            width={HERO_LOGO.width}
            height={HERO_LOGO.height}
            alt="ÄGAPĒ Festival"
            draggable={false}
          />
          <span className="cat-hero__edition">{WINTER.edition}</span>
        </h1>
        <p className="cat-hero__when">
          <span>{WINTER.dates.display}</span>
          <span className="cat-hero__sep" aria-hidden="true">
            {" · "}
          </span>
          <span>
            {WINTER.venue.name}, {WINTER.venue.city}
          </span>
        </p>
        <span className="cat-rule" aria-hidden="true" />
        {/* Target = WINTER.countdown.targetIso (midnight NY, Feb 19). TODO_CONFIRM: Day 1 doors time (see winter.ts). */}
        <Countdown targetIso={WINTER.countdown.targetIso} label={WINTER.countdown.ariaLabel} />
        <a className="cat-btn cat-btn--lg" href={WINTER.tickets.url} target="_blank" rel="noopener noreferrer">
          {WINTER.tickets.cta}
        </a>
      </div>

      {HERO.video && (
        <div className="cat-hero__meta">
          <HeroVideoToggle />
        </div>
      )}
    </section>
  );
}
