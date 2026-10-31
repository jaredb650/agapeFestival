"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { GlassWindow, Redaction } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber, WinterDay } from "@/data/winter";
import { Lcd, Orb } from "./Lcd";
import { isNamed, lcdDate, pad2, type Wing } from "./roster";

interface BioSheetProps {
  open: boolean;
  day: DayNumber;
  info: WinterDay;
  wing: Wing;
  entry: ArtistEntry | null;
  /** 1-based slot index of `entry`, 0 when idle. */
  index: number;
  pending: { bio: string; locked: string };
  onClose: () => void;
  onStep: (day: DayNumber, dir: -1 | 1) => void;
}

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Phones: the full profile, popped over the PDA in GlassWindow chrome.
 * Modal while open (focus moves in, Tab wraps, Escape / ✕ / the scrim close,
 * the parent returns focus to the footage). Unfolds with transform/opacity only.
 */
export function BioSheet({ open, day, info, wing, entry, index, pending, onClose, onStep }: BioSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const named = entry && isNamed(entry) ? entry : null;
  const locked = !!entry && !named;
  const dd = pad2(day);
  const titleId = `asel-sheet-${day}-title`;

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  // A long bio scrolls inside the sheet (never the page). While more text sits below the fold
  // the body fades out at the bottom and a MORE cue shows, so it never reads as cut off.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!open || !el) return;
    el.scrollTop = 0;
    const sync = () => {
      el.toggleAttribute("data-more", el.scrollTop + el.clientHeight < el.scrollHeight - 4);
      el.toggleAttribute("data-up", el.scrollTop > 2);
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [open, entry]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = [...(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((n) => n.getClientRects().length);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const status = !entry ? "AWAITING INPUT" : locked ? "ENCRYPTED" : "CONFIRMED";
  const footage = named ? (named.clip ? "FOOTAGE: ONLINE" : "FOOTAGE: INCOMING") : locked ? "IDENTITY: [REDACTED]" : "";
  const intel = named ? (named.bio ? "INTEL: ON FILE" : "INTEL: PENDING") : "";

  return (
    <div ref={rootRef} className="asel-sheet" data-day={day} hidden={!open} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <button type="button" className="asel-sheet__scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />
      <GlassWindow
        as="div"
        skin="chrome"
        active
        controls={false}
        className="asel-sheet__win"
        title={named ? `:: ${named.displayName} ::` : locked ? ":: ENCRYPTED ::" : `:: DAY ${dd} ::`}
        meta={
          <>
            <span className="asel-sheet__meta">DAY {dd}</span>
            <button ref={closeRef} type="button" className="asel-sheet__close" onClick={onClose} aria-label="Close profile">
              <span aria-hidden="true">✕</span>
            </button>
          </>
        }
        status={
          <>
            <span className="asel-pager__orbs" aria-hidden="true">
              {wing.slots.map((s) => (
                <Orb key={s.entry.slug} size="sm" lit={s.index === index} locked={!isNamed(s.entry)} />
              ))}
            </span>
            <span className="asel-pager__count" aria-hidden="true">
              {pad2(index)}/{pad2(wing.slots.length)}
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
        <h3 id={titleId} className="asel-sheet__name">
          {named ? named.displayName : locked ? <Redaction length={4.6} seed={index * 11 + 5} label={pending.locked} /> : `Day ${day}`}
        </h3>
        <Lcd
          className="asel-window__lcd"
          rows={[
            <>
              DAY {dd} <i>/</i> {lcdDate(info.isoDate)} <i>/</i> {status}
            </>,
            <>
              {footage || `${pad2(wing.named)} CONFIRMED`}
              {intel && (
                <>
                  {" "}
                  <i>/</i> {intel}
                </>
              )}
            </>,
          ]}
        />
        <div className="asel-sheet__scroll">
          <div ref={bodyRef} className="asel-sheet__body" tabIndex={named?.bio ? 0 : undefined}>
            {named?.bio ? (
              <p className="asel-sheet__bio">{named.bio}</p>
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
                <b>{info.dateLong}</b> Tap a Day {day} key to load an artist.
              </p>
            )}
          </div>
          <span className="asel-sheet__more" aria-hidden="true">
            More <b>▾</b>
          </span>
        </div>
        {!!named?.socials?.length && (
          <div className="asel-window__actions">
            {named.socials.map((s) => (
              <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.handle ?? s.platform} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </GlassWindow>
    </div>
  );
}
