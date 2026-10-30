import type { CSSProperties } from "react";
import { Button } from "@/components/winter/ui";
import { WINTER, WINTER_DAYS } from "@/data/winter";
import { FLYER, HERO, HERO_PORTRAIT_QUERY } from "./media";
import { DaysOut, HeroExit, HeroLogo, HeroVideo, HeroVideoToggle } from "./HeroBits";

/**
 * Bottom lockup over the hero media: logo, WINTER FESTIVAL on one line (two on
 * phones), then CTA + the flyer's hand-scrawled date. The media is HERO in
 * media.ts: a still (the LCP element) with an optional video over it.
 */
export function Hero() {
  const [d1, d2] = WINTER_DAYS;
  const style = {
    "--hero-pos": HERO.desktop.objectPosition,
    "--hero-pos-m": HERO.mobile.objectPosition,
  } as CSSProperties;

  return (
    <section id="hero" className="whero" aria-labelledby="hero-title" style={style}>
      <div className="whero__media" data-hero-media data-kind={HERO.video ? "video" : "photo"}>
        {HERO.mobile.src === HERO.desktop.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="whero__img"
            src={HERO.desktop.src}
            width={HERO.desktop.width}
            height={HERO.desktop.height}
            alt={HERO.alt}
            fetchPriority="high"
          />
        ) : (
          <picture>
            <source media={HERO_PORTRAIT_QUERY} srcSet={HERO.mobile.src} width={HERO.mobile.width} height={HERO.mobile.height} />
            <img
              className="whero__img"
              src={HERO.desktop.src}
              width={HERO.desktop.width}
              height={HERO.desktop.height}
              alt={HERO.alt}
              fetchPriority="high"
            />
          </picture>
        )}
        {HERO.video && <HeroVideo video={HERO.video} />}
        <div className="whero__shade" aria-hidden="true" />
      </div>

      <div className="whero__copy w-container" data-hero-copy>
        <div className="whero__logo" aria-hidden="true">
          <HeroLogo />
        </div>
        <h1 id="hero-title" className="w-display w-soft whero__title">
          <span className="w-sr-only">ÄGAPĒ </span>
          {/* One text run (it wraps by width on phones), so the title is the LCP element. */}
          Winter Festival
        </h1>
        <div className="whero__row">
          <div className="whero__ctas">
            <Button href={WINTER.tickets.url} external data-hero-cta>
              {WINTER.tickets.cta}
            </Button>
            <Button variant="link" href="#lineup">
              Lineup
            </Button>
          </div>
          <div className="whero__when">
            {/* The flyer's own hand-scrawled date, cut from the poster. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="whero__scrawl"
              src={FLYER.dateSmall.src}
              width={FLYER.dateSmall.width}
              height={FLYER.dateSmall.height}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <p className="whero__facts w-hud" data-tone="frost">
              <time dateTime={d1.isoDate}>{d1.date}</time>
              <span aria-hidden="true">&nbsp;+&nbsp;</span>
              <span className="w-sr-only"> and </span>
              <time dateTime={d2.isoDate}>{d2.date}</time>
              <span className="whero__venue">
                <span aria-hidden="true" className="whero__dot">·</span>
                {WINTER.venue.name}, {WINTER.venue.city}
              </span>
            </p>
            <DaysOut startIso={WINTER.dates.startIso} label={`${WINTER.name}, ${WINTER.dates.display}`} />
          </div>
        </div>
      </div>

      {HERO.credit && (
        <p className="whero__credit" data-hero-meta>
          {HERO.credit}
        </p>
      )}
      {HERO.video && (
        <div className="whero__meta" data-hero-meta>
          <HeroVideoToggle />
        </div>
      )}
      <HeroExit />
    </section>
  );
}
