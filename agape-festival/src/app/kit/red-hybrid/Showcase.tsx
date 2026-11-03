"use client";

import { useEffect, useState, type ReactNode } from "react";
import { winterFontVariables } from "@/components/winter/fonts";
import {
  ChromeHousing,
  ChromeKey,
  ChromeNotch,
  ChromePlate,
  ChromeSocket,
  CtaRig,
  Frame,
  GlassWindow,
  Grain,
  HoloButton,
  HoloKey,
  HudBar,
  HudBarBrand,
  HudBarStatus,
  HudBezel,
  HudChip,
  HudLabel,
  HudRec,
  Lcd,
  MechWindow,
  Orb,
  PortBezel,
  RailBezel,
  RedHybridKit,
  SegmentLcd,
  SignalBars,
  TargetingHud,
  TerminalFrame,
} from "@/components/alt/red-hybrid";
// The drop-in demo wraps a real classic-refined panel, so it loads the site's kit CSS (this route only).
import "@/styles/winter.css";
import "@/styles/classic.css";
import "./showcase.css";

const TARGET = Date.parse("2027-02-19T22:00:00-05:00");
const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  const left = Math.max(0, TARGET - (now ?? TARGET - 1000 * 60 * 60 * 24 * 108));
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function Countdown() {
  const { d, h, m, s } = useCountdown();
  return (
    <SegmentLcd
      lead="T–MINUS"
      meta="DAY 01"
      label={`${d} days ${h} hours ${m} minutes to doors`}
      groups={[
        { value: pad(d), unit: "D" },
        { value: pad(h), unit: "H" },
        { value: pad(m), unit: "M" },
        { value: pad(s), unit: "S" },
      ]}
    />
  );
}

const ICONS = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  ),
  cam: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </svg>
  ),
};

function Item({ name, from, children, wide, note }: { name: string; from: string; children: ReactNode; wide?: boolean; note?: string }) {
  return (
    <section className="kit-item" data-wide={wide || undefined} data-item={name}>
      <header className="kit-item__head">
        <h2 className="kit-item__name">{name}</h2>
        <code className="kit-item__src">{from}</code>
      </header>
      {note && <p className="kit-item__note">{note}</p>}
      <div className="kit-item__stage">{children}</div>
    </section>
  );
}

const LINKS = [
  { label: "Lineup", href: "#lineup" },
  { label: "Tickets", href: "#tickets", current: true },
  { label: "Merch", href: "#merch" },
  { label: "FAQ", href: "#faq" },
  { label: "Getting here", href: "#getting-here" },
];

const PLATES = [
  { index: "01", label: "The roster", state: "SEC.01" },
  { index: "02", label: "Lineup", state: "SEC.02" },
  { index: "03", label: "Tickets", state: "◀︎ HERE", current: true },
  { index: "04", label: "Merch", state: "SEC.04" },
  { index: "05", label: "FAQ", state: "SEC.05" },
  { index: "06", label: "Getting here", state: "SEC.06" },
];

export function Showcase() {
  const [palette, setPalette] = useState<"red" | "blue">("red");
  const [menuOpen, setMenuOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState(1);
  const [chip, setChip] = useState(true);
  const [hudKey, setHudKey] = useState(0);

  const replayMenu = () => {
    setMenuOpen(false);
    setTimeout(() => setMenuOpen(true), 650);
  };

  return (
    <RedHybridKit as="main" palette={palette} className={`kit-page ${winterFontVariables}`}>
      <HudBar
        brand={<HudBarBrand href="#top" word="ÄGAPE" label="Red hybrid kit, top" mark={{ src: "/assets/winter/flyer/layers/logo-mark-64w.webp", width: 64, height: 90 }} />}
        status={<HudBarStatus pixel="SYS ONLINE" nano={<>NYC <b>22:00:00</b></>} />}
        links={LINKS}
        notch="03/07 ▸ ALT KIT"
        ticks={[0, 0.14, 0.3, 0.46, 0.62, 0.78, 0.92]}
        endWide={
          <>
            <Lcd shape="chamfer" style={{ width: 112 }} rows={[<><i>NYC</i> <b>22:00:00</b></>, <><i>SCAN</i> <span><b>064</b><i>%</i></span></>]} />
            <SignalBars />
          </>
        }
        endNarrow={<HoloKey icon="burger">Menu</HoloKey>}
      />

      <div className="kit-wrap" id="top">
        <header className="kit-intro">
          <HudLabel index="ALT" rule tone="ice">
            Red hybrid · alternate kit
          </HudLabel>
          <h1 className="kit-title">Cyber frames + chrome</h1>
          <p className="kit-lead">
            The blue HUD build&apos;s frame and chrome pieces from <code>winter-redesign @ c9688b5</code>, the last state before{" "}
            <code>e88ce36</code> simplified it into red hybrid. Opt-in only: <code>src/components/alt/red-hybrid/</code>. Preview + dev only.
          </p>
          <div className="kit-toggle" role="group" aria-label="Palette">
            <HoloButton variant={palette === "red" ? "primary" : "secondary"} size="sm" onClick={() => setPalette("red")} aria-pressed={palette === "red"}>
              Red hybrid
            </HoloButton>
            <HoloButton variant={palette === "blue" ? "primary" : "secondary"} size="sm" onClick={() => setPalette("blue")} aria-pressed={palette === "blue"}>
              Original blue
            </HoloButton>
          </div>
        </header>

        <div className="kit-grid">
          <Item name="TargetingHud" from="page/Hero.tsx HeroHud + hero.css" wide note="Assembles from first paint; the reticle layers spin, a scan band crosses every 8s.">
            <div className="kit-hud-bg" key={hudKey}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="kit-hud-bg__img" src="/assets/winter/hero/hero-1080.webp" alt="" />
              <TargetingHud
                style={{ ["--th-h" as string]: "760px" }}
                vtext="ÄGAPE Festival — Winter Edition — Industry City — 2027"
                tags={{ ne: { content: "TGT :: LOCKED", tone: "ice" }, sw: "RNG :: 02.19.27" }}
                data={{
                  tl: [<><HudRec /> REC <i>::</i> CH.01</>, { content: "SIGNAL ▮▮▮▮▯", tone: "ice" }, { content: "FEED // WNTR.27", tone: "fog" }],
                  tr: ["LOC :: Industry City", { content: "Brooklyn NY 11232", tone: "ice" }, { content: "1 STAGE / DAY", tone: "fog" }],
                  bl: [<>D1 <i>::</i> FRI 02.19.27</>, <>D2 <i>::</i> SAT 02.20.27</>, { content: <>TIX <i>::</i> DICE ON SALE</>, tone: "ice" }],
                }}
              >
                <div className="kit-lockup">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/winter/hero/logo-festival-680.webp" width={680} height={376} alt="ÄGAPĒ Festival" className="kit-lockup__logo" />
                  <Countdown />
                  <HoloButton href="#tickets">Get tickets</HoloButton>
                </div>
              </TargetingHud>
            </div>
            <div className="kit-row">
              <HudChip on={chip} feed="CAM 01" onClick={() => setChip((c) => !c)} icon={<svg viewBox="0 0 8 8" aria-hidden="true"><path d={chip ? "M1 0h2v8H1zM5 0h2v8H5z" : "M1 0l6 4-6 4z"} fill="currentColor" /></svg>}>
                {chip ? "Pause" : "Play"}
              </HudChip>
              <HoloButton variant="link" onClick={() => setHudKey((k) => k + 1)}>
                Replay the assemble
              </HoloButton>
            </div>
          </Item>

          <Item name="HudBezel" from="page/HudBezel.tsx + hud-bezel.css" note="FAQ / footer panel: chamfers, notch label, one curved corner, ice pins + accents. Powers on in view.">
            <HudBezel label="Frequently asked" bottomLabel="End of file">
              <div className="kit-faq">
                {["Is there re-entry?", "Where do I store my coat?", "What time are doors?"].map((q, i) => (
                  <div key={q} className="kit-faq__row" data-open={faqOpen === i || undefined}>
                    <span className="kit-faq__n">{`0${i + 1}`}</span>
                    <span className="kit-faq__q">{q}</span>
                    <ChromeKey on={faqOpen === i} aria-label={faqOpen === i ? "Close" : "Open"} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} />
                  </div>
                ))}
                <Lcd rows={["ENTRIES :: 03", "STATUS :: ONLINE"]} />
              </div>
            </HudBezel>
          </Item>

          <Item name="PortBezel" from="merch/MerchBezel.tsx + merch.css .wmx-stage" note="The armory / roster stage frame: notch connector, docking ports, tinted glass plate.">
            <PortBezel label="Armory">
              <div className="kit-armory">
                <ChromePlate shape="slant">Apparel</ChromePlate>
                <GlassWindow title="Inferno tee" meta="01/04" skin="chrome" active>
                  <Lcd rows={["CLASS :: TEE", <>SIZE <i>::</i> <b>S M L XL</b></>]} />
                </GlassWindow>
              </div>
            </PortBezel>
          </Item>

          <Item name="RailBezel" from="map/HudBezel.tsx + getting-here.css" note="The tactical map frame: draws on in view, tick ladders on the rails, ice chamfer strokes.">
            <RailBezel label="Industry City">
              <div className="kit-map" aria-hidden="true">
                <span className="kit-map__target" />
              </div>
            </RailBezel>
          </Item>

          <Item name="TerminalFrame" from="tickets/TerminalFrame.tsx + tickets.css .tk-scrim" note="The access terminal: top + bottom notch connectors, tick rulers, cockpit glass.">
            <TerminalFrame label="Access terminal" foot="DICE.FM">
              <div className="kit-terminal">
                <Lcd rows={[<><i>EVENT</i> ÄGAPE WINTER</>, <><i>STATUS</i> ON SALE</>]} big="FEB 19–20" />
                <div className="kit-orbs">
                  <Orb lit size="lg" />
                  <Orb size="lg" />
                  <Orb size="lg" />
                </div>
                <HoloButton href="#tickets" size="md">
                  Tickets
                </HoloButton>
              </div>
            </TerminalFrame>
          </Item>

          <Item name="MechWindow + SectorPlate + TickRail" from="nav/MenuDialog.tsx + nav.css .whud-menu__*" note="The mech menu window: unfolds on mount, folds on close. The dialog itself is not included.">
            <div className="kit-mech">
              <MechWindow
                title=":: ÄGAPE NAV.SYS ::"
                meta="06 SEC"
                open={menuOpen}
                lcd={["BOOT SEQ :: LINK OK :: W27", "LOC 03/06 TICKETS"]}
                plates={PLATES}
                statusOrbs={{ count: 6, lit: 2 }}
                status={
                  <>
                    <span className="rhk-mw__count">03/06</span>
                    <span>
                      NYC <b>22:00:00</b>
                    </span>
                  </>
                }
              />
            </div>
            <div className="kit-row">
              <HoloKey icon="close" onClick={() => setMenuOpen(false)}>
                Close
              </HoloKey>
              <HoloKey icon="burger" onClick={replayMenu}>
                Replay
              </HoloKey>
            </div>
          </Item>

          <Item name="GlassWindow" from="ui/GlassWindow.tsx + winter.css .w-window" note="Steel skin (quiet bevel) and chrome skin (silver Y2K bar); active = lit LED + accent underline.">
            <div className="kit-stack">
              <GlassWindow title="Intel :: Flash Gea" meta="14/17" status={<><span>Bio</span><span>01 / 03</span></>}>
                <p className="kit-copy">Steel skin. Frosted body with a chrome sheen, bevelled bar, status strip.</p>
              </GlassWindow>
              <GlassWindow title="Artist select" meta="P1" skin="chrome" active>
                <p className="kit-copy">Chrome skin, active.</p>
              </GlassWindow>
            </div>
          </Item>

          <Item name="HudBar + ChromeNotch" from="page/Nav.tsx + nav.css .whud*" note="The bar at the top of this page (meter tracks the scroll). The notch on its own:">
            <div className="kit-row kit-row--center">
              <ChromeNotch text="SECTOR SELECT" size="lg" />
              <ChromeNotch text="04/07 ▸ MERCH" />
            </div>
          </Item>

          <Item name="ChromePlate" from="--wmx-chrome / --hud-silver chips">
            <div className="kit-row">
              <ChromePlate shape="slant">Loadout</ChromePlate>
              <ChromePlate shape="chevron">
                Day <b>01</b>
              </ChromePlate>
              <ChromePlate shape="tab">Sector</ChromePlate>
              <ChromePlate shape="trap">? Random</ChromePlate>
              <ChromePlate shape="rect">Unit 07</ChromePlate>
            </div>
          </Item>

          <Item name="ChromeKey + ChromeSocket" from="faq.css .wfq__key · footer.css .wft__slot">
            <div className="kit-row">
              <ChromeKey aria-label="Open" />
              <ChromeKey aria-label="Close" on />
              <span className="kit-gap" />
              <ChromeSocket icon={ICONS.cam} label="Instagram" index="01" href="#top" />
              <ChromeSocket icon={ICONS.play} label="Videos" index="02" href="#top" />
              <ChromeSocket icon={ICONS.mail} label="Email" index="03" href="#top" />
              <ChromeSocket icon={ICONS.globe} label="Website" index="04" href="#top" />
            </div>
          </Item>

          <Item name="ChromeHousing" from="lockers.css .wlk-unit" wide note="Chamfered steel housing, silver top rail with ice pins, CRT power-on in view.">
            <ChromeHousing className="kit-housing">
              <span className="kit-housing__id">
                <span className="kit-housing__kicker">
                  <ChromePlate shape="rect">Unit 07</ChromePlate> Storage
                </span>
                <span className="kit-housing__title">Lockers</span>
              </span>
              <Lcd pairs={[{ k: "Bays", v: "Open" }, { k: "Pay", v: "Card" }]} />
              <HoloButton variant="secondary" href="#top" size="md">
                Reserve
              </HoloButton>
            </ChromeHousing>
          </Item>

          <Item name="Orb" from="asel-orb / wmx-orb / whud-orb / tk-orb">
            <div className="kit-row kit-row--center">
              <Orb size="xs" lit />
              <Orb size="sm" />
              <Orb size="sm" lit />
              <Orb />
              <Orb lit />
              <Orb lit beat />
              <Orb size="md" lit blink />
              <Orb size="lg" lit />
              <Orb size="lg" locked />
              <Orb size="lg" lit tone="p2" />
            </div>
          </Item>

          <Item name="Lcd + SegmentLcd" from="wfq__lcd · tk-lcd · wlk-lcd · whud__lcd · hero .wh-lcd">
            <div className="kit-stack">
              <Lcd rows={[":: Query :: lockers", "Match :: 02 entries", "Index :: 03/09"]} />
              <Lcd pairs={[{ k: "Bays", v: "Open" }, { k: "Doors", v: "22:00" }]} />
              <div className="kit-row">
                <Lcd shape="chamfer" style={{ width: 112 }} rows={[<><i>NYC</i> <b>22:00:00</b></>, <><i>SCAN</i> <span><b>064</b><i>%</i></span></>]} />
                <Countdown />
              </div>
            </div>
          </Item>

          <Item name="HoloButton" from="ui/Button.tsx + winter.css .w-btn (pre-flattening)" wide note="Hover: brackets lock on, sheen crosses the glass, primary caps split red/cyan. The primary pulses every 4.8s.">
            <div className="kit-row kit-row--center kit-row--loose">
              <HoloButton href="#top">Get tickets</HoloButton>
              <HoloButton href="#top" size="md">
                Get tickets
              </HoloButton>
              <HoloButton variant="secondary">View item</HoloButton>
              <HoloButton variant="secondary" size="sm">
                Navigate
              </HoloButton>
              <HoloButton variant="ghost">Details</HoloButton>
              <HoloButton variant="link" href="#top">
                Shop all
              </HoloButton>
            </div>
          </Item>

          <Item name="CtaRig + HoloKey + HudChip" from="FloatingCta + cta.css · nav.css .whud-btn · hero .wh-chip" wide>
            <div className="kit-row kit-row--center kit-row--loose">
              <CtaRig left="02.19–20.27" right="DICE.FM">
                <HoloButton href="#top" size="md">
                  Get tickets
                </HoloButton>
              </CtaRig>
            </div>
            <div className="kit-row kit-row--center">
              <HoloKey icon="burger">Menu</HoloKey>
              <HoloKey icon="close">Close</HoloKey>
              <HudChip feed="CAM 01" on>
                Pause
              </HudChip>
              <HudChip>Play</HudChip>
            </div>
          </Item>

          <Item name="Frame + HudLabel + Grain" from="ui/Frame.tsx · ui/HudLabel.tsx · ui/Grain.tsx">
            <div className="kit-stack">
              <div className="kit-row">
                <Frame hairline className="kit-frame">
                  <HudLabel>Hairline</HudLabel>
                </Frame>
                <Frame accent interactive className="kit-frame">
                  <HudLabel tone="ice">Accent</HudLabel>
                </Frame>
                <Frame size="lg" hairline className="kit-frame">
                  <HudLabel index="03" rule tone="frost">
                    Large
                  </HudLabel>
                </Frame>
              </div>
              <div className="kit-grain">
                <Grain local animated opacity={0.12} />
                <HudLabel font="pixel" tone="ice">
                  FILM GRAIN 0.12 · ANIMATED
                </HudLabel>
              </div>
            </div>
          </Item>

          <Item name="Drop-in: a classic .k-panel in a HudBezel" from="README › Using it in a section" wide note="A real classic-refined panel (class k-panel, inside .winter) wrapped in the chrome bezel.">
            <div className="winter kit-dropin">
              <HudBezel label="Lockers" fill={false} style={{ ["--bz-pad" as string]: "40px 24px 28px" }}>
                <div className="k-panel kit-dropin__panel">
                  <p className="k-label">Lockers</p>
                  <p className="k-body">Reserve a locker before the night; pick it up at the door. Card only.</p>
                </div>
              </HudBezel>
            </div>
          </Item>
        </div>
      </div>
      <Grain />
    </RedHybridKit>
  );
}
