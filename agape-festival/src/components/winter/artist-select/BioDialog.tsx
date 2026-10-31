"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import { ArrowRight, Cell, CloseIcon, Fill, LinkCell, Row } from "@/components/winter/grid";
import { WINTER } from "@/data/winter";
import { photoSet, type Act, type RosterDay } from "./acts";
import { unfoldClose, unfoldOpen, type Point } from "./unfold";

interface BioDialogProps {
  id: string;
  act: Act;
  day: RosterDay;
  open: boolean;
  /** Where the press landed on the feature row (null: keyboard). Read when the panel opens. */
  originRef: RefObject<Point | null>;
  /** The feature row's button: the panel unfolds out of it, folds back into it, and gets focus back. */
  anchorRef: RefObject<HTMLButtonElement | null>;
  reduced: boolean;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}

const seq = (k: number) => ({ "--k": k }) as CSSProperties;
const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
const columns = () => (window.matchMedia("(min-width: 768px)").matches ? 12 : 4);

/**
 * The bio: a modal <dialog> (focus trapped, page inert, Esc) holding a panel of grid cells that spans the
 * page between the frame lines, from under the nav bar to the bottom of the screen. A bar (position,
 * previous, next, close) over the name, day and bio, the photo beside them and the socials below.
 * The open/close choreography lives in unfold.ts; the phase is a data attribute (no React renders), and
 * the content's reveal is CSS keyed on it (roster.css). Reduced motion: it simply appears and goes.
 */
export function BioDialog({ id, act, day, open, originRef, anchorRef, reduced, onClose, onStep }: BioDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const anims = useRef<Animation[]>([]);
  // Latest values for the effects and native listeners below.
  const live = useRef({ open, reduced, onClose });
  useLayoutEffect(() => {
    live.current = { open, reduced, onClose };
  });

  const { artist } = act;
  const titleId = `${id}-name`;
  const photo = photoSet(artist);
  const socials = artist.socials ?? [];
  // What every act's panel can say for certain: the date, the venue, and that set times are not out yet.
  const facts = [
    { label: "Date", value: day.date },
    { label: "Venue", value: `${WINTER.venue.name}, ${WINTER.venue.city}` },
    { label: "Set time", value: "To be announced" },
  ];
  /** Cells in the facts line (3 of 12 columns each, 2 of 4 on phones). */
  const cells = facts.length + socials.length;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const fill = fillRef.current;
    const row = anchorRef.current?.getBoundingClientRect();
    if (!dialog || !panel || !fill) return;
    const parts = { panel, fill, edges: [...panel.querySelectorAll<HTMLElement>("[data-edge]")] };
    const settle = (list: Animation[], then: () => void) =>
      Promise.all(list.map((a) => a.finished))
        .then(then)
        .catch(() => {});

    if (open) {
      if (dialog.open) return;
      // Set before showModal, so the very first painted frame is already the unfold's first frame.
      dialog.dataset.phase = "opening";
      document.documentElement.classList.add("rs-lock");
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
      if (live.current.reduced || !row) {
        dialog.dataset.phase = "open";
        return;
      }
      const list = unfoldOpen(parts, row, originRef.current, columns());
      anims.current = list;
      settle(list, () => {
        if (dialog.dataset.phase !== "opening") return;
        dialog.dataset.phase = "open";
        list.forEach((a) => a.cancel());
      });
    } else if (dialog.open) {
      if (live.current.reduced || !row) {
        dialog.close();
        return;
      }
      dialog.dataset.phase = "closing";
      const list = unfoldClose(parts, row, anims.current);
      anims.current = list;
      settle(list, () => dialog.dataset.phase === "closing" && dialog.close());
    }
  }, [open, anchorRef, originRef]);

  // Native events: Esc plays the fold instead of the instant close; any close (ours or forced) cleans up.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      live.current.onClose();
    };
    const onClosed = () => {
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
      dialog.dataset.phase = "closed";
      document.documentElement.classList.remove("rs-lock");
      if (live.current.open) live.current.onClose();
      anchorRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClosed);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClosed);
      document.documentElement.classList.remove("rs-lock");
    };
  }, [anchorRef]);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onStep(e.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    // Tab cycles through the panel's controls. A native modal would let focus out to the browser's own
    // controls, and Safari's default sequence skips buttons; this order is the same everywhere.
    if (e.key !== "Tab") return;
    const nodes = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.getClientRects().length);
    if (!nodes.length) return;
    e.preventDefault();
    const at = nodes.indexOf(document.activeElement as HTMLElement);
    const next = at < 0 ? (e.shiftKey ? nodes.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
    nodes[next].focus();
  };

  return (
    <dialog ref={dialogRef} id={id} className="rs-dialog" data-phase="closed" aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <div className="rs-scrim" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="rs-panel">
        <div ref={fillRef} className="rs-panel__fill">
          <Row className="rs-bar">
            <Cell span={9} spanSm={2} y="center" className="rs-reveal" style={seq(0)}>
              <p className="w-small w-num rs-count" aria-live="polite">
                <span className="w-sr-only">{artist.name}, </span>
                <span className="rs-count__day">{day.label}</span> {act.index} of {act.total}
              </p>
            </Cell>
            {/* Previous and next share a cell: two columns from 768px, one (two halves) on phones. */}
            <Cell span={2} spanSm={1} pad="none" className="rs-steps">
              <button type="button" className="rs-btn rs-btn--prev" onClick={() => onStep(-1)} aria-label="Previous artist">
                <ArrowRight size={20} />
              </button>
              <button type="button" className="rs-btn" onClick={() => onStep(1)} aria-label="Next artist" data-roster-next="">
                <ArrowRight size={20} />
              </button>
            </Cell>
            <Cell span={1} spanSm={1} pad="none">
              <button ref={closeRef} type="button" className="rs-btn" onClick={onClose} aria-label="Close bio">
                <CloseIcon size={20} />
              </button>
            </Cell>
          </Row>

          <Row className="rs-body" close data-photo={photo ? "" : undefined}>
            <Cell key={artist.slug} span={photo ? 8 : 12} className="rs-text">
              <h3 id={titleId} className="w-display rs-reveal" style={seq(1)}>
                {artist.name}
              </h3>
              {artist.bio ? (
                <div className="rs-bio rs-reveal" style={seq(2)} tabIndex={0} aria-label={`${artist.name} bio`}>
                  <p className="w-body">{artist.bio}</p>
                </div>
              ) : (
                <p className="w-body rs-tba rs-reveal" style={seq(2)}>
                  Bio to be announced
                </p>
              )}
            </Cell>
            {photo && (
              <Cell key={`photo-${artist.slug}`} span={4} pad="none" className="rs-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 768px) 34vw, 100vw" alt={artist.name} decoding="async" />
              </Cell>
            )}
            {facts.map((f) => (
              <Cell key={f.label} span={3} spanSm={2} h={2} y="end" className="rs-fact rs-reveal" style={seq(3)}>
                <p className="w-small">{f.label}</p>
                <p className="rs-fact__value">{f.value}</p>
              </Cell>
            ))}
            {socials.map((s) => (
              <LinkCell key={s.url} href={s.url} external span={3} spanSm={2} h={2} label={s.platform} className="rs-fact rs-reveal" style={seq(3)}>
                {s.handle ?? s.platform}
              </LinkCell>
            ))}
            <Fill md={(12 - (cells * 3) % 12) % 12} sm={(4 - (cells * 2) % 4) % 4} />
          </Row>
        </div>
        <span className="rs-edge" data-edge="t" aria-hidden="true" />
        <span className="rs-edge" data-edge="r" aria-hidden="true" />
        <span className="rs-edge" data-edge="b" aria-hidden="true" />
        <span className="rs-edge" data-edge="l" aria-hidden="true" />
      </div>
    </dialog>
  );
}
