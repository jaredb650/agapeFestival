import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/winter/ui";
import { WINTER, WINTER_DAYS } from "@/data/winter";
import { HERO, HERO_LOGO, HERO_PORTRAIT_QUERY } from "./media";
import { Countdown, HeroExit, HeroLogo, HeroVideo, HeroVideoToggle } from "./HeroBits";
import "@/styles/sections/hero.css";

/** "2027-02-19" → "02.19.27" (the artist select's LCD date format). */
const lcdDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}.${d}.${y.slice(2)}`;
};
const weekday = (date: string) => date.split(" ")[0];

const CIPHER = "#%/<>=+*01X7$:";

/** Per-glyph decode (CSS only, so it runs from first paint): each glyph flashes a cipher character, then lands. */
function Decode({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="wh-decode" style={{ "--d0": `${delay}ms` } as CSSProperties}>
      {[...text].map((ch, i) =>
        ch === " " ? (
          " "
        ) : (
          <span key={i} className="wh-decode__c" data-g={CIPHER[(i * 7 + text.length) % CIPHER.length]} style={{ "--i": i } as CSSProperties}>
            <span className="wh-decode__ch">{ch}</span>
          </span>
        ),
      )}
    </span>
  );
}

/** A HUD readout row that types in (stepped clip). */
function Row({ i, children, tone }: { i: number; children: ReactNode; tone?: "ice" | "fog" }) {
  return (
    <span className="wh-type" data-tone={tone} style={{ "--i": i } as CSSProperties}>
      {children}
    </span>
  );
}

/** SVG arc path, angles in degrees clockwise from 12 o'clock. */
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(200 + r * Math.cos(t)).toFixed(2)} ${(200 + r * Math.sin(t)).toFixed(2)}`;
  };
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
}

const RULER = ["+40", "+30", "+20", "+10", "00", "-10", "-20", "-30", "-40"];
const TAPE = ["33", "34", "35", "N", "01", "02", "03"];

/**
 * Decorative targeting HUD over the footage (aria-hidden): viewfinder frame,
 * a reticle ringing the lockup (two slow counter-rotating layers), axis lines,
 * pitch rulers, a heading tape with the scroll cue, LCD data blocks and a scan
 * band. It assembles on load (CSS keyframes from first paint, no JS) and pulls
 * back on scroll (HeroExit). Loops pause while the hero is off screen.
 */
function HeroHud() {
  const [d1, d2] = WINTER_DAYS;
  const v = WINTER.venue;
  return (
    <div className="wh-hud" aria-hidden="true" data-hero-hud>
      <span className="wh-hud__scan" />
      <span className="wh-hud__frame">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="wh-hud__reg" data-pos="tl" />
      <span className="wh-hud__reg" data-pos="tr" />
      <span className="wh-hud__reg" data-pos="bl" />
      <span className="wh-hud__reg" data-pos="br" />

      <div className="wh-ret">
        <div className="wh-ret__in">
          <svg className="wh-ret__base" viewBox="0 0 400 400" focusable="false">
            <circle cx="200" cy="200" r="197" className="wh-ret__ring" />
            <circle cx="200" cy="200" r="150" className="wh-ret__ring wh-ret__ring--in" />
            <path d="M200 -14v26M200 388v26M-14 200h26M388 200h26" className="wh-ret__cross" />
            <path d="M200 44v10M200 346v10M44 200h10M346 200h10" className="wh-ret__cross wh-ret__cross--in" />
            <path d="M195 18h10l-5 8z" className="wh-ret__pip" />
          </svg>
          <div className="wh-ret__spin wh-ret__spin--ticks">
            <svg viewBox="0 0 400 400" focusable="false">
              <circle cx="200" cy="200" r="182" className="wh-ret__ticks" />
              <circle cx="200" cy="200" r="182" className="wh-ret__ticks wh-ret__ticks--major" />
            </svg>
          </div>
          <div className="wh-ret__spin wh-ret__spin--arcs">
            <svg viewBox="0 0 400 400" focusable="false">
              <path d={arc(166, 24, 66)} className="wh-ret__arc" />
              <path d={arc(166, 114, 156)} className="wh-ret__arc" />
              <path d={arc(166, 204, 246)} className="wh-ret__arc" />
              <path d={arc(166, 294, 336)} className="wh-ret__arc" />
              <path d={arc(166, 80, 100)} className="wh-ret__arc wh-ret__arc--hot" />
              <path d={arc(166, 260, 280)} className="wh-ret__arc wh-ret__arc--hot" />
            </svg>
          </div>
          <span className="wh-ret__tag" data-pos="ne">
            <Row i={3} tone="ice">TGT :: LOCKED</Row>
          </span>
          <span className="wh-ret__tag" data-pos="sw">
            <Row i={4}>RNG :: {lcdDate(d1.isoDate)}</Row>
          </span>
        </div>
      </div>

      <span className="wh-hud__axis" data-side="l" />
      <span className="wh-hud__axis" data-side="r" />

      {(["l", "r"] as const).map((side) => (
        <div key={side} className="wh-hud__ruler" data-side={side}>
          <span className="wh-hud__ticks" />
          <span className="wh-hud__nums">
            {RULER.map((n) => (
              <b key={n}>{n}</b>
            ))}
          </span>
          <span className="wh-hud__pin">{side === "l" ? "◂" : "▸"}</span>
        </div>
      ))}

      <div className="wh-hud__tape">
        <span className="wh-hud__tape-ticks" />
        <span className="wh-hud__tape-nums">
          {TAPE.map((n) => (
            <b key={n} data-n={n === "N" || undefined}>
              {n}
            </b>
          ))}
        </span>
        <span className="wh-hud__tape-pin">▲</span>
        <span className="wh-hud__scroll">Scroll</span>
      </div>

      <div className="wh-hud__data" data-pos="tl">
        <Row i={0}>
          <span className="wh-hud__rec" /> REC <i>::</i> CH.01
        </Row>
        <Row i={1} tone="ice">
          SIGNAL ▮▮▮▮▯
        </Row>
        <Row i={2} tone="fog">
          FEED // WNTR.27
        </Row>
      </div>
      <div className="wh-hud__data" data-pos="tr">
        <Row i={1}>LOC :: {v.name}</Row>
        <Row i={2} tone="ice">
          {v.city} {v.region} {v.postalCode}
        </Row>
        <Row i={3} tone="fog">
          {WINTER.stagesPerDay} STAGE / DAY
        </Row>
      </div>
      <div className="wh-hud__data" data-pos="bl">
        <Row i={4}>
          D1 <i>::</i> {weekday(d1.date)} {lcdDate(d1.isoDate)}
        </Row>
        <Row i={5}>
          D2 <i>::</i> {weekday(d2.date)} {lcdDate(d2.isoDate)}
        </Row>
        <Row i={6} tone="ice">
          TIX <i>::</i> {WINTER.tickets.provider} ON SALE
        </Row>
      </div>
      <span className="wh-hud__vtext">ÄGAPE Festival — {WINTER.edition} — {WINTER.venue.location} — {WINTER.year}</span>

      <span className="wh-hud__slice" data-n="1" />
      <span className="wh-hud__slice" data-n="2" />
      <span className="wh-hud__slice" data-n="3" />
    </div>
  );
}

/**
 * Centred lockup over the Kobosil footage (the live Sept/v1 hero's vibe): the
 * ÄGAPĒ Festival logo big in the middle, WINTER EDITION, dates + venue, the
 * LCD countdown and Get tickets dead centre, all inside a targeting HUD.
 * The media is HERO in media.ts: a still (the LCP element, preloaded) with the
 * video fading in over it only once it actually plays.
 */
export function Hero() {
  const [d1] = WINTER_DAYS;
  const style = {
    "--hero-pos": HERO.desktop.objectPosition,
    "--hero-pos-m": HERO.mobile.objectPosition,
  } as CSSProperties;
  // Chonky Pixels has no en dash: the pixel readout uses a hyphen (the sr-only line keeps the proper one).
  const when = `${WINTER.dates.shortWithYear.replace("–", "-")} · ${WINTER.venue.name}, ${WINTER.venue.city}`;

  return (
    <section id="hero" className="wh" aria-labelledby="hero-title" style={style}>
      <div className="wh__media" data-hero-media data-kind={HERO.video ? "video" : "photo"}>
        {HERO.mobile.src === HERO.desktop.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="wh__img"
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
              className="wh__img"
              src={HERO.desktop.src}
              width={HERO.desktop.width}
              height={HERO.desktop.height}
              alt={HERO.alt}
              fetchPriority="high"
            />
          </picture>
        )}
        {HERO.video && <HeroVideo video={HERO.video} />}
        <div className="wh__shade" aria-hidden="true" />
      </div>

      <HeroHud />

      <div className="wh__copy" data-hero-copy>
        <div className="wh__logo" aria-hidden="true">
          <HeroLogo logo={HERO_LOGO} sizes="(max-width: 640px) 84vw, 560px" />
        </div>
        <h1 id="hero-title" className="wh__title">
          <span className="w-sr-only">ÄGAPĒ Winter Festival</span>
          <span className="wh__edition" aria-hidden="true">
            <span className="wh__rule" />
            <Decode text={WINTER.edition} delay={480} />
            <span className="wh__rule" />
          </span>
        </h1>
        <p className="wh__when">
          <span className="w-sr-only">
            {WINTER.dates.display}, {WINTER.venue.full}
          </span>
          <span aria-hidden="true">
            <Decode text={when} delay={700} />
          </span>
        </p>
        {/* Target = WINTER.countdown.targetIso (midnight NY, Feb 19). TODO_CONFIRM: Day 1 doors time (see winter.ts). */}
        <Countdown
          targetIso={WINTER.countdown.targetIso}
          label={WINTER.countdown.ariaLabel}
          lead="T–Minus"
          meta={`DAY 01 ▸ ${lcdDate(d1.isoDate)}`}
        />
        <div className="wh__cta">
          <Button href={WINTER.tickets.url} external data-hero-cta>
            {WINTER.tickets.cta}
          </Button>
        </div>
      </div>

      {HERO.video && (
        <div className="wh__meta" data-hero-meta>
          <HeroVideoToggle />
        </div>
      )}
      {HERO.credit && (
        <p className="wh__credit" data-hero-meta>
          {HERO.credit}
        </p>
      )}
      <HeroExit />
    </section>
  );
}
