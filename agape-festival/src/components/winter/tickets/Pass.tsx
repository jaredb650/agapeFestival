import type { CSSProperties } from "react";
import { GlitchLayer } from "@/components/winter/ui";
import { Barcode } from "./Barcode";
import { PASS_CLIP, PASS_OUTLINE, TEAR_PCT } from "./geometry";

export interface PassDay {
  /** "DAY 01" */
  label: string;
  /** "FRI 02.19.27" */
  lcd: string;
  isoDate: string;
  dateLong: string;
}

export interface PassProps {
  logo: { src: string; width: number; height: number; alt: string };
  /** DICE event id, upper-cased (from the ticket URL). */
  serial: string;
  /** "WINTER EDITION" */
  edition: string;
  year: string;
  days: PassDay[];
  venue: { name: string; location: string };
  provider: string;
  /** Stage line, e.g. "01 PER DAY". */
  stages: string;
}

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * The holographic access pass: a portrait laminate with a punched lanyard slot,
 * a foil layer (a pre-rendered rainbow band moved by transform), a perforated
 * stub with a barcode, and the clean ÄGAPĒ Festival lockup. Carries only what
 * is known: the two days, the venue, the provider. Layers, outer to inner:
 * wrap (entrance) → float (idle sway, CSS) → pass (pointer tilt, GSAP).
 */
export function Pass({ logo, serial, edition, year, days, venue, provider, stages }: PassProps) {
  return (
    <div className="tk-pass-wrap tk-in" data-in="pass" style={d(0.55)}>
      <div className="tk-pass-float tk-loop">
        <div className="tk-pass" data-tk-pass>
          <div className="tk-pass__body" style={{ clipPath: PASS_CLIP }}>
            <span className="tk-pass__holo" data-tk-holo aria-hidden="true">
              <i className="tk-loop" />
            </span>
            {/* Watermark: the lockup's infinity rings only (cropped), huge and faint. */}
            <span className="tk-pass__wm" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} width={logo.width} height={logo.height} alt="" loading="lazy" decoding="async" />
            </span>

            <div className="tk-pass__main">
              <div className="tk-pass__head tk-in" data-in="fade" style={d(1.05)} aria-hidden="true">
                <span>Access pass</span>
                <span>
                  N<sup>o</sup> {serial}
                </span>
              </div>

              <div className="tk-pass__logo tk-in" data-in="glitch" style={d(1.15)}>
                <GlitchLayer intensity="subtle" idleEvery={9000}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.src} width={logo.width} height={logo.height} alt={logo.alt} loading="lazy" decoding="async" draggable={false} />
                </GlitchLayer>
              </div>

              <p className="tk-pass__edition tk-in" data-in="fade" style={d(1.3)}>
                {edition} <b>{year}</b>
              </p>

              <dl className="tk-pass__data">
                {days.map((day, i) => (
                  <div key={day.isoDate} className="tk-in" data-in="row" style={d(1.4 + i * 0.08)}>
                    <dt>{day.label}</dt>
                    <dd>
                      <time dateTime={day.isoDate}>
                        <span aria-hidden="true">{day.lcd}</span>
                        <span className="w-sr-only">{day.dateLong}</span>
                      </time>
                    </dd>
                  </div>
                ))}
                <div className="tk-in" data-in="row" style={d(1.56)}>
                  <dt>Venue</dt>
                  <dd>
                    {venue.name}
                    <small>{venue.location}</small>
                  </dd>
                </div>
                <div className="tk-in" data-in="row" style={d(1.64)}>
                  <dt>Stage</dt>
                  <dd>{stages}</dd>
                </div>
              </dl>

              <span className="tk-pass__seal tk-in" data-in="seal" style={d(1.8)} aria-hidden="true">
                <span className="tk-pass__seal-ring" />
                <b>Ä</b>
                <i>Auth</i>
              </span>
            </div>

            <span className="tk-pass__perf" style={{ top: TEAR_PCT }} aria-hidden="true" />

            <div className="tk-pass__stub" aria-hidden="true">
              <span className="tk-pass__bars tk-in" data-in="bars" style={d(1.85)}>
                <Barcode seed={serial} className="tk-pass__barcode" />
              </span>
              <div className="tk-pass__stubrow tk-in" data-in="fade" style={d(2)}>
                <span>
                  {provider} <i>::</i> EVT {serial}
                </span>
                <span>{year}</span>
              </div>
            </div>

            <span className="tk-pass__foil" aria-hidden="true">
              <i className="tk-loop" />
            </span>
            <span className="tk-pass__glare" data-tk-glare aria-hidden="true" />
            <span className="tk-pass__print" aria-hidden="true" />
          </div>
          <svg className="tk-pass__edge" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="tk-edge-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e3f0ff" />
                <stop offset="0.45" stopColor="#9cc8ff" />
                <stop offset="0.7" stopColor="#5a6f89" />
                <stop offset="1" stopColor="#3d6bff" />
              </linearGradient>
            </defs>
            <path d={PASS_OUTLINE} />
          </svg>
        </div>
      </div>
      <span className="tk-pass-shadow" aria-hidden="true" />
    </div>
  );
}
