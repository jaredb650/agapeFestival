"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { Cell, Fill, LinkCell, Row } from "@/components/winter/grid";
import { CloseIcon } from "@/components/winter/grid/icons";
import type { NavLink } from "./sections";

export type MenuPhase = "closed" | "opening" | "open" | "closing";

// Choreography lengths (nav.css): the panel drops in 240ms; the rows wipe in 240ms each, 40ms apart,
// from 80ms. The close is the panel lifting (240ms).
const ROW_START = 80;
const STAGGER = 40;
const WIPE = 240;
const CLOSE_MS = 240;
const RM_MS = 160;
const DESKTOP = "(min-width: 1100px)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Menu state machine around a native modal <dialog> (focus trap, inert page, Esc).
 * opening → open runs the reveal; closing plays the lift before dialog.close().
 * Scroll is locked on <html> while the dialog is up; focus returns to the menu
 * button, or moves to the chosen section after a link.
 */
export function useMenu(buttonRef: RefObject<HTMLButtonElement | null>) {
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const phaseRef = useRef<MenuPhase>("closed");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const after = useRef<(() => void) | null>(null);

  const go = useCallback((p: MenuPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || phaseRef.current !== "closed") return;
    after.current = null;
    document.documentElement.classList.add("wnav-lock");
    // Set before showModal so the very first painted frame is already the reveal's first frame.
    dialog.dataset.phase = "opening";
    dialog.showModal();
    dialog.querySelector<HTMLElement>(".wmenu__close")?.focus({ preventScroll: true });
    go("opening");
    clearTimeout(timer.current);
    const rows = dialog.querySelectorAll(".wmenu__seq").length;
    timer.current = setTimeout(() => go("open"), reduced() ? RM_MS : ROW_START + rows * STAGGER + WIPE);
  }, [go]);

  /** Lift away, then close. `then` runs after the dialog is gone (e.g. jump to a section). */
  const close = useCallback(
    (then?: () => void) => {
      const dialog = dialogRef.current;
      if (!dialog || phaseRef.current === "closed" || phaseRef.current === "closing") return;
      after.current = then ?? null;
      go("closing");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => dialog.close(), reduced() ? RM_MS : CLOSE_MS);
    },
    [go],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Esc: play the lift instead of the instant native close.
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    // Fires for our timed close and for any forced close (e.g. a second Esc).
    const onClose = () => {
      clearTimeout(timer.current);
      document.documentElement.classList.remove("wnav-lock");
      go("closed");
      const then = after.current;
      after.current = null;
      if (then) then();
      else buttonRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    // Grew into the desktop bar while open: the menu button is gone, so just close.
    const mq = window.matchMedia(DESKTOP);
    const onMq = () => mq.matches && dialog.open && dialog.close();
    mq.addEventListener("change", onMq);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
      mq.removeEventListener("change", onMq);
      clearTimeout(timer.current);
      document.documentElement.classList.remove("wnav-lock");
    };
  }, [buttonRef, close, go]);

  return { phase, open, close, dialogRef };
}

export type MenuApi = ReturnType<typeof useMenu>;

interface MenuDialogProps {
  menu: MenuApi;
  /** Bar links (sentence case, no Top). */
  links: NavLink[];
  /** Id of the current section, if known. */
  active: string | null;
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
}

/** Jump to an in-page section after the menu is gone, then hand it focus. */
function jumpTo(href: string) {
  const el = document.getElementById(href.slice(1));
  if (!el) return;
  if (location.hash === href) el.scrollIntoView();
  else location.hash = href;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * The menu below 1100px: a full-screen grid of cells. The head row redraws the bar (wordmark + close),
 * one cell per section (two columns from 768px), then the red ticket cell and the socials. Opening drops
 * the panel from the bar and wipes each row in from the left, 40ms apart (clip-path on rectangles, so
 * the hairlines draw in with them); closing lifts the panel. No readouts, no decorative text.
 */
export function MenuDialog({ menu, links, active, ticketsUrl, ticketsLabel, mark, socials }: MenuDialogProps) {
  const { phase, close, dialogRef } = menu;
  /** Position in the reveal sequence (nav.css staggers on it). */
  const seq = (i: number) => ({ "--k": i }) as CSSProperties;

  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    close(() => jumpTo(href));
  };

  const odd = links.length % 2;

  return (
    <dialog
      id="wnav-menu"
      ref={dialogRef}
      className="wmenu"
      data-phase={phase}
      aria-label="Site menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="wmenu__panel">
        <div className="wmenu__head">
          <span className="wnav__cell wnav__brand" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark.src} width={mark.width} height={mark.height} alt="" className="wnav__mark" />
            <span className="wnav__word">ÄGAPĒ</span>
          </span>
          <span className="wnav__cell wnav__fill" aria-hidden="true" />
          <button type="button" className="wnav__cell wmenu__close" onClick={() => close()} aria-label="Close menu">
            <CloseIcon size={20} />
            <span className="wnav__menu-label" aria-hidden="true">
              Close
            </span>
          </button>
        </div>

        <nav className="wmenu__nav" aria-label="Sections">
          <Row as="ul" className="wmenu__links">
            {links.map((l, i) => (
              <LinkCell
                key={l.href}
                listItem
                href={l.href}
                span={6}
                size="title"
                className="wmenu__seq wmenu__link"
                style={seq(i)}
                aria-current={active && l.href === `#${active}` ? "location" : undefined}
                onClick={(e) => onLink(e, l.href)}
              >
                {l.label}
              </LinkCell>
            ))}
            {odd ? <Fill as="li" md={6} /> : null}
          </Row>
        </nav>

        <Row>
          <LinkCell
            href={ticketsUrl}
            external
            icon="none"
            variant="primary"
            size="title"
            h={2}
            y="center"
            className="wmenu__seq wmenu__tickets"
            style={seq(links.length)}
          >
            {ticketsLabel}
          </LinkCell>
        </Row>

        <Row as="ul" close>
          {socials.map((s, i) => (
            <LinkCell
              key={s.url}
              listItem
              href={s.url}
              external
              span={6}
              spanSm={2}
              h={1}
              label="Instagram"
              className="wmenu__seq"
              style={seq(links.length + 1 + i)}
            >
              {s.handle}
            </LinkCell>
          ))}
          {socials.length % 2 ? <Cell as="li" span={6} spanSm={2} aria-hidden="true" /> : null}
        </Row>
      </div>
    </dialog>
  );
}
