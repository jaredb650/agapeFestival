"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { Button } from "@/components/winter/ui";
import { decode, settleAll } from "./decode";
import { pad2, sectorCode, type HudSection } from "./hud";

export type MenuPhase = "closed" | "opening" | "open" | "closing";

// Choreography lengths (keep in sync with nav.css: the last row lands ~1.05s).
const OPEN_MS = 1150;
const CLOSE_MS = 520;
const RM_MS = 220;
const DESKTOP = "(min-width: 1100px)";
// Row timing (ms): the first plate unfolds at ROW0, then one every ROW_STEP.
const ROW0 = 300;
const ROW_STEP = 55;
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
      settleAll(dialog);
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
  dates: string;
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
 * The mobile menu: a mech HUD that unfolds out of the bar. A chrome window
 * (silver title bar, boot LCD, sector plates, orb status strip) inside a
 * bracketed bezel; plates flip down on hinges one after another, labels decode
 * in, a scan band sweeps, the orbs light up. Close folds it back. All motion is
 * CSS transform/opacity keyed off data-phase (see nav.css); the decode is
 * direct textContent writes from one rAF loop.
 */
export function MenuDialog({ menu, links, sections, active, ticketsUrl, ticketsLabel, mark, socials, dates }: MenuDialogProps) {
  const { phase, close, dialogRef } = menu;
  const activeId = sections[active]?.id;
  const linkIndex = links.findIndex((l) => l.href.slice(1) === activeId);

  // Boot: decode labels and LCD rows as their plates land.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (phase !== "opening" || !dialog) return;
    if (reduced()) return;
    const cancels: (() => void)[] = [];
    dialog.querySelectorAll<HTMLElement>("[data-decode]").forEach((el) => {
      const text = el.dataset.decode || el.textContent || "";
      cancels.push(decode(el, text, { delay: Number(el.dataset.delay || 0), ms: Number(el.dataset.ms || 360), pre: true }));
    });
    return () => cancels.forEach((c) => c());
  }, [phase, dialogRef]);

  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    close(() => jumpTo(href));
  };

  const sector = sectorCode(sections, active, links);
  const hereText = sector ? `${sector.index} ${sector.label}` : "SCANNING";

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
      <span className="whud-menu__rail whud-menu__rail--l" aria-hidden="true" />
      <span className="whud-menu__rail whud-menu__rail--r" aria-hidden="true" />

      <div className="whud-menu__body">
        {/* Head: the bar, re-drawn in place, so the menu reads as unfolding out of it. */}
        <div className="whud-menu__head">
          <span className="whud-brand whud-menu__brand" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark.src} width={mark.width} height={mark.height} alt="" className="whud-brand__mark" />
            <span className="whud-brand__word">ÄGAPE</span>
          </span>
          <span className="whud-notch whud-menu__notch" aria-hidden="true">
            <span className="whud-notch__body" />
            <svg className="whud-notch__edge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              <path d="M0 0L8 99.5H92L100 0" />
            </svg>
            <span className="whud-orb" data-size="sm" data-lit="" />
            <span className="whud-notch__lcd">
              <span className="whud-notch__text" data-decode="SECTOR SELECT" data-delay="160">
                SECTOR SELECT
              </span>
            </span>
            <span className="whud-orb" data-size="sm" data-lit="" />
          </span>
          <button type="button" className="whud-btn whud-menu__close" onClick={() => close()}>
            <span className="whud-btn__glass" aria-hidden="true" />
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

          <div className="whud-menu__title" aria-hidden="true">
            <span className="whud-menu__led" />
            <span className="whud-menu__title-text">:: ÄGAPE NAV.SYS ::</span>
            <span className="whud-menu__meta">{pad2(links.length)} SEC</span>
            <span className="whud-menu__ctrl">
              <i />
              <i />
              <i />
            </span>
          </div>

          <div className="whud-menu__lcd" aria-hidden="true">
            <span data-decode="BOOT SEQ :: LINK OK :: W27" data-delay="300" data-ms="420">
              BOOT SEQ :: LINK OK :: W27
            </span>
            <span>
              <i>LOC</i> <b data-decode={hereText} data-delay="420" data-ms="460">{hereText}</b>
            </span>
          </div>

          <nav className="whud-menu__nav" aria-label="Sections">
            <ol className="whud-menu__list" style={{ "--n": links.length } as CSSProperties}>
              {links.map((l, i) => {
                const current = l.href.slice(1) === activeId;
                const idx = pad2(i + 1);
                const rowAt = ROW0 + i * ROW_STEP;
                return (
                  <li key={l.href} className="whud-menu__item" style={{ "--i": i } as CSSProperties}>
                    <a
                      href={l.href}
                      className="whud-menu__link"
                      aria-current={current ? "location" : undefined}
                      onClick={(e) => onLink(e, l.href)}
                    >
                      <span className="whud-menu__ring" aria-hidden="true" />
                      <span className="whud-menu__idx" aria-hidden="true">
                        <span data-decode={idx} data-delay={rowAt + 140} data-ms="240">
                          {idx}
                        </span>
                      </span>
                      <span className="whud-menu__label" data-decode={l.label} data-delay={rowAt + 90} data-ms="380">
                        {l.label}
                      </span>
                      <span className="whud-menu__state" aria-hidden="true">
                        {current ? "◀︎ HERE" : `SEC.${idx}`}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="whud-menu__status" aria-hidden="true">
            <span className="whud-menu__orbs">
              {links.map((l, i) => (
                <span key={l.href} className="whud-orb" data-size="sm" data-lit={i === linkIndex || undefined} style={{ "--k": i } as CSSProperties} />
              ))}
            </span>
            <span className="whud-menu__count">{linkIndex >= 0 ? pad2(linkIndex + 1) : "--"}/{pad2(links.length)}</span>
            <span className="whud-menu__clock">
              NYC <b data-clock>--:--:--</b>
            </span>
          </div>
        </div>

        <div className="whud-menu__foot">
          <Button href={ticketsUrl} external size="md" className="whud-menu__cta">
            {ticketsLabel}
          </Button>
          <div className="whud-menu__meta-row">
            <ul className="whud-menu__socials">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.handle}
                  </a>
                </li>
              ))}
            </ul>
            <span className="whud-menu__date" aria-hidden="true">
              {dates} <i>::</i> IND.CITY BK
            </span>
          </div>
        </div>
      </div>

      <span className="whud-menu__scan" aria-hidden="true" />
      <span className="whud-menu__flash" aria-hidden="true" />
    </dialog>
  );
}
