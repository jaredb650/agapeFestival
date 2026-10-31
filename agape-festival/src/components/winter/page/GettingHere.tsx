"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useReducedMotion, useScramble } from "@/components/winter/artist-select/hooks";
import { HudBezel } from "@/components/winter/map/HudBezel";
import { HudMap, type RouteMode } from "@/components/winter/map/HudMap";
import { VENUE, fmtLat, fmtLon } from "@/components/winter/map/geo";
import { useBoot } from "@/components/winter/map/useBoot";
import { Button, GlassWindow, HudLabel, Redaction } from "@/components/winter/ui";
import { GETTING_HERE } from "@/data/winter";
import "@/styles/sections/getting-here.css";

const g = GETTING_HERE;
const subway = g.cards.find((c) => c.id === "subway");
const drive = g.cards.find((c) => c.id === "drive");
const ride = g.cards.find((c) => c.id === "rideshare");
const lines = subway?.lines ?? [];

interface Route {
  mode: RouteMode;
  tab: string;
  label: string;
  title: string;
  body: string;
}

// The cards come straight from GETTING_HERE; only the subway card's pointer to
// "the map link above" is re-aimed at the NAVIGATE control in this layout.
const ROUTES: Route[] = [
  subway && { mode: "subway" as const, tab: "Subway", label: subway.label, title: subway.title, body: subway.body.replace(/the map link above/i, "Navigate") },
  drive && { mode: "drive" as const, tab: "Drive", label: drive.label, title: drive.title, body: drive.body },
  ride && { mode: "ride" as const, tab: "Ride", label: ride.label, title: ride.title, body: ride.body },
  {
    mode: "bike" as const,
    tab: "Bus/Bike",
    label: "BUS + CITI BIKE",
    title: `Buses ${g.secondary.buses.join(" · ")}`,
    body: `Citi Bike: ${g.secondary.citiBike}.`,
  },
].filter(Boolean) as Route[];

const q = encodeURIComponent(g.address.full);
const APPLE_MAPS = `https://maps.apple.com/?daddr=${q}`;
const LAT = fmtLat(VENUE.lat);
const LON = fmtLon(VENUE.lon);
const pad2 = (n: number) => String(n).padStart(2, "0");
const noSubscribe = () => () => {};
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export function GettingHere() {
  const rootRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [mode, setModeState] = useState<RouteMode>("subway");
  const [touched, setTouched] = useState(false);
  const setMode = useCallback((m: RouteMode) => {
    setModeState(m);
    setTouched(true);
  }, []);
  // NAVIGATE opens Apple Maps on iPhone/iPad, Google Maps everywhere else (server HTML: Google).
  const apple = useSyncExternalStore(noSubscribe, isIos, () => false);
  const reduced = useReducedMotion();
  // The map intro (and its layer hold) is over by ~3.8 s; detach it at 4.2 s.
  useBoot(rootRef, 0.3, 4200);


  const route = ROUTES.find((r) => r.mode === mode) ?? ROUTES[0];
  const titleRef = useScramble<HTMLSpanElement>(route.title, { disabled: reduced, ms: 380 });
  const navHref = apple ? APPLE_MAPS : g.mapsDirectionsUrl;
  const alt = apple ? { href: g.mapsDirectionsUrl, label: "Google Maps" } : { href: APPLE_MAPS, label: "Apple Maps" };


  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = ROUTES.findIndex((r) => r.mode === mode);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? ROUTES.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const n = (next + ROUTES.length) % ROUTES.length;
    setMode(ROUTES[n].mode);
    tabRefs.current[n]?.focus();
  };

  return (
    <section ref={rootRef} id="getting-here" className="wgh" data-mode={mode} data-touched={touched || undefined} aria-labelledby="gh-title">
      <div className="wgh-stage">
        <header className="wgh-head">
          <HudLabel size="nano" tone="mist" className="wgh-head__kicker">
            <span className="wgh-head__idx">NAV</span> :: {g.eyebrow}
          </HudLabel>
          <h2 id="gh-title" className="wgh-title">
            <span className="w-sr-only">{g.heading}</span>
            <span aria-hidden="true" data-decode="260">
              {g.heading}
            </span>
          </h2>
          <p className="wgh-intro">{g.intro}</p>
        </header>

        <div className="wgh-panel">
          <HudBezel label=":: NAV-LINK :: SUNSET PARK ::" />
          <HudMap mode={mode} onPick={setMode} lines={lines} />
          <p className="wgh-mini" aria-hidden="true">
            <span>TGT</span> {LAT} <i>/</i> {LON} <i>/</i> <b data-decode="2350" data-decode-from="SCANNING">LOCKED</b>
          </p>
          <GlassWindow
            as="div"
            skin="chrome"
            active
            className="wgh-target"
            title=":: Target lock ::"
            meta="TGT-01"
            aria-label="Venue address and directions"
            status={
              <>
                <span className="wgh-orbs" aria-hidden="true">
                  <span className="wgh-orb" data-lit="" />
                  <span className="wgh-orb" data-lit="" />
                  <span className="wgh-orb" />
                </span>
                <span aria-hidden="true">Nav-link :: ready</span>
              </>
            }
          >
            <div className="wgh-lcd" aria-hidden="true">
              <span className="wgh-lcd__row">
                LAT <b data-decode="2300">{LAT}</b> <i>/</i> LON <b data-decode="2380">{LON}</b>
              </span>
              <span className="wgh-lcd__row">
                STATUS: <b data-decode="2350" data-decode-from="ACQUIRING">LOCKED</b> <i>/</i> {g.address.line2.replace(/,.*/, "").toUpperCase()}
              </span>
            </div>
            <address className="wgh-addr">
              <span className="wgh-addr__l1">{g.address.line1}</span>
              <span className="wgh-addr__l2">{g.address.line2}</span>
            </address>
            <p className="wgh-gate">
              <span className="wgh-gate__k">Gate</span>
              {g.entrance ? (
                <span className="wgh-gate__v">{g.entrance}</span>
              ) : (
                <>
                  <Redaction length={2.6} seed={19} label="" className="wgh-gate__blob" />
                  <span className="wgh-gate__v">To be announced</span>
                </>
              )}
            </p>
            <div className="wgh-actions">
              <Button variant="secondary" size="sm" href={navHref} external className="wgh-navigate">
                Navigate
              </Button>
              <a className="wgh-link" href={alt.href} target="_blank" rel="noopener noreferrer">
                {alt.label} <span aria-hidden="true">↗︎</span>
              </a>
            </div>
          </GlassWindow>
        </div>

        <div className="wgh-console" role="group" aria-label="Route select">
          <div className="wgh-console__bar" aria-hidden="true">
            <span className="wgh-console__led" />
            <span>:: Route select ::</span>
            <span className="wgh-console__meta">
              {pad2(ROUTES.findIndex((r) => r.mode === mode) + 1)}/{pad2(ROUTES.length)}
            </span>
          </div>
          <div className="wgh-tabs" role="tablist" aria-label="How to get here" onKeyDown={onTabKey}>
            {ROUTES.map((r, i) => (
              <button
                key={r.mode}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`gh-tab-${r.mode}`}
                aria-selected={mode === r.mode}
                aria-controls="gh-readout"
                tabIndex={mode === r.mode ? 0 : -1}
                className="wgh-tab"
                onClick={() => setMode(r.mode)}
              >
                <span className="wgh-tab__idx" aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <span className="wgh-tab__label">{r.tab}</span>
              </button>
            ))}
          </div>
          <div id="gh-readout" className="wgh-readout" role="tabpanel" aria-labelledby={`gh-tab-${mode}`}>
            <div className="wgh-readout__top" key={mode}>
              <span className="wgh-readout__label">{route.label}</span>
              {mode === "subway" && (
                <span className="wgh-bullets">
                  {lines.map((l) => (
                    <span key={l.line} className="wgh-bullet" style={{ background: l.color, color: l.textColor }} role="img" aria-label={`${l.line} train`}>
                      {l.line}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <h3 className="wgh-readout__title">
              <span className="w-sr-only">{route.title}</span>
              <span ref={titleRef} aria-hidden="true">
                {route.title}
              </span>
            </h3>
            <p className="wgh-readout__body" key={`b-${mode}`}>
              {route.body}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
