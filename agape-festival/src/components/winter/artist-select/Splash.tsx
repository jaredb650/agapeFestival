"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import type { ArtistEntry } from "@/data/winter";
import { playWithRescue } from "@/components/winter/page/GestureRescue";
import { frameFor, frameSrc, IDLE_FRAME, isNamed, splashMedia } from "./roster";

interface SplashProps {
  /** The one act on screen (the preview, else the locked act). */
  entry: ArtistEntry;
  /** Slot order of `entry` (stable frame choice for the no-footage splash). */
  order: number;
  frameDir: string;
  near: boolean;
  /** Footage may load + play (near, on screen, no reduced motion, no sheet over it). */
  canPlay: boolean;
  reduced: boolean;
}

interface Layer {
  key: number;
  entry: ArtistEntry;
  order: number;
}

/** How long the outgoing layer stays under the incoming one (its fade-in is 0.45s). */
const OUT_MS = 500;

/**
 * The splash: one artist across the whole area above the grid. Their footage
 * or photo sits in the right half of the stage over a dim greyscale tower
 * still; acts without media get their own tower frame. A change crossfades:
 * the new layer fades in over the old one (opacity only), which is then dropped.
 * Decorative (aria-hidden): the name, day and bio live in <Profile>.
 */
export const Splash = memo(function Splash({ entry, order, frameDir, near, canPlay, reduced }: SplashProps) {
  // Layer stack: the newest is current; the previous one sits under it until the fade ends.
  const [stack, setStack] = useState<{ prev: ArtistEntry; n: number; layers: Layer[] }>(() => ({ prev: entry, n: 0, layers: [{ key: 0, entry, order }] }));
  if (entry !== stack.prev) {
    const n = stack.n + 1;
    setStack({ prev: entry, n, layers: [...stack.layers.slice(-1), { key: n, entry, order }] });
  }
  const { layers } = stack;
  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setStack((s) => ({ ...s, layers: s.layers.slice(-1) })), reduced ? 0 : OUT_MS);
    return () => clearTimeout(t);
  }, [layers, reduced]);

  return (
    <div className="asel-splash" aria-hidden="true">
      {layers.map((l, i) => (
        <SplashLayer
          key={l.key}
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
      <div className="asel-splash__shade" />
    </div>
  );
});

interface LayerProps {
  entry: ArtistEntry;
  order: number;
  current: boolean;
  entering: boolean;
  frameDir: string;
  near: boolean;
  canPlay: boolean;
  reduced: boolean;
}

function SplashLayer({ entry, order, current, entering, frameDir, near, canPlay, reduced }: LayerProps) {
  const media = splashMedia(entry);
  const kind = !isNamed(entry) ? "locked" : media ? "media" : "type";
  const frame = kind === "media" ? IDLE_FRAME : frameFor(entry, order);
  const focus = { "--focus": media?.focus ?? "50% 36%" } as CSSProperties;

  return (
    <div className="asel-layer" data-kind={kind} data-current={current || undefined} data-enter={entering || undefined} style={focus}>
      {near && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="asel-layer__frame" src={frameSrc(frameDir, frame)} alt="" width={720} height={1280} decoding="async" data-mirror={frame % 2 === 1 || undefined} />
      )}
      {kind === "media" && media && near && (
        <div className="asel-layer__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="asel-layer__poster" src={media.poster ?? media.src} alt="" decoding="async" />
          {media.kind === "video" && !reduced && <SplashVideo src={media.src} active={current && canPlay} />}
        </div>
      )}
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
