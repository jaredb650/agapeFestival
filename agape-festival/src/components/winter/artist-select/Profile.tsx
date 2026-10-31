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
  /** Desktop: the bio expands in place. Phones: "Read bio" opens the sheet. */
  wide: boolean;
  bioOpen: boolean;
  sheetOpen: boolean;
  lockedLabel: string;
  onToggleBio: () => void;
  onOpenSheet: () => void;
}

/**
 * The splash's readout, laid over its lower left: the day, the name (decoded
 * on change) and access to the bio. Real content, so it lives after the grid
 * in the DOM (Tab reaches it once an act is locked in) and is placed over the
 * splash by CSS grid.
 */
export const Profile = memo(function Profile({ id, entry, day, index, reduced, wide, bioOpen, sheetOpen, lockedLabel, onToggleBio, onOpenSheet }: ProfileProps) {
  const named = isNamed(entry) ? entry : null;
  const nameRef = useScramble<HTMLSpanElement>(named ? named.displayName : "", { disabled: reduced });
  const lw = named ? longestWord(named.displayName) : 7;
  const bioId = `${id}-bio`;

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

      {named?.bio ? (
        <>
          {wide && (
            <p id={bioId} className="asel-bio" data-open={bioOpen || undefined} tabIndex={bioOpen ? 0 : undefined}>
              {named.bio}
            </p>
          )}
          <div className="asel-actions">
            {wide ? (
              <button type="button" className="asel-link" data-bio-toggle="" aria-expanded={bioOpen} aria-controls={bioId} onClick={onToggleBio}>
                {bioOpen ? "Close bio" : "Read bio"} <span aria-hidden="true">{bioOpen ? "−" : "+"}</span>
              </button>
            ) : (
              <button type="button" className="asel-link" data-bio-toggle="" aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={onOpenSheet}>
                Read bio <span aria-hidden="true">+</span>
              </button>
            )}
            {named.socials?.map((s) => (
              <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.handle ?? s.platform} <span aria-hidden="true">↗︎</span>
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="asel-note">{named ? "Bio and footage coming soon." : "Not announced yet."}</p>
      )}
    </section>
  );
});
