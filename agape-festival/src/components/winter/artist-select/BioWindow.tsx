"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Redaction } from "@/components/winter/ui";
import type { ArtistEntry, DayNumber } from "@/data/winter";
import { isNamed, pad2, type Wing } from "./roster";

interface BioWindowProps {
  id: string;
  open: boolean;
  /** The locked act. */
  entry: ArtistEntry;
  day: DayNumber;
  /** 1-based slot index of `entry` within its day. */
  index: number;
  /** That day's slots (the dot pager). */
  wing: Wing;
  /** Desktop: a window rising from the banner (non-modal). Phones: a modal window over the roster. */
  wide: boolean;
  reduced: boolean;
  lockedLabel: string;
  frameRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}

type Phase = "open" | "closing" | "closed";

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
/** The fold-away on close (mirrors asel-fold in artist-select.css). */
const CLOSE_MS = 220;

/**
 * The profile window (the old roster's bio window, re-skinned): a flat title
 * bar with a red LED, DAY 0N and a ✕ block; the big name; the bio; a status
 * strip with the day's dot pager, NN/NN and ‹ ›. It opens with the old
 * CRT-style unfold (a thin bar that widens, then grows to full height) and
 * folds away on close; transform/opacity only, a plain fade under reduced
 * motion. Desktop: it rises from the bottom of the banner up to the title.
 * Phones: a modal window over the whole roster (focus trapped).
 */
export function BioWindow({ id, open, entry, day, index, wing, wide, reduced, lockedLabel, frameRef, onClose, onStep }: BioWindowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const named = isNamed(entry) ? entry : null;
  const titleId = `${id}-title`;

  // open → "open"; close → "closing" (the fold plays) → "closed" (hidden).
  const [phase, setPhase] = useState<Phase>(open ? "open" : "closed");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setPhase(open ? "open" : reduced ? "closed" : "closing");
  }
  useEffect(() => {
    if (phase !== "closing") return;
    const t = setTimeout(() => setPhase("closed"), CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase]);

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
  }, [open, entry]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    // Phones: modal, so Tab wraps inside the window.
    if (wide || e.key !== "Tab") return;
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
    <div
      ref={rootRef}
      id={id}
      className="asel-win"
      data-phase={phase}
      data-day={day}
      hidden={phase === "closed"}
      role="dialog"
      aria-modal={wide ? undefined : true}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
    >
      {!wide && <button type="button" className="asel-win__scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />}
      <div ref={frameRef} className="asel-win__frame">
        <div className="asel-win__bar">
          <span className="asel-win__led" aria-hidden="true" />
          <span className="asel-win__title" aria-hidden="true">
            Profile
          </span>
          <span className="asel-win__meta">Day {pad2(day)}</span>
          <button ref={closeRef} type="button" className="asel-win__close" onClick={onClose} aria-label="Close profile">
            <span aria-hidden="true">✕&#xFE0E;</span>
          </button>
        </div>

        <div className="asel-win__body" key={entry.slug}>
          <h3 id={titleId} className="asel-win__name">
            {named ? named.displayName : <Redaction length={4.2} seed={index * 11 + 5} label={lockedLabel} className="asel-win__blob" />}
          </h3>
          <div ref={bodyRef} className="asel-win__scroll" tabIndex={named?.bio ? 0 : undefined}>
            {named?.bio ? <p className="asel-win__bio">{named.bio}</p> : <p className="asel-win__note">{named ? "Bio and footage coming soon." : "This act hasn’t been announced yet."}</p>}
          </div>
          {!!named?.socials?.length && (
            <div className="asel-actions">
              {named.socials.map((s) => (
                <a key={s.url} className="asel-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle ?? s.platform} <span aria-hidden="true">↗︎</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="asel-win__status">
          <span className="asel-win__dots" aria-hidden="true">
            {wing.slots.map((s) => (
              <i key={s.entry.slug} data-lit={s.index === index || undefined} data-locked={!isNamed(s.entry) || undefined} />
            ))}
          </span>
          <span className="asel-win__count" aria-hidden="true">
            {pad2(index)}/{pad2(wing.slots.length)}
          </span>
          <span className="asel-win__nav">
            <button type="button" className="asel-win__step" onClick={() => onStep(-1)} aria-label={`Previous Day ${day} artist`}>
              &lt;
            </button>
            <button type="button" className="asel-win__step" onClick={() => onStep(1)} aria-label={`Next Day ${day} artist`}>
              &gt;
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
