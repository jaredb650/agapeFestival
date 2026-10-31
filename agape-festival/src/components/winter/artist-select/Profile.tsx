"use client";

import { memo, type CSSProperties } from "react";
import { Redaction } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber } from "@/data/winter";
import { useScramble } from "./hooks";
import { isNamed, longestWord } from "./roster";

interface ProfileProps {
  id: string;
  entry: ArtistEntry;
  day: DayNumber;
  /** Slot index of `entry` (redaction blob shape). */
  index: number;
  reduced: boolean;
  /** Desktop shows a two-line bio teaser. */
  wide: boolean;
  /** The profile window is open (the chip's aria-expanded). */
  open: boolean;
  windowId: string;
  lockedLabel: string;
  onToggle: (e: { currentTarget: HTMLElement }) => void;
}

/**
 * The splash's readout, laid over its lower left: the day, the name (decoded
 * on change), a bio teaser on desktop, the PROFILE ▸ chip (the old roster's
 * cue) and socials. The whole banner opens the profile window too; this chip
 * is the visible, keyboard-reachable trigger. It lives after the grid in the
 * DOM and is placed over the splash by CSS grid.
 */
export const Profile = memo(function Profile({ id, entry, day, index, reduced, wide, open, windowId, lockedLabel, onToggle }: ProfileProps) {
  const named = isNamed(entry) ? entry : null;
  const nameRef = useScramble<HTMLSpanElement>(named ? named.displayName : "", { disabled: reduced });
  const lw = named ? longestWord(named.displayName) : 7;

  return (
    <section id={id} className="asel-profile" data-day={day} data-state={named ? "named" : "locked"} aria-labelledby={`${id}-name`}>
      <p className="asel-day">
        <i aria-hidden="true" />
        Day {day}
      </p>
      <h3 id={`${id}-name`} className="asel-name" style={{ "--lw": lw } as CSSProperties}>
        <span className="w-sr-only">{named ? named.name : `Unannounced act, ${lockedLabel.toLowerCase()}`}</span>
        <span className="asel-name__text" aria-hidden="true">
          {named ? <span ref={nameRef}>{named.displayName}</span> : <Redaction length={4.2} seed={index * 11 + 5} label="" className="asel-name__blob" />}
        </span>
      </h3>
      {named?.bio ? wide && <p className="asel-bio">{named.bio}</p> : <p className="asel-note">{named ? "Bio and footage coming soon." : "Not announced yet."}</p>}
      <div className="asel-actions">
        <button type="button" className="asel-chip" data-bio-trigger="" aria-haspopup="dialog" aria-expanded={open} aria-controls={windowId} onClick={onToggle}>
          Profile <b aria-hidden="true">▸&#xFE0E;</b>
        </button>
        {named?.socials?.map((s) => (
          <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
            {s.handle ?? s.platform} <span aria-hidden="true">↗︎</span>
          </a>
        ))}
      </div>
    </section>
  );
});
