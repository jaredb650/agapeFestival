import type { CSSProperties } from "react";
import { WINTER } from "@/data/winter";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "@/components/winter/page/media";
import { Countdown } from "./Countdown";
import { HeroBackdrop } from "./HeroBackdrop";

/**
 * The old landing, kept recognisable: the Kobosil footage full-bleed on black,
 * the big centred ÄGAPĒ Festival logo, Winter Edition, the date line, the thin
 * red rule, a plain countdown and the one deep red button.
 */
export function Hero() {
  const style = { "--hero-pos": HERO.desktop.objectPosition, "--hero-pos-m": HERO.mobile.objectPosition } as CSSProperties;
  return (
    <section id="hero" className="fr-hero" aria-labelledby="hero-title" style={style}>
      <HeroBackdrop hero={HERO} portraitQuery={HERO_PORTRAIT_QUERY} />
      <div className="fr-hero__copy">
        <h1 id="hero-title" className="fr-hero__title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="fr-hero__logo"
            src={HERO_LOGO.src}
            srcSet={HERO_LOGO.srcSet}
            sizes="(max-width: 640px) 80vw, 480px"
            width={HERO_LOGO.width}
            height={HERO_LOGO.height}
            alt="ÄGAPĒ Festival"
            fetchPriority="high"
            draggable={false}
          />
          <span className="fr-hero__edition">{WINTER.edition}</span>
        </h1>
        <p className="fr-hero__when">
          {WINTER.dates.display}
          <span aria-hidden="true"> · </span>
          <br className="fr-br-m" />
          {WINTER.venue.name}, {WINTER.venue.city}
        </p>
        <span className="fr-rule fr-rule--center" aria-hidden="true" />
        {/* Target = WINTER.countdown.targetIso (midnight NY, Feb 19). TODO_CONFIRM: Day 1 doors time (see winter.ts). */}
        <Countdown targetIso={WINTER.countdown.targetIso} label={WINTER.countdown.ariaLabel} />
        <a className="fr-btn fr-btn--lg" href={WINTER.tickets.url} target="_blank" rel="noopener noreferrer">
          {WINTER.tickets.cta}
        </a>
      </div>
    </section>
  );
}
