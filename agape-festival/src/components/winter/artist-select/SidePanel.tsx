"use client";

import { memo, type CSSProperties } from "react";
import { GlassWindow, Redaction } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { useScramble } from "./hooks";
import { Lcd, Orb } from "./Lcd";
import { isNamed, lcdDate, pad2, type Wing } from "./roster";

interface Img {
  src: string;
  width: number;
  height: number;
}

interface SidePanelProps {
  id: string;
  day: DayNumber;
  info: WinterDay;
  wing: Wing;
  entry: ArtistEntry | null;
  /** 1-based slot index of `entry`, 0 when idle. */
  index: number;
  /** This side was touched last (lit LED, mobile: the visible panel). */
  active: boolean;
  reduced: boolean;
  bioOpen: boolean;
  dayLabel: Img;
  pending: { bio: string; locked: string };
  onStep: (day: DayNumber, dir: -1 | 1) => void;
  onToggleBio: (day: DayNumber) => void;
}

const longestWord = (s: string) => Math.max(...s.split(/\s+/).map((w) => w.length));

/** One side's readout: HUD header, the big name band, and the skinned bio window with LCD + orb pager. */
export const SidePanel = memo(function SidePanel({ id, day, info, wing, entry, index, active, reduced, bioOpen, dayLabel, pending, onStep, onToggleBio }: SidePanelProps) {
  const named = entry && isNamed(entry) ? entry : null;
  const locked = !!entry && !named;
  const idle = !entry;
  const date = lcdDate(info.isoDate);
  const dd = pad2(day);

  const bandText = named ? named.displayName : locked ? pending.locked : info.weekday.toUpperCase();
  const nameRef = useScramble<HTMLSpanElement>(bandText, { disabled: reduced });
  const lw = named ? longestWord(named.displayName) : locked ? 8 : longestWord(bandText);

  const status = idle ? "STATUS: AWAITING INPUT" : locked ? "STATUS: ENCRYPTED" : "STATUS: CONFIRMED";
  const lcdRef = useScramble<HTMLSpanElement>(status, { disabled: reduced, ms: 360 });
  const footage = named ? (named.clip ? "FOOTAGE: ONLINE" : "FOOTAGE: INCOMING") : locked ? "IDENTITY: [REDACTED]" : wing.locked ? `${pad2(wing.named)} CONFIRMED + ${pad2(wing.locked)} LOCKED` : `${pad2(wing.named)} CONFIRMED`;
  const intel = named ? (named.bio ? "INTEL: ON FILE" : "INTEL: PENDING") : null;

  const title = named ? `:: ${named.displayName} ::` : locked ? ":: ENCRYPTED ::" : `:: DAY ${dd} STANDBY ::`;
  const total = wing.slots.length;

  return (
    <section id={id} className="asel-side" data-day={day} data-state={idle ? "idle" : locked ? "locked" : "named"} data-active={active || undefined} aria-labelledby={`${id}-name`}>
      {/* Player banner: the day's colour plate (P1 blue / P2 red) with the flyer's hand-scrawled DAY label. */}
      <header className="asel-side__hud">
        <span className="asel-dayplate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="asel-dayplate__scrawl" src={dayLabel.src} width={dayLabel.width} height={dayLabel.height} alt={`Day ${day}`} loading="lazy" decoding="async" />
        </span>
        <span className="asel-side__meta">
          <span className="asel-side__date">
            {info.weekday.slice(0, 3).toUpperCase()} {date}
          </span>
          <span className="asel-side__count">
            {pad2(wing.named)} confirmed{wing.locked ? ` + ${pad2(wing.locked)} locked` : ""}
          </span>
        </span>
        <span className="asel-side__rule" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </header>

      <h3 id={`${id}-name`} className="asel-name" data-idle={idle || undefined} style={{ "--lw": lw } as CSSProperties}>
        <span className="w-sr-only">{named ? `${named.name}, day ${day}` : locked ? `Locked slot, day ${day}: ${pending.locked.toLowerCase()}` : `Day ${day}, ${info.dateLong}`}</span>
        <span className="asel-name__text" aria-hidden="true">
          {locked ? (
            <Redaction length={4.6} seed={index * 11 + 5} label="" className="asel-name__blob" />
          ) : (
            <span ref={nameRef}>{bandText}</span>
          )}
        </span>
      </h3>

      <GlassWindow
        as="div"
        skin="chrome"
        active={active}
        className="asel-window"
        title={title}
        meta={`DAY ${dd}`}
        aria-label={`Day ${day} artist readout`}
        status={
          <>
            <span className="asel-pager__orbs" aria-hidden="true">
              {wing.slots.map((s) => (
                <Orb key={s.entry.slug} size="sm" lit={s.index === index} locked={!isNamed(s.entry)} />
              ))}
            </span>
            <span className="asel-pager__count" aria-hidden="true">
              {pad2(index)}/{pad2(total)}
            </span>
            <span className="asel-pager__nav">
              <button type="button" className="asel-pager__btn" onClick={() => onStep(day, -1)} aria-label={`Previous day ${day} artist`}>
                &lt;
              </button>
              <button type="button" className="asel-pager__btn" onClick={() => onStep(day, 1)} aria-label={`Next day ${day} artist`}>
                &gt;
              </button>
            </span>
          </>
        }
      >
        <Lcd
          className="asel-window__lcd"
          rows={[
            <>
              DAY {dd} <i>/</i> STAGE 01 <i>/</i> <span ref={lcdRef}>{status}</span>
            </>,
            <>
              {footage}
              {intel && (
                <>
                  {" "}
                  <i>/</i> {intel}
                </>
              )}
            </>,
          ]}
        />
        {named?.bio ? (
          <>
            <p id={`${id}-bio`} className="asel-window__bio" data-open={bioOpen || undefined} tabIndex={bioOpen ? 0 : undefined}>
              {named.bio}
            </p>
            <div className="asel-window__actions">
              <button type="button" className="asel-link" aria-expanded={bioOpen} aria-controls={`${id}-bio`} onClick={() => onToggleBio(day)}>
                {bioOpen ? "Less intel" : "Full bio"} <span aria-hidden="true">{bioOpen ? "−" : "+"}</span>
              </button>
              {named.socials?.map((s) => (
                <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle ?? s.platform} <span aria-hidden="true">↗︎</span>
                </a>
              ))}
            </div>
          </>
        ) : named ? (
          <p className="asel-window__note">
            <b>{pending.bio}</b> Photo, footage and bio are on the way.
          </p>
        ) : locked ? (
          <p className="asel-window__note">
            <b>{pending.locked}</b> This act hasn&rsquo;t been announced yet.
          </p>
        ) : (
          <p className="asel-window__note">
            <b>{info.dateLong}</b> Hover or tap a Day {day} tile to load an artist profile.
          </p>
        )}
      </GlassWindow>
    </section>
  );
});
