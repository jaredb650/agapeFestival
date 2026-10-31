"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { GLITCH_EVENT, GlitchLayer, Redaction } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber } from "@/data/winter";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { useScramble } from "./hooks";
import { frameFor, frameSrc, IDLE_FRAME, isNamed, pad2, splashMedia } from "./roster";

interface SplashProps {
  day: DayNumber;
  entry: ArtistEntry | null;
  /** Slot order of `entry` (stable frame choice for the no-footage splash). */
  order: number;
  /** Bumps on every pick/lock on this side: replays the swap FX. */
  swapId: number;
  frameDir: string;
  near: boolean;
  /** Footage may load + play (near, on screen, visible layout, no reduced motion). */
  canPlay: boolean;
  reduced: boolean;
  /** LCD date, "02.19.27". */
  date: string;
  /** Mobile: the single visible splash. */
  shown: boolean;
  /** Stacked (mobile) layout: the HUD overlay is live. */
  mobile: boolean;
}

interface Layer {
  key: number;
  entry: ArtistEntry | null;
  order: number;
}

const OUT_MS = 720;

/** One side's splash: idle tower → footage / still / typographic / encrypted, crossfaded with a swap FX. */
export const Splash = memo(function Splash({ day, entry, order, swapId, frameDir, near, canPlay, reduced, date, shown, mobile }: SplashProps) {
  const named = entry && isNamed(entry) ? entry : null;
  const dd = pad2(day);
  // Mobile overlay copy (the desktop name band lives in SidePanel).
  const hudName = named ? named.displayName : entry ? "████████" : `DAY ${dd}`;
  const hudStatus = !entry ? "STANDBY" : named ? (named.clip ? "FOOTAGE: ONLINE" : "FOOTAGE INCOMING") : "SIGNAL ENCRYPTED";
  const hudLcd = `${date} / ${!entry ? "TAP AN ARTIST BELOW" : named ? "CONFIRMED" : "ENCRYPTED"}`;
  const nameRef = useScramble<HTMLSpanElement>(hudName, { disabled: reduced || !shown || !mobile });

  // Layer stack: the newest is current, the previous one plays its exit and is dropped.
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, entry, order }]);
  const [prev, setPrev] = useState(entry);
  if (entry !== prev) {
    setPrev(entry);
    setLayers((ls) => [...ls.slice(-1), { key: swapId, entry, order }]);
  }
  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setLayers((ls) => ls.slice(-1)), reduced ? 0 : OUT_MS);
    return () => clearTimeout(t);
  }, [layers, reduced]);

  return (
    <div className="asel-half" data-day={day} data-shown={shown || undefined} aria-hidden="true">
      <div className="asel-half__inner">
        {layers.map((l, i) => (
          <SplashLayer
            key={l.key}
            day={day}
            entry={l.entry}
            order={l.order}
            current={i === layers.length - 1}
            entering={layers.length > 1 && i === layers.length - 1 && !reduced}
            frameDir={frameDir}
            near={near}
            canPlay={canPlay}
            reduced={reduced}
          />
        ))}
        <div className="asel-half__shade" />
        {swapId > 0 && !reduced && <SwapFx key={swapId} />}
      </div>
      <div className="asel-half__hud">
        <span className="asel-half__chips">
          <span className="asel-half__day">DAY {dd}</span>
          <span className="asel-half__status">{hudStatus}</span>
        </span>
        <span className="asel-half__name" data-idle={!entry || undefined}>
          <span ref={nameRef}>{hudName}</span>
        </span>
        <span className="asel-half__lcd">{hudLcd}</span>
      </div>
    </div>
  );
});

/** Shutter + scan band + slice bars, mounted once per swap (CSS keyframes, transform/opacity only). */
function SwapFx() {
  return (
    <div className="asel-fx">
      <span className="asel-fx__shutter asel-fx__shutter--a" />
      <span className="asel-fx__shutter asel-fx__shutter--b" />
      <span className="asel-fx__band" />
      <span className="asel-fx__slice asel-fx__slice--1" />
      <span className="asel-fx__slice asel-fx__slice--2" />
      <span className="asel-fx__slice asel-fx__slice--3" />
      <span className="asel-fx__flash" />
    </div>
  );
}

interface LayerProps {
  day: DayNumber;
  entry: ArtistEntry | null;
  order: number;
  current: boolean;
  entering: boolean;
  frameDir: string;
  near: boolean;
  canPlay: boolean;
  reduced: boolean;
}

function SplashLayer({ day, entry, order, current, entering, frameDir, near, canPlay, reduced }: LayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const media = splashMedia(entry);
  const kind = !entry ? "idle" : !isNamed(entry) ? "locked" : media ? "media" : "type";

  // Fire the kit glitch on the typographic layer as it lands.
  useEffect(() => {
    if (!entering) return;
    const t = setTimeout(() => root.current?.querySelector(".w-glitch")?.dispatchEvent(new Event(GLITCH_EVENT)), 120);
    return () => clearTimeout(t);
  }, [entering]);

  const frame = kind === "idle" ? IDLE_FRAME : entry ? frameFor(entry, order) : IDLE_FRAME;
  const focus = { "--focus": media?.focus ?? "50% 30%" } as CSSProperties;

  return (
    <div ref={root} className="asel-layer" data-kind={kind} data-current={current || undefined} data-enter={entering || undefined} style={focus}>
      {kind !== "media" && near && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="asel-layer__frame" src={frameSrc(frameDir, frame)} alt="" width={720} height={1280} decoding="async" data-mirror={(kind === "idle" ? day === 2 : frame % 2 === 1) || undefined} />
      )}

      {kind === "media" && media && near && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="asel-layer__frame asel-layer__frame--dim" src={frameSrc(frameDir, IDLE_FRAME)} alt="" width={720} height={1280} decoding="async" data-mirror={day === 2 || undefined} />
          <div className="asel-layer__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="asel-layer__poster" src={media.poster ?? media.src} alt="" decoding="async" />
            {media.kind === "video" && !reduced && <SplashVideo src={media.src} active={current && canPlay} />}
            <span className="asel-layer__tone" />
            <Viewfinder />
          </div>
        </>
      )}

      {kind === "type" && entry && (
        <>
          <GlitchLayer interactive={false} intensity="strong" className="asel-layer__type" as="div">
            <TypeRows name={entry.displayName} />
          </GlitchLayer>
          <Reticle label="Footage incoming" />
        </>
      )}

      {kind === "locked" && entry && (
        <>
          <div className="asel-layer__vault">
            {[0, 1, 2].map((i) => (
              <span key={i} className="asel-layer__blob" style={{ "--i": i } as CSSProperties}>
                <Redaction length={[9.5, 6.8, 8.2][i]} seed={entry.slug.length * 13 + i * 7} label="" />
              </span>
            ))}
          </div>
          <Reticle label="Signal encrypted" locked />
        </>
      )}

      {kind === "idle" && <Reticle label="Standby" idle />}
    </div>
  );
}

/** The name, set huge and cropped: alternating solid / outline rows, each offset. */
function TypeRows({ name }: { name: string }) {
  return (
    <div className="asel-typerows">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="asel-typerows__row" data-outline={i % 2 === 1 || undefined} style={{ "--i": i } as CSSProperties}>
          {name}
        </span>
      ))}
    </div>
  );
}

/** Targeting ring over the no-footage splash (inspo-1's crosshair circles). */
function Reticle({ label, locked, idle }: { label: string; locked?: boolean; idle?: boolean }) {
  return (
    <div className="asel-reticle" data-locked={locked || undefined} data-idle={idle || undefined}>
      <svg viewBox="0 0 200 200" focusable="false">
        <circle cx="100" cy="100" r="78" className="asel-reticle__ring" />
        <circle cx="100" cy="100" r="58" className="asel-reticle__ring asel-reticle__ring--dash" />
        <circle cx="100" cy="100" r="3" className="asel-reticle__dot" />
        <path d="M100 6v30M100 164v30M6 100h30M164 100h30" className="asel-reticle__cross" />
        <path d="M100 22v6M100 172v6M22 100h6M172 100h6" className="asel-reticle__tick" transform="rotate(45 100 100)" />
      </svg>
      <span className="asel-reticle__label">{label}</span>
    </div>
  );
}

/** Camera viewfinder corners + REC tag over live footage. */
function Viewfinder() {
  return (
    <div className="asel-viewfinder">
      <i />
      <i />
      <i />
      <i />
      <span className="asel-reticle__label asel-viewfinder__tag">Footage online</span>
    </div>
  );
}

/**
 * The splash clip: mounted only after ~140ms of intent on a current layer,
 * preload none, fades in once actually playing (poster stays underneath),
 * paused when inactive and unloaded on unmount.
 */
function SplashVideo({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active || armed) return;
    const t = setTimeout(() => setArmed(true), 140);
    return () => clearTimeout(t);
  }, [active, armed]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !armed) return;
    if (active) playWithRescue(v);
    else v.pause();
  }, [armed, active]);

  useEffect(() => {
    if (!armed) return;
    const v = ref.current;
    return () => {
      if (!v) return;
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, [armed]);

  if (!armed) return null;
  return (
    <video
      ref={ref}
      className="asel-layer__video"
      data-playing={playing || undefined}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => setPlaying(false)}
    />
  );
}
