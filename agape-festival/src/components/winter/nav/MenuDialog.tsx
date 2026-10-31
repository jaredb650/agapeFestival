"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { Button } from "@/components/winter/ui";
import type { HudSection } from "./hud";

export type MenuPhase = "closed" | "opening" | "open" | "closing";

// Choreography lengths (keep in sync with nav.css: the last row lands ~0.8s).
const OPEN_MS = 850;
const CLOSE_MS = 420;
const RM_MS = 220;
const DESKTOP = "(min-width: 1100px)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Menu state machine around a native modal <dialog> (focus trap, inert page, Esc).
 * opening → open runs the unfold; closing plays the fold-out before dialog.close().
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
    document.documentElement.classList.add("whud-lock");
    // Set before showModal so the very first painted frame is already the unfold's first frame.
    dialog.dataset.phase = "opening";
    dialog.showModal();
    // Start on CLOSE (the body is a scroller, which Chrome would otherwise pick).
    dialog.querySelector<HTMLElement>(".whud-menu__close")?.focus({ preventScroll: true });
    go("opening");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go("open"), reduced() ? RM_MS : OPEN_MS);
  }, [go]);

  /** Fold out, then close. `then` runs after the dialog is gone (e.g. jump to a section). */
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
    // Esc: play the fold-out instead of the instant native close.
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    // Fires for our timed close and for any forced close (e.g. a second Esc).
    const onClose = () => {
      clearTimeout(timer.current);
      document.documentElement.classList.remove("whud-lock");
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
      document.documentElement.classList.remove("whud-lock");
    };
  }, [buttonRef, close, go]);

  return { phase, open, close, dialogRef };
}

export type MenuApi = ReturnType<typeof useMenu>;

interface MenuDialogProps {
  menu: MenuApi;
  links: { label: string; href: string }[];
  sections: HudSection[];
  /** Index into `sections`, -1 when unknown. */
  active: number;
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
 * The mobile menu (red hybrid): a dark panel inside the deployed corner
 * ticks that unfolds out of the bar. The section plates flip down on hinges
 * one after another (shorter, no overshoot), then the red Get tickets and
 * the socials rise in. No readouts, codes or decorative labels. All motion is
 * CSS transform/opacity keyed off data-phase (see nav.css).
 */
export function MenuDialog({ menu, links, sections, active, ticketsUrl, ticketsLabel, mark, socials }: MenuDialogProps) {
  const { phase, close, dialogRef } = menu;
  const activeId = sections[active]?.id;

  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    close(() => jumpTo(href));
  };

  return (
    <dialog
      id="whud-menu"
      ref={dialogRef}
      className="whud-menu"
      data-phase={phase}
      aria-label="Site menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="whud-menu__veil" aria-hidden="true" onClick={() => close()} />

      <div className="whud-menu__body">
        {/* Head: the bar, re-drawn in place, so the menu reads as unfolding out of it. */}
        <div className="whud-menu__head">
          <span className="whud-brand whud-menu__brand" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark.src} width={mark.width} height={mark.height} alt="" className="whud-brand__mark" />
            <span className="whud-brand__word">ÄGAPE</span>
          </span>
          <button type="button" className="whud-btn whud-menu__close" onClick={() => close()}>
            <svg className="whud-menu__x" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Close</span>
          </button>
        </div>

        <div className="whud-menu__win">
          <span className="whud-menu__bezel" aria-hidden="true" />
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="whud-menu__brk" style={{ "--k": i } as CSSProperties} aria-hidden="true" />
          ))}

          <nav className="whud-menu__nav" aria-label="Sections">
            <ol className="whud-menu__list" style={{ "--n": links.length } as CSSProperties}>
              {links.map((l, i) => (
                <li key={l.href} className="whud-menu__item" style={{ "--i": i } as CSSProperties}>
                  <a
                    href={l.href}
                    className="whud-menu__link"
                    aria-current={l.href.slice(1) === activeId ? "location" : undefined}
                    onClick={(e) => onLink(e, l.href)}
                  >
                    <span className="whud-menu__label">{l.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="whud-menu__foot">
          <Button href={ticketsUrl} external size="md" className="whud-menu__cta">
            {ticketsLabel}
          </Button>
          <ul className="whud-menu__socials">
            {socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
