"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useScramble } from "@/components/winter/artist-select/hooks";
import { HudBezel } from "./HudBezel";
import { armEntrance, decodeText, prefersReducedMotion, staggerIn } from "./hudFx";
import "@/styles/sections/faq.css";

export interface FaqEntry {
  id: string;
  q: string;
  paras: string[];
  link?: { label: string; href: string; external: boolean };
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const TITLE = "Frequently asked";

/**
 * The FAQ "news terminal": `:: QUESTION ::` rows on dotted separators, LCD
 * index numbers, a chrome bezel with one curved corner, and a sticky readout
 * column (LCD + one glass orb per entry, lit for the open one).
 *
 * Accordion: header buttons with aria-expanded/aria-controls over labelled
 * regions; one entry open at a time; ↑/↓/Home/End move between questions.
 * Opening animates grid-template-rows (one row at a time), sweeps a scan band
 * down the answer and decodes its text (written to an aria-hidden copy; the
 * real text sits beside it for screen readers).
 */
export function FaqTerminal({ items, contactEmail }: { items: FaqEntry[]; contactEmail: string }) {
  const [open, setOpen] = useState(-1);
  const rootRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const regions = useRef<(HTMLDivElement | null)[]>([]);
  const total = items.length;

  const lcdText = open < 0 ? `AWAITING QUERY :: ${pad2(total)} ON FILE` : `QUERY ${pad2(open + 1)}/${pad2(total)} :: DECODED`;
  const lcdRef = useScramble<HTMLSpanElement>(lcdText, { ms: 360 });

  // Entrance: bezel power-on + title decode, then the rows stagger in as they scroll up.
  useEffect(() => {
    const shell = shellRef.current;
    const list = listRef.current;
    if (!shell || !list) return;
    let cancelTitle = () => {};
    const disarm = armEntrance(shell, () => {
      if (titleRef.current) cancelTitle = decodeText(titleRef.current, TITLE.toUpperCase(), 700);
    });
    const rows = Array.from(list.querySelectorAll<HTMLElement>(".wfq__item"));
    if (!prefersReducedMotion()) list.setAttribute("data-armed", "");
    const unstagger = staggerIn(rows);
    return () => {
      disarm();
      unstagger();
      cancelTitle();
    };
  }, []);

  // Decode the answer that just opened.
  useEffect(() => {
    if (open < 0) return;
    const region = regions.current[open];
    if (!region) return;
    const nodes = Array.from(region.querySelectorAll<HTMLElement>("[data-decode]"));
    const cancels = nodes.map((el, k) => decodeText(el, el.dataset.decode ?? "", 380 + k * 120));
    return () => cancels.forEach((c) => c());
  }, [open]);

  const toggle = useCallback((i: number) => setOpen((o) => (o === i ? -1 : i)), []);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = e.key === "ArrowDown" ? (i + 1) % total : e.key === "ArrowUp" ? (i - 1 + total) % total : e.key === "Home" ? 0 : e.key === "End" ? total - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    buttons.current[to]?.focus();
  };

  return (
    <section ref={rootRef} id="faq" className="wfq" aria-labelledby="faq-title">
      <div ref={shellRef} className="wfq__shell">
        <HudBezel label=":: Intel archive ::" />
        <div className="wfq__grid">
          <header className="wfq__head">
            <p className="wfq__kicker">
              <span className="wfq__kidx">06</span>
              <span className="wfq__krule" aria-hidden="true" />
              <span>Support :: FAQ</span>
            </p>
            <h2 id="faq-title" className="wfq__title">
              <span className="w-sr-only">{TITLE}</span>
              <span ref={titleRef} aria-hidden="true">
                {TITLE.toUpperCase()}
              </span>
            </h2>
            <p className="wfq__lead">The essentials before you go.</p>

            <div className="wfq__lcd" aria-hidden="true">
              <span className="wfq__lcd-row">CH.06 :: SUPPORT TERMINAL</span>
              <span className="wfq__lcd-row" ref={lcdRef}>
                {lcdText}
              </span>
            </div>
            <div className="wfq__orbs" aria-hidden="true">
              {items.map((it, i) => (
                <span key={it.id} className="wfq__orb" data-lit={open === i || undefined} style={{ "--i": i } as CSSProperties} />
              ))}
            </div>

            <p className="wfq__contact">
              <span>Still stuck?</span>
              <a href={`mailto:${contactEmail}`} className="wfq__transmit">
                <span className="wfq__transmit-k" aria-hidden="true">
                  Transmit
                </span>
                <span>{contactEmail}</span>
                <svg viewBox="0 0 22 10" fill="none" aria-hidden="true">
                  <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </a>
            </p>
          </header>

          <div ref={listRef} className="wfq__list">
            {items.map((it, i) => {
              const isOpen = open === i;
              const n = pad2(i + 1);
              return (
                <div key={it.id} className="wfq__item" data-open={isOpen || undefined} style={{ "--i": i } as CSSProperties}>
                  <h3 className="wfq__h">
                    <button
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      id={`faq-q-${it.id}`}
                      className="wfq__q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${it.id}`}
                      onClick={() => toggle(i)}
                      onKeyDown={(e) => onKey(e, i)}
                    >
                      <span className="wfq__n" aria-hidden="true">
                        {n}
                      </span>
                      <span className="wfq__qbody">
                        <span className="wfq__tag" aria-hidden="true">
                          :: Question {n} ::
                        </span>
                        <span className="wfq__qtext">{it.q}</span>
                      </span>
                      <span className="wfq__key" aria-hidden="true">
                        <i />
                      </span>
                    </button>
                  </h3>
                  <div
                    ref={(el) => {
                      regions.current[i] = el;
                    }}
                    id={`faq-a-${it.id}`}
                    role="region"
                    aria-labelledby={`faq-q-${it.id}`}
                    className="wfq__a"
                  >
                    <div className="wfq__clip">
                      <div className="wfq__ainner">
                        <span className="wfq__resp" aria-hidden="true">
                          {`>> Response ${n} // decoded`}
                        </span>
                        {it.paras.map((p, k) => (
                          <p key={k} className="wfq__p">
                            <span className="w-sr-only">{p}</span>
                            <span aria-hidden="true" data-decode={p}>
                              {p}
                            </span>
                          </p>
                        ))}
                        {it.link && (
                          <a
                            className="wfq__link"
                            href={it.link.href}
                            tabIndex={isOpen ? undefined : -1}
                            {...(it.link.external && !it.link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          >
                            <span className="wfq__link-k" aria-hidden="true">
                              ▸
                            </span>
                            {it.link.label}
                          </a>
                        )}
                      </div>
                      <span className="wfq__scan" aria-hidden="true" />
                    </div>
                  </div>
                  <span className="wfq__sep" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
