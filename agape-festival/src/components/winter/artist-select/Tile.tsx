"use client";

import { memo, type CSSProperties, type Ref } from "react";
import { Redaction } from "@/components/winter/ui";
import { boxVars, SQUARE, toClipPath, toSvgPoints, type Box } from "./geometry";
import { isNamed, keyLabel, longestWord, monogram, type Slot } from "./roster";

interface TileProps {
  slot: Slot;
  /** Locked in (the splash shows this act when nothing is being previewed). */
  pressed: boolean;
  tabbable: boolean;
  panelId: string;
  lockedLabel: string;
  /** Stable per slug (parent caches it), so hover never re-renders the grid. */
  tileRef: Ref<HTMLButtonElement>;
  onHover: (slug: string) => void;
  onFocusTile: (slug: string) => void;
  onPress: (slug: string) => void;
}

const SQUARE_PTS = toSvgPoints(SQUARE);

/**
 * Hairline + ring drawn on the tile's own outline, outside the clipped button
 * (vector strokes, no filter). Two outlines: desktop shard and mobile square;
 * CSS shows one.
 */
function Edge({ poly }: { poly: string }) {
  return (
    <svg className="asel-tile__edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g className="asel-tile__shape asel-tile__shape--d">
        <polygon className="asel-tile__line" points={poly} />
        <polygon className="asel-tile__ring" points={poly} />
      </g>
      <g className="asel-tile__shape asel-tile__shape--m">
        <polygon className="asel-tile__line" points={SQUARE_PTS} />
        <polygon className="asel-tile__ring" points={SQUARE_PTS} />
      </g>
    </svg>
  );
}

export const Tile = memo(function Tile({ slot, pressed, tabbable, panelId, lockedLabel, tileRef, onHover, onFocusTile, onPress }: TileProps) {
  const { entry, day, index, box, cell } = slot;
  const named = isNamed(entry);
  const headshot = named ? entry.headshot : null;
  const label = named ? `${entry.name}, day ${day}` : `Unannounced, day ${day}: ${lockedLabel.toLowerCase()}`;
  // Each typographic tile shows a different crop of the tower still.
  const style = {
    ...boxVars(box),
    "--px": cell.x,
    "--py": cell.y,
    "--clip": toClipPath(box.poly),
    "--bgx": `${(index * 37 + day * 23) % 100}%`,
    "--bgy": `${18 + ((index * 53 + day * 11) % 64)}%`,
    // Longest word of the name: the label shrinks to fit single long words (ONLYNUMBERS).
    "--lw": named ? longestWord(entry.displayName) : 3,
  } as CSSProperties;

  return (
    <div className="asel-slot" style={style} data-day={day} data-kind={named ? (headshot ? "photo" : "type") : "locked"} data-pressed={pressed || undefined}>
      <button
        ref={tileRef}
        type="button"
        className="asel-tile"
        data-slug={entry.slug}
        tabIndex={tabbable ? 0 : -1}
        aria-pressed={pressed}
        aria-label={label}
        aria-controls={panelId}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover(entry.slug)}
        onFocus={() => onFocusTile(entry.slug)}
        onClick={() => onPress(entry.slug)}
      >
        <span className="asel-tile__media" aria-hidden="true">
          {headshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={headshot} alt="" width={600} height={600} loading="lazy" decoding="async" />
          ) : named ? (
            <span className="asel-tile__mono">{monogram(entry.displayName)}</span>
          ) : (
            <span className="asel-tile__vault">
              <Redaction length={3.4} seed={index * 7 + 3} label="" />
            </span>
          )}
        </span>
        <span className="asel-tile__shade" aria-hidden="true" />
        <span className="asel-tile__day" aria-hidden="true">
          D{day}
        </span>
        <span className="asel-tile__name" aria-hidden="true">
          {named ? keyLabel(entry.displayName) : "TBA"}
        </span>
      </button>
      <Edge poly={toSvgPoints(box.poly)} />
    </div>
  );
});

interface RandomProps {
  box: Box;
  tabbable: boolean;
  rolling: boolean;
  tileRef: Ref<HTMLButtonElement>;
  onFocusTile: () => void;
  onPress: () => void;
}

/** "?" wedge in the centre channel (desktop): rolls across the roster and locks someone in. */
export const RandomTile = memo(function RandomTile({ box, tabbable, rolling, tileRef, onFocusTile, onPress }: RandomProps) {
  const pts = toSvgPoints(box.poly);
  return (
    <div className="asel-slot asel-slot--random" style={{ ...boxVars(box), "--clip": toClipPath(box.poly) } as CSSProperties} data-rolling={rolling || undefined}>
      <button
        ref={tileRef}
        type="button"
        className="asel-tile asel-tile--random"
        data-slug="random"
        tabIndex={tabbable ? 0 : -1}
        aria-label="Random artist"
        aria-busy={rolling || undefined}
        onFocus={onFocusTile}
        onClick={onPress}
      >
        <span className="asel-random__q" aria-hidden="true">
          ?
        </span>
        <span className="asel-random__label" aria-hidden="true">
          Random
        </span>
      </button>
      <svg className="asel-tile__edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <g className="asel-tile__shape asel-tile__shape--d">
          <polygon className="asel-tile__line" points={pts} />
          <polygon className="asel-tile__ring" points={pts} />
        </g>
      </svg>
    </div>
  );
});
