"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { winterFontVariables } from "@/components/winter/fonts";
import { Button, CloseButton, IconButton, Segmented, TabRail, type ButtonSize, type ButtonVariant, type IconButtonVariant } from "@/components/winter/classic";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BikeIcon,
  CalendarIcon,
  CarFrontIcon,
  CarIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  MenuIcon,
  MutedIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
  SoundIcon,
  TrainIcon,
} from "@/components/winter/ui";
// This route loads the site's kit CSS itself (it isn't under the home page).
import "@/styles/winter.css";
import "@/styles/classic.css";
import "@/styles/kit/buttons.css";
import "./showcase.css";

type Demo = "default" | "hover" | "press" | "focus" | "disabled" | "loading" | "selected";
const STATES: Demo[] = ["default", "hover", "press", "focus", "disabled", "loading"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];
const SIZE_NOTE: Record<ButtonSize, string> = { sm: "sm · 40", md: "md · 48", lg: "lg · 56" };

/** The props that put a control in a state for the page (hover / press / focus are forced by showcase.css). */
function stateProps(s: Demo) {
  if (s === "disabled") return { disabled: true };
  if (s === "loading") return { loading: true };
  if (s === "selected") return { "aria-pressed": true };
  if (s === "default") return {};
  return { "data-demo": s };
}

function Block({ id, title, note, children, wide }: { id: string; title: string; note: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <section id={id} className="kbs-block" data-wide={wide || undefined} aria-labelledby={`${id}-t`}>
      <div className="kbs-block__head">
        <h2 id={`${id}-t`} className="k-h2">
          {title}
        </h2>
        <p className="k-small kbs-note">{note}</p>
      </div>
      <div className="kbs-stage">{children}</div>
    </section>
  );
}

const LABELS: Record<ButtonVariant, string> = { primary: "Get tickets", secondary: "Reserve a locker", ghost: "View all", link: "@agape.nyc" };

/** Every state (down) x every size (across) for one Button variant. */
function ButtonMatrix({ variant, extra = [] }: { variant: ButtonVariant; extra?: Demo[] }) {
  const states = [...STATES, ...extra];
  const icon = variant === "ghost" ? "arrow" : variant === "primary" ? undefined : "external";
  return (
    <div className="kbs-matrix" style={{ "--cols": SIZES.length } as CSSProperties}>
      <span />
      {SIZES.map((size) => (
        <span key={size} className="k-label kbs-matrix__col">
          {SIZE_NOTE[size]}
        </span>
      ))}
      {states.map((s) => (
        <div key={s} className="kbs-matrix__row">
          <span className="k-label kbs-matrix__rowhead">{s}</span>
          {SIZES.map((size) => (
            <div key={size} className="kbs-cell">
              <Button variant={variant} size={size} icon={icon} {...stateProps(s)}>
                {LABELS[variant]}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const IB: { v: IconButtonVariant; icon: ReactNode; label: string; note: string }[] = [
  { v: "plain", icon: <ArrowRight />, label: "Next", note: "plain" },
  { v: "outline", icon: <ArrowLeft />, label: "Previous", note: "outline" },
  { v: "red", icon: <CloseIcon />, label: "Close", note: "red · close" },
];

function IconMatrix() {
  const states: Demo[] = [...STATES, "selected"];
  return (
    <div className="kbs-matrix kbs-matrix--icons" style={{ "--cols": states.length + 1 } as CSSProperties}>
      <span />
      <span className="k-label kbs-matrix__col">sizes</span>
      {states.map((s) => (
        <span key={s} className="k-label kbs-matrix__col">
          {s === "selected" ? "on" : s}
        </span>
      ))}
      {IB.map((b) => (
        <div key={b.v} className="kbs-matrix__row">
          <span className="k-label kbs-matrix__rowhead">{b.note}</span>
          <div className="kbs-cell kbs-cell--sizes">
            <IconButton label={b.label} icon={b.icon} variant={b.v} size="sm" />
            <IconButton label={b.label} icon={b.icon} variant={b.v} />
            <IconButton label={b.label} icon={b.icon} variant={b.v} size="lg" />
          </div>
          {states.map((s) => (
            <div key={s} className="kbs-cell">
              <IconButton label={b.label} icon={b.icon} variant={b.v} {...stateProps(s)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A bar like the bio pop-out's: where the act sits in its day, previous / next, and the red close. */
function BioBar() {
  return (
    <div className="kbs-bar">
      <p className="k-label kbs-bar__count">
        <span className="kbs-bar__day">Day 2</span>
        <span>1 / 9</span>
      </p>
      <div className="kbs-bar__ctrls">
        <IconButton label="Previous artist" icon={<ArrowLeft size={20} />} variant="outline" />
        <IconButton label="Next artist" icon={<ArrowRight size={20} />} variant="outline" />
        <CloseButton label="Close bio" />
      </div>
    </div>
  );
}

/** The menu's head: the wordmark, and the red close where the Menu button sits in the bar. */
function MenuHead({ open }: { open: boolean }) {
  return (
    <div className="kbs-menuhead">
      <span className="kbs-word">ÄGAPĒ</span>
      {open ? (
        <CloseButton label="Close menu" />
      ) : (
        <Button variant="ghost" size="sm" icon={<MenuIcon size={20} className="k-btn__icon" />} className="kbs-menu" aria-label="Menu">
          Menu
        </Button>
      )}
    </div>
  );
}

const MODES = [
  { id: "subway", label: "Subway", icon: <TrainIcon size={20} /> },
  { id: "drive", label: "Drive", icon: <CarIcon size={20} /> },
  { id: "ride", label: "Rideshare", icon: <CarFrontIcon size={20} /> },
  { id: "bike", label: "Bus + bike", icon: <BikeIcon size={20} /> },
] as const;
type Mode = (typeof MODES)[number]["id"];

export function Showcase({ background, address, routes }: { background: string; address: string; routes: ReactNode }) {
  const [surface, setSurface] = useState<"footage" | "panel" | "plate">("footage");
  const [day, setDay] = useState<"1" | "2">("1");
  const [size, setSize] = useState("m");
  const [side, setSide] = useState<"front" | "back">("back");
  const [mode, setMode] = useState<Mode>("subway");
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const send = () => {
    setSending(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSending(false), 1800);
  };
  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`winter kbs ${winterFontVariables}`} data-surface={surface}>
      <div className="kbs-bg" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      <main className="kbs-wrap">
        <header className="kbs-intro">
          <p className="k-label k-label--red">Classic kit</p>
          <h1 className="k-h1">Buttons</h1>
          <div className="k-head__rule" aria-hidden="true" />
          <p className="k-lead">
            One family for every control below the hero. Square, Orbitron caps, three colours: the deep red fill for the one action a view exists for and for
            Close, a dark plate with a hairline for everything else, and text with an arrow when a box would be too loud.
          </p>
          <div className="kbs-toolbar">
            <span className="k-label">Surface</span>
            <Segmented
              label="Surface behind the stages"
              options={[
                { value: "footage", label: "Footage" },
                { value: "panel", label: "Panel" },
                { value: "plate", label: "Plate" },
              ]}
              value={surface}
              onChange={setSurface}
              size="sm"
            />
          </div>
          <p className="k-small">
            Hover, press and focus are forced here so they can be compared side by side; on the site hover only exists on a mouse, and the focus ring only
            for the keyboard. Every control keeps a 44px touch target, whatever its drawn size.
          </p>
        </header>

        <div className="kbs-grid">
          <Block id="primary" title="Primary" note="#8b0000, white Orbitron caps. Hover #a00000. One per view: Get tickets. sm 40 (the bar), md 48, lg 56 (a section's CTA)." wide>
            <ButtonMatrix variant="primary" />
          </Block>

          <Block id="secondary" title="Secondary" note="The plate (#0a0a0a) with a white-18% hairline, the card's material. Hover lifts the plate and the edge. Lockers, directions, socials." wide>
            <ButtonMatrix variant="secondary" extra={["selected"]} />
          </Block>

          <Block id="ghost" title="Ghost" note="Orbitron caps and an arrow, no box. The arrow nudges 3px on hover. Selected: white and a red rule under it (the nav's current mark)." wide>
            <ButtonMatrix variant="ghost" extra={["selected"]} />
          </Block>

          <Block id="link" title="Link" note="Archivo, for words that can't be caps: handles, an email, a link beside a sentence (underlined there)." wide>
            <ButtonMatrix variant="link" />
            <div className="kbs-row">
              <Button variant="link" underline href="#link" icon="arrow">
                Getting here
              </Button>
              <Button variant="link" underline href="#link" external>
                Get tickets on DICE
              </Button>
              <p className="k-body">
                Inside a sentence it is the plain <a className="k-link" href="#link">inline link</a>, not a button.
              </p>
            </div>
          </Block>

          <Block
            id="icon"
            title="Icon buttons"
            note="One glyph in a square: 36 / 44 / 56, glyph 16 / 20. Plain in a quiet bar, outline beside other squares, red for Close. Press is 0.94: a small square needs a little more travel to be felt."
            wide
          >
            <IconMatrix />
          </Block>

          <Block id="close" title="Close" note="The way out of every layer is the same red square with an X, in the same corner: the bio pop-out, the menu, anything that opens later.">
            <BioBar />
            <div className="kbs-pair">
              <MenuHead open={false} />
              <MenuHead open />
            </div>
            <div className="kbs-row">
              <Button variant="secondary" size="sm" onClick={() => setMenuOpen((o) => !o)}>
                {menuOpen ? "Show the bar" : "Show the menu"}
              </Button>
              <MenuHead open={menuOpen} />
            </div>
          </Block>

          <Block id="toggles" title="Toggles" note="Icon buttons with aria-pressed (a clip's sound, a loop's motion), and the segmented toggle: equal cells, the red mark slides to the choice.">
            <div className="kbs-row">
              <IconButton label={muted ? "Sound on" : "Sound off"} icon={muted ? <MutedIcon /> : <SoundIcon />} variant="outline" aria-pressed={!muted} onClick={() => setMuted((m) => !m)} />
              <IconButton label={playing ? "Pause" : "Play"} icon={playing ? <PauseIcon /> : <PlayIcon />} variant="outline" onClick={() => setPlaying((p) => !p)} />
              <IconButton label="Share" icon={<ShareIcon />} variant="outline" />
            </div>
            <div className="kbs-stack">
              <span className="k-label">Day</span>
              <Segmented label="Day" options={[{ value: "1", label: "Day 1" }, { value: "2", label: "Day 2" }]} value={day} onChange={setDay} />
              <span className="k-label">Size (XXL unavailable)</span>
              <Segmented
                label="Size"
                options={[
                  { value: "s", label: "S" },
                  { value: "m", label: "M" },
                  { value: "l", label: "L" },
                  { value: "xl", label: "XL" },
                  { value: "xxl", label: "XXL", disabled: true },
                ]}
                value={size}
                onChange={setSize}
              />
              <span className="k-label">Side, inside a plate (no frame, mark on top)</span>
              <div className="kbs-plate">
                <span className="k-name">Inferno tee</span>
                <Segmented label="Side shown" options={[{ value: "front", label: "Front" }, { value: "back", label: "Back" }]} value={side} onChange={setSide} mark="top" frame={false} />
              </div>
            </div>
          </Block>

          <Block
            id="routes"
            title="Route tabs"
            note="Getting here's own control. Attached (the site): all four ways in in one row of short tabs docked on top of the map, inside its frame, so the tabs and the map fit one view and a tap never scrolls. Icon over label on phones, beside it from 768. The picked tab lifts, its glyph turns red and a 3px red bar lies on the map's top edge: the route line's colour and weight. Tiles (the default): 2 across in their own box, for a rail that sits apart from its panel. Tabs: arrows move and pick."
            wide
          >
            <div className="kbs-routes">
              <span className="k-label">Attached · on its panel</span>
              <div className="k-panel kbs-routes__stage">
                <TabRail label="Ways to get here (attached demo)" items={MODES} value={mode} onChange={(m) => setMode(m)} idBase="kbs-route-att" attached className="gh-tabs" />
                <div className="kbs-routes__map" aria-hidden="true">
                  <span className="k-label">{MODES.find((m) => m.id === mode)?.label} on the map</span>
                </div>
              </div>
              <span className="k-label kbs-routes__sub">Tiles · default</span>
              <TabRail label="Ways to get here (tiles demo)" items={MODES} value={mode} onChange={(m) => setMode(m)} idBase="kbs-route" className="gh-tabs" />
              <p className="k-small">The live section, with its map, is at the foot of this page.</p>
            </div>
          </Block>

          <Block id="in-use" title="In use" note="The site's controls, as the sections set them." wide>
            <div className="kbs-uses">
              <div className="kbs-use">
                <span className="k-label">Tickets · primary lg</span>
                <Button href="#in-use" external size="lg">
                  Get tickets
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Bar · primary sm</span>
                <Button href="#in-use" external size="sm" icon={null}>
                  Get tickets
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Lockers · secondary</span>
                <Button variant="secondary" href="#in-use" external>
                  Reserve a locker
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Directions · secondary</span>
                <div className="kbs-row">
                  <Button variant="secondary" href="#in-use" external>
                    Google Maps
                  </Button>
                  <Button variant="secondary" href="#in-use" external>
                    Apple Maps
                  </Button>
                </div>
              </div>
              <div className="kbs-use">
                <span className="k-label">Socials · secondary sm + handle</span>
                <div className="kbs-row">
                  <Button variant="secondary" size="sm" href="#in-use" external meta="@flash.gea">
                    Instagram
                  </Button>
                  <Button variant="secondary" size="sm" href="#in-use" external meta="@agape.nyc">
                    Instagram
                  </Button>
                </div>
              </div>
              <div className="kbs-use">
                <span className="k-label">Footer · ghost sm, link</span>
                <div className="kbs-col">
                  <Button variant="ghost" size="sm" href="#in-use">
                    Lineup
                  </Button>
                  <Button variant="ghost" size="sm" href="#in-use" aria-current="location">
                    Tickets
                  </Button>
                  <Button variant="link" href="#in-use" external>
                    Newsletter
                  </Button>
                </div>
              </div>
            </div>
          </Block>

          <Block id="next" title="Next up" note="Not on the site yet; drawn so they arrive in the family." wide>
            <div className="kbs-uses">
              <div className="kbs-use">
                <span className="k-label">Add to calendar</span>
                <Button variant="secondary" lead={<CalendarIcon />} icon={null}>
                  Add to calendar
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Copy address</span>
                <Button variant="secondary" size="sm" lead={copied ? <CheckIcon /> : <CopyIcon />} icon={null} onClick={copy} aria-live="polite">
                  {copied ? "Copied" : "Copy address"}
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Newsletter</span>
                <form
                  className="kbs-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <label className="w-sr-only" htmlFor="kbs-email">
                    Email
                  </label>
                  <input id="kbs-email" className="kbs-input" type="email" placeholder="Email" autoComplete="off" />
                  <Button type="submit" size="sm" loading={sending} icon={null}>
                    Sign up
                  </Button>
                </form>
              </div>
              <div className="kbs-use">
                <span className="k-label">Back to top</span>
                <Button variant="ghost" href="#top" lead={<ArrowUp />} icon={null}>
                  Back to top
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Sold out</span>
                <Button href="#next" disabled size="lg" icon={null}>
                  Sold out
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Load more</span>
                <Button variant="secondary" loading>
                  Load more
                </Button>
              </div>
              <div className="kbs-use">
                <span className="k-label">Share</span>
                <div className="kbs-row">
                  <IconButton label="Share" icon={<ShareIcon />} variant="outline" />
                  <Button variant="ghost" lead={<ShareIcon />} icon={null}>
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Block>

          <Block id="phone" title="Phone column" note="390 wide: full-width controls, the bar's squares, the chips wrapping." wide>
            <div className="kbs-phone">
              <MenuHead open={false} />
              <BioBar />
              <Button href="#phone" external size="lg" block>
                Get tickets
              </Button>
              <Button variant="secondary" href="#phone" external block>
                Reserve a locker
              </Button>
              <div className="kbs-row">
                <Button variant="secondary" size="sm" href="#phone" external meta="@agape.nyc">
                  Instagram
                </Button>
                <Button variant="secondary" size="sm" href="#phone" external meta="@agapefestival">
                  Instagram
                </Button>
              </div>
              <Segmented label="Day (phone)" options={[{ value: "1", label: "Day 1" }, { value: "2", label: "Day 2" }]} value={day} onChange={setDay} block />
              <TabRail label="Ways to get here (phone demo)" items={MODES} value={mode} onChange={(m) => setMode(m)} idBase="kbs-route-phone" attached className="gh-tabs" />
              <Button variant="ghost" href="#phone" icon="arrow">
                View all
              </Button>
            </div>
          </Block>
        </div>
      </main>
      <div className="kbs-live">{routes}</div>
    </div>
  );
}
