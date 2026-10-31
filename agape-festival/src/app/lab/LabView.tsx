import { Fragment } from "react";
import {
  Button,
  Frame,
  GlassWindow,
  GlitchLayer,
  Grain,
  HudLabel,
  Marquee,
  Redaction,
  Scrim,
  SectionHeading,
} from "@/components/winter/ui";
import { LINEUP, TBA_LABEL, WINTER } from "@/data/winter";
import { FighterSelectSketch } from "./FighterSelectSketch";

const SWATCHES = [
  { token: "--w-ink", hex: "#04060A", role: "Page background · flyer blacks", text: "frost 17.0:1" },
  { token: "--w-deep", hex: "#1B212C", role: "Panels · fog shadow", text: "frost 13.5:1" },
  { token: "--w-steel", hex: "#313743", role: "Raised chrome · tower mids", text: "frost 10.0:1" },
  { token: "--w-steel-blue", hex: "#5A6F89", role: "Lit tower blue · decoration", text: "decor only" },
  { token: "--w-fog", hex: "#737C8B", role: "Fogged sky · decorative labels", text: "ink 4.8:1" },
  { token: "--w-mist", hex: "#A7AFBA", role: "Secondary text", text: "ink 9.2:1" },
  { token: "--w-frost", hex: "#E9EBEC", role: "Primary text · flyer type", text: "ink 17.0:1" },
] as const;
const ACCENTS = [
  { token: "--w-ice", hex: "#9CC8FF", role: "Hover / focus / selected" },
  { token: "--w-volt", hex: "#3D6BFF", role: "CTA edge light · selected glow" },
] as const;

/** Distinct seeds per blob so neighbours don't look stamped. */
const BLOB = { "tba-1": { length: 7.2, seed: 3 }, "tba-3": { length: 3.6, seed: 21 } } as const;

function LineupBoard({ dayIndex, scrawl }: { dayIndex: 0 | 1; scrawl: string | null }) {
  const day = LINEUP[dayIndex];
  return (
    <div className="lab-board">
      {scrawl ? (
        <img src={scrawl} alt={day.label} className="lab-board__scrawl" />
      ) : (
        <HudLabel font="pixel" tone="frost" className="lab-board__day">{day.label}</HudLabel>
      )}
      <p className="w-lineup">
        {day.lines.map((line, li) => {
          // Consecutive TBA slots sharing a blob render as one wide blob, like the flyer.
          const acts = line.filter((act, i) => !(act.kind === "tba" && i > 0 && line[i - 1].kind === "tba" && (line[i - 1] as typeof act).blob === act.blob));
          return (
            <span className="w-lineup__line" key={li}>
              {acts.map((act, i) => (
                <Fragment key={act.kind === "artist" ? act.slug : act.id}>
                  {i > 0 && <span className="w-lineup__sep" aria-hidden="true">•</span>}
                  {act.kind === "artist" ? (
                    act.displayName
                  ) : (
                    <Redaction {...(BLOB[act.id as keyof typeof BLOB] ?? { length: 4, seed: 9 })} label={TBA_LABEL} />
                  )}
                </Fragment>
              ))}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export interface LabMedia {
  flyer: string;
  /** No-text tower still (falls back to the flyer). */
  poster: string;
  layers: { date: string | null; title: string | null; mark: string | null; day1: string | null; day2: string | null };
  flashGeaHeadshot: string;
}

export function LabView({ flyer, poster, layers, flashGeaHeadshot }: LabMedia) {
  return (
    <>
      {/* Flyer world behind everything */}
      <div className="lab-bg" aria-hidden="true">
        <img src={poster} alt="" className="lab-bg__img" />
        <Scrim variant="vignette" strength={0.92} />
      </div>
      <Grain />

      <header className="lab-topbar w-container">
        <HudLabel tone="frost">ÄGAPĒ · Style lab</HudLabel>
        <HudLabel tone="fog" size="nano">J1 · dev only · noindex</HudLabel>
      </header>

      <main>
        {/* ---------------- HERO SPECIMEN ---------------- */}
        <section className="w-container lab-hero">
          <div className="lab-hero__copy">
            <HudLabel index="00" rule>Winter edition · Brooklyn</HudLabel>
            <h1 className="w-display w-soft lab-hero__title">
              ÄGAPĒ<br />Winter<br />Festival
            </h1>
            {layers.date ? (
              <GlitchLayer className="lab-hero__date" intensity="subtle">
                <img src={layers.date} alt="February 19–20, 2027, Industry City" width={1023} height={203} />
              </GlitchLayer>
            ) : (
              <HudLabel font="pixel" tone="frost">FEB 19–20 2027 · INDUSTRY CITY</HudLabel>
            )}
            <p className="w-lead">
              Two nights, one stage each, under the tower. Fourteen acts announced, three still under the marker.
            </p>
            <div className="lab-cta-row">
              <Button href={WINTER.tickets.url} external>Get tickets</Button>
              <Button variant="secondary" href="#lineup">Lineup</Button>
              <Button variant="link" href="#select">Artist select</Button>
            </div>
          </div>
          <GlitchLayer className="lab-hero__flyer" intensity="subtle">
            <Frame size="lg">
              <img src={flyer} alt="ÄGAPĒ Winter Festival flyer: lineup for February 19–20, 2027 at Industry City" width={1080} height={1920} />
            </Frame>
          </GlitchLayer>
        </section>

        <Marquee
          className="lab-marquee"
          label="ÄGAPĒ Winter Festival, February 19–20 2027, Industry City Brooklyn"
          items={["ÄGAPĒ Winter Festival", "February 19–20 2027", "Industry City · Brooklyn", "Two days · one stage", "Tickets on DICE"].map((t) => (
            <span key={t} className="w-hud" data-tone="fog">{t}</span>
          ))}
        />

        {/* ---------------- PALETTE ---------------- */}
        <section className="w-section w-container">
          <SectionHeading index="01" label="Palette" title="Sampled from the flyer" size="h2">
            Greys carry the page. Blue appears only where something can be pressed or is selected.
          </SectionHeading>
          <div className="lab-swatches">
            {SWATCHES.map((s) => (
              <div className="lab-swatch" key={s.token}>
                <span className="lab-swatch__chip" style={{ background: s.hex }} />
                <span className="lab-swatch__name">{s.token}</span>
                <span className="w-small">{s.hex} · {s.role}</span>
                <span className="w-hud" data-size="nano" data-tone="fog">{s.text}</span>
              </div>
            ))}
          </div>
          <div className="lab-accent">
            <span className="lab-accent__bar" />
            <div className="lab-accent__keys">
              {ACCENTS.map((a) => (
                <span key={a.token} className="w-small"><strong className="lab-swatch__name">{a.token}</strong> {a.hex} · {a.role}</span>
              ))}
              <span className="w-hud" data-size="nano" data-tone="fog">Accent: interactive + selected only</span>
            </div>
          </div>
        </section>

        {/* ---------------- TYPE ---------------- */}
        <section className="w-section w-container lab-type">
          <SectionHeading index="02" label="Type" title="Wide, heavy, tracked" size="h2">
            Display: Orbitron black, the September heading face (display 900 at 0.12em, headings 800 at 0.08em), shared
            with the HUD labels. Swap point: <code>--font-display</code> in fonts.ts.
          </SectionHeading>
          <dl className="lab-specimens">
            <div><dt className="w-hud" data-size="nano">w-display</dt><dd className="w-display w-soft">Ben Klock</dd></div>
            <div><dt className="w-hud" data-size="nano">w-h1</dt><dd className="w-h1">Johannes Schuster</dd></div>
            <div><dt className="w-hud" data-size="nano">w-h2</dt><dd className="w-h2">Getting to Industry City</dd></div>
            <div><dt className="w-hud" data-size="nano">w-h3</dt><dd className="w-h3">Lockers &amp; coat check</dd></div>
            <div><dt className="w-hud" data-size="nano">w-lead</dt><dd className="w-lead">Doors and closing times for each day will be announced soon. Join the newsletter to hear first.</dd></div>
            <div><dt className="w-hud" data-size="nano">w-body</dt><dd className="w-body">One stage per day. Every act on a day&apos;s lineup plays that day&apos;s stage. Set times are shared closer to the festival.</dd></div>
            <div><dt className="w-hud" data-size="nano">w-hud</dt><dd><HudLabel index="04" rule>Tickets</HudLabel></dd></div>
            <div><dt className="w-hud" data-size="nano">w-hud pixel</dt><dd><HudLabel font="pixel" tone="frost">INTEL PENDING</HudLabel></dd></div>
          </dl>
        </section>

        {/* ---------------- LINEUP BOARD ---------------- */}
        <section className="w-section lab-lineup" id="lineup">
          <Scrim variant="radial" strength={0.75} />
          <div className="w-container lab-lineup__inner">
            <SectionHeading index="03" label="Lineup board" title="By day, like the poster" size="h2" align="center" />
            <LineupBoard dayIndex={0} scrawl={layers.day1} />
            <LineupBoard dayIndex={1} scrawl={layers.day2} />
          </div>
        </section>

        {/* ---------------- CONTROLS ---------------- */}
        <section className="w-section w-container">
          <SectionHeading index="04" label="Controls" title="Buttons & frames" size="h2">
            Hologram panes: a plain rectangle of ice glass, a 1px luminous edge, scanlines, and targeting brackets on
            all four corners that snap inward (lock on) on hover, focus and press. The primary keeps the ▶ glyph and
            pulses every ~5s (halo flare, outward ping, brackets tighten). One primary per view; the floating Get
            tickets dock (FloatingCta) reuses it.
          </SectionHeading>
          <div className="lab-grid-2">
            <div className="lab-panel">
              <HudLabel size="nano" tone="fog">Primary · lg / md / sm · hover or tab to lock on</HudLabel>
              <div className="lab-btn-stack">
                <Button href={WINTER.tickets.url} external>Get tickets</Button>
                <Button size="md">Get tickets</Button>
                <Button size="sm">Buy</Button>
              </div>
              <HudLabel size="nano" tone="fog">Secondary (same lock, frost, no pulse) · ghost · link</HudLabel>
              <div className="lab-btn-stack">
                <Button variant="secondary">Lineup</Button>
                <Button variant="ghost">FAQ</Button>
                <Button variant="link" href="#select">See all artists</Button>
                <Button variant="secondary" size="sm" disabled>Sold out</Button>
              </div>
            </div>
            <div className="lab-frames">
              <Frame className="lab-frame-demo"><HudLabel size="nano">Frame</HudLabel></Frame>
              <Frame hairline className="lab-frame-demo"><HudLabel size="nano">hairline</HudLabel></Frame>
              <Frame hairline interactive className="lab-frame-demo"><HudLabel size="nano">interactive (hover)</HudLabel></Frame>
              <Frame accent hairline className="lab-frame-demo"><HudLabel size="nano" tone="ice">accent · selected</HudLabel></Frame>
            </div>
          </div>
        </section>

        {/* ---------------- WINDOWS + GLITCH ---------------- */}
        <section className="w-section w-container">
          <SectionHeading index="05" label="Chrome & effects" title="Windows, glitch layers" size="h2" />
          <div className="lab-grid-2 lab-grid-2--top">
            <div className="lab-windows">
              <GlassWindow title="Getting here" meta="IC · 571 2ND AVE" status={<><span>Sunset Park</span><span>D/N/R 36 St</span></>}>
                <p className="w-body">
                  Industry City in Sunset Park, Brooklyn. Entrance details will be shared before the event.
                </p>
              </GlassWindow>
              <GlassWindow title="Tickets" skin="chrome" active meta="DICE" status={<><span>Status</span><span style={{ color: "var(--w-ice)" }}>On sale</span></>}>
                <div className="lab-window-cta">
                  <p className="w-body">Ticket options and prices are listed on the DICE event page.</p>
                  <Button variant="link" href={WINTER.tickets.url} external>Open DICE</Button>
                </div>
              </GlassWindow>
            </div>
            <div className="lab-glitch-demo">
              <img src={poster} alt="" className="lab-glitch-demo__bg" />
              <Scrim variant="radial" strength={0.55} />
              <div className="lab-glitch-demo__stack">
                <GlitchLayer intensity="strong" className="lab-glitch-demo__mark" idleEvery={6000}>
                  <img src={layers.mark ?? "/assets/logos/aFestWhite.png"} alt="ÄGAPĒ mark" />
                </GlitchLayer>
                {layers.title && (
                  <GlitchLayer className="lab-glitch-demo__title">
                    <img src={layers.title} alt="ÄGAPĒ Winter Festival" width={1341} height={146} />
                  </GlitchLayer>
                )}
                {layers.date && (
                  <GlitchLayer intensity="subtle" className="lab-glitch-demo__date">
                    <img src={layers.date} alt="" width={1023} height={203} />
                  </GlitchLayer>
                )}
              </div>
              <HudLabel size="nano" tone="mist" className="lab-glitch-demo__hint">GlitchLayer · hover or tap a layer</HudLabel>
            </div>
          </div>
        </section>

        {/* ---------------- ARTIST SELECT SKETCH ---------------- */}
        <section className="w-section w-container" id="select">
          <SectionHeading index="06" label="Artist select · sketch" title="Choose your fighter" size="h2">
            Hover (desktop) or tap (mobile) a tile. Three locked tiles stay redacted until the reveal.
          </SectionHeading>
          <FighterSelectSketch poster={poster} flashGeaHeadshot={flashGeaHeadshot} />
        </section>
      </main>

      <footer className="w-container lab-footer">
        <hr className="w-hairline" />
        <HudLabel size="nano" tone="fog">Tokens + components: context/winter-redesign/design-system.md</HudLabel>
      </footer>
    </>
  );
}
