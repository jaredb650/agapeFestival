"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import type { DayNumber, NamedArtist } from "@/data/winter";

interface BioSheetProps {
  open: boolean;
  day: DayNumber;
  /** Only acts with a bio open the sheet. */
  artist: NamedArtist | null;
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Phones: the full bio over the roster, a flat black panel with corner ticks.
 * Modal while open (focus moves in, Tab wraps, Escape / Close / the scrim
 * close, the parent returns focus to the "Read bio" button). The bio scrolls
 * inside the panel, never the page. Fades in with transform/opacity only.
 */
export function BioSheet({ open, day, artist, onClose }: BioSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = "asel-sheet-title";

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  // While more text sits below the fold, the body fades out at the bottom so it never reads as cut off.
  useEffect(() => {
    const el = bodyRef.current;
    if (!open || !el) return;
    el.scrollTop = 0;
    const sync = () => el.toggleAttribute("data-more", el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [open, artist]);

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

  return (
    <div ref={rootRef} className="asel-sheet" data-day={day} hidden={!open || !artist} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <button type="button" className="asel-sheet__scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />
      <div className="asel-sheet__panel">
        <div className="asel-sheet__bar">
          <p className="asel-day">
            <i aria-hidden="true" />
            Day {day}
          </p>
          <button ref={closeRef} type="button" className="asel-sheet__close" onClick={onClose}>
            Close <span aria-hidden="true">✕&#xFE0E;</span>
          </button>
        </div>
        <h3 id={titleId} className="asel-sheet__name">
          {artist?.displayName}
        </h3>
        <div ref={bodyRef} className="asel-sheet__body" tabIndex={0}>
          <p className="asel-sheet__bio">{artist?.bio}</p>
        </div>
        {!!artist?.socials?.length && (
          <div className="asel-actions">
            {artist.socials.map((s) => (
              <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.handle ?? s.platform} <span aria-hidden="true">↗︎</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
