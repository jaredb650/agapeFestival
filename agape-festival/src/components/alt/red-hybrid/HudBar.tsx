"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ChromeNotch } from "./ChromeNotch";
import { Orb } from "./Orb";
import { cx } from "./cx";

export interface HudBarLink {
  label: string;
  href: string;
  /** The current link: frost + underline, and the lock-on bracket slides to it. */
  current?: boolean;
}

export interface HudBarProps {
  /** Left: brand (use HudBarBrand or anything). */
  brand?: ReactNode;
  /** Left, after a separator: status lines next to a breathing orb (≥1400px wide, or under 1100px). */
  status?: ReactNode;
  /** Centre links (≥1100px wide). */
  links?: HudBarLink[];
  /** Right, always. */
  end?: ReactNode;
  /** Right, only ≥1220px wide (the LCD clock + signal bars in the original). */
  endWide?: ReactNode;
  /** Right, only under 1100px (the MENU key in the original). */
  endNarrow?: ReactNode;
  /** The hung notch's LCD text; it decodes on every change. Omit for no notch. */
  notch?: string;
  /** Meter fill, 0–1. Omit to track the page's scroll position. */
  progress?: number;
  /** Section ticks on the meter, as 0–1 positions. They light up as the fill passes them. */
  ticks?: number[];
  /** Solid shell (the scrolled state). Default true; false = the over-the-hero look. */
  solid?: boolean;
  /** Compact: the frame slides up to a slim strip and the notch folds into it. */
  compact?: boolean;
  /** position: fixed at the top of the viewport (the original). Default false (in flow). */
  fixed?: boolean;
  className?: string;
}

/** Brand lockup for the bar: a mark image + tracked Orbitron word. */
export function HudBarBrand({ href = "#", mark, word, label }: { href?: string; mark?: { src: string; width: number; height: number }; word: string; label?: string }) {
  return (
    <a href={href} className="rhk-bar-brand" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {mark && <img src={mark.src} width={mark.width} height={mark.height} alt="" className="rhk-bar-brand__mark" />}
      <span className="rhk-bar-brand__word" aria-hidden={label ? true : undefined}>
        {word}
      </span>
    </a>
  );
}

/** Status lines for the bar: a pixel line (ice) over a nano caps line. */
export function HudBarStatus({ pixel, nano }: { pixel: ReactNode; nano?: ReactNode }) {
  return (
    <>
      <span className="rhk-bar__px">{pixel}</span>
      {nano && <span className="rhk-bar__nano">{nano}</span>}
    </>
  );
}

/** The bar's signal bars (the fourth drops out now and then). */
export function SignalBars({ className }: { className?: string }) {
  return (
    <span className={cx("rhk-sig", className)} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * The HUD top bar (c9688b5 page/Nav.tsx + nav.css): a chrome frame hung from the top edge
 * (caps with silver clamps, scanlined runs), a chrome notch under the centre with a sector
 * LCD, a scroll meter with a tick per section (fill, instrument ruler, glint), links with a
 * lock-on bracket that slides to the current one, and readout slots. It boots on mount (shell
 * flickers on, modules slide in, the notch unfolds). Breakpoints follow the bar's own width.
 * Navigation logic (section tracking, the mech menu dialog) is not included: pass the state in.
 */
export function HudBar({ brand, status, links, end, endWide, endNarrow, notch, progress, ticks = [], solid = true, compact, fixed, className }: HudBarProps) {
  const meterRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const reticleRef = useRef<HTMLSpanElement>(null);

  // Meter: an explicit progress, or the page's scroll position (rAF-throttled DOM writes, no React state).
  useEffect(() => {
    const meter = meterRef.current;
    if (!meter) return;
    const paint = (p: number) => {
      meter.style.setProperty("--p", p.toFixed(4));
      meter.querySelectorAll<HTMLElement>(".rhk-bar__tick").forEach((t) => t.toggleAttribute("data-lit", Number(t.dataset.at) <= p + 0.001));
    };
    if (progress !== undefined) {
      paint(Math.min(1, Math.max(0, progress)));
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      paint(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progress, ticks]);

  // Lock-on bracket: slides to the current link (transform only).
  const currentHref = links?.find((l) => l.current)?.href ?? null;
  const placeReticle = useCallback(() => {
    const ret = reticleRef.current;
    const ul = linksRef.current;
    if (!ret || !ul) return;
    const a = currentHref ? ul.querySelector<HTMLAnchorElement>(`a[href="${CSS.escape(currentHref)}"]`) : null;
    if (!a || !a.offsetWidth) {
      ret.removeAttribute("data-on");
      return;
    }
    // Trailing letter-spacing sits after the last glyph; the bracket hugs the ink.
    const w = a.offsetWidth - parseFloat(getComputedStyle(a).letterSpacing || "0");
    ret.style.setProperty("--rx", `${a.offsetLeft}px`);
    ret.style.setProperty("--rw", `${w}px`);
    ret.setAttribute("data-on", "");
  }, [currentHref]);
  useLayoutEffect(placeReticle, [placeReticle]);
  useEffect(() => {
    const ul = linksRef.current;
    if (!ul || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => placeReticle());
    ro.observe(ul);
    document.fonts?.ready.then(placeReticle);
    return () => ro.disconnect();
  }, [placeReticle]);

  return (
    <header className={cx("rhk-bar", className)} data-scrolled={solid || undefined} data-compact={compact || undefined} data-fixed={fixed || undefined}>
      <div className="rhk-bar__in">
        <div className="rhk-bar__shell" aria-hidden="true">
          <span className="rhk-bar__cap rhk-bar__cap--l">
            <svg viewBox="0 0 20 64" preserveAspectRatio="none" focusable="false">
              <path className="rhk-bar-fill" d="M8 0H20V64H18L8 54Z" />
              <path className="rhk-bar-stroke" d="M8.5 0V54L18 63.5H20" />
            </svg>
          </span>
          <span className="rhk-bar__run" />
          <span className="rhk-bar__cap rhk-bar__cap--r">
            <svg viewBox="0 0 20 64" preserveAspectRatio="none" focusable="false">
              <path className="rhk-bar-fill" d="M12 0H0V64H2L12 54Z" />
              <path className="rhk-bar-stroke" d="M11.5 0V54L2 63.5H0" />
            </svg>
          </span>
        </div>

        {notch !== undefined && <ChromeNotch text={notch} className="rhk-bar__notch" />}

        <div ref={meterRef} className="rhk-bar__meter" aria-hidden="true">
          <span className="rhk-bar__fill" />
          <span className="rhk-bar__head" />
          {ticks.map((t, i) => (
            <i key={i} className="rhk-bar__tick" data-at={t} style={{ left: `${t * 100}%` } as CSSProperties} />
          ))}
        </div>

        <div className="rhk-bar__bar">
          <div className="rhk-bar__start">
            {brand}
            {status && (
              <>
                <span className="rhk-bar__sep" aria-hidden="true" />
                <span className="rhk-bar__status" aria-hidden="true">
                  <Orb lit beat />
                  <span className="rhk-bar__stack">{status}</span>
                </span>
              </>
            )}
          </div>

          {links && links.length > 0 ? (
            <nav className="rhk-bar__links" aria-label="Sections">
              <ul ref={linksRef}>
                {links.map((l, i) => (
                  <li key={l.href} style={{ "--i": i } as CSSProperties}>
                    <a href={l.href} aria-current={l.current ? "location" : undefined}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <span ref={reticleRef} className="rhk-bar__reticle" aria-hidden="true">
                <i />
                <i />
              </span>
            </nav>
          ) : (
            <span />
          )}

          <div className="rhk-bar__end">
            {endWide && <span className="rhk-bar__wide" style={{ alignItems: "center", gap: 16 }}>{endWide}</span>}
            {end}
            {endNarrow && <span className="rhk-bar__narrow">{endNarrow}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
