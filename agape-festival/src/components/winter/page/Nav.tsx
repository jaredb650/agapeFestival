"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { GlitchLayer } from "@/components/winter/ui";
import { decode } from "@/components/winter/nav/decode";
import { dateCode, findSections, nycTime, sectorCode, type HudSection } from "@/components/winter/nav/hud";
import { MenuDialog, useMenu } from "@/components/winter/nav/MenuDialog";
import { onSecond } from "@/components/winter/perf";
import "@/styles/sections/nav.css";

interface Props {
  links: { label: string; href: string }[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
  /** ISO festival dates, for the "02.19–20.27" readout. */
  dates?: { startIso: string; endIso: string };
}

/**
 * The HUD bar. A slim chrome frame across the top with a notch hanging under
 * its centre (the live sector readout), a scroll meter with a tick per section
 * along its bottom edge, a status module (orb + SYS ONLINE + dates) and a
 * recessed LCD (New York clock + scan %). Desktop: the section links with a
 * sliding lock-on bracket. Mobile: a MENU key that unfolds the HUD menu.
 *
 * Motion budget: nothing re-renders per frame. Scroll writes one transform and
 * (when it changes) a 3-digit text node; the clock writes text once a second;
 * React state changes only when the current section changes.
 */
export function Nav({ links, ticketsUrl, ticketsLabel, mark, socials, dates }: Props) {
  const [sections, setSections] = useState<HudSection[]>([]);
  const [active, setActive] = useState(0);
  const [ticks, setTicks] = useState<number[]>([]);

  const rootRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLElement>(null);
  const lcdRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const reticleRef = useRef<HTMLSpanElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const booted = useRef(false);

  const menu = useMenu(menuBtnRef);
  const code = dates ? dateCode(dates.startIso, dates.endIso) : "02.19–20.27";

  // ---- Sections, scroll meter, scrolled flag -------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const found = findSections(links);
    // The DOM is the source of truth for which sections exist (flags, other agents' sections).
    const sectionsRaf = requestAnimationFrame(() => setSections(found));
    const els = found.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);

    // Current sector: the last section crossing a thin band at the middle of the viewport.
    const hit = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? hit.add(e.target as HTMLElement) : hit.delete(e.target as HTMLElement)));
        let idx = -1;
        els.forEach((el, i) => hit.has(el) && (idx = i));
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // Scroll meter: one transform + a text node only when the integer changes.
    // No layout reads per scroll: the scroll range is cached by `measure` (page reflow / resize).
    let raf = 0;
    let lastPct = -1;
    let meterW = 0;
    let max = document.documentElement.scrollHeight - window.innerHeight;
    let scrolled: boolean | null = null;
    const update = () => {
      raf = 0;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (headRef.current) headRef.current.style.transform = `translateX(${(p * meterW).toFixed(1)}px)`;
      const pct = Math.round(p * 100);
      if (pct !== lastPct && pctRef.current) {
        pctRef.current.textContent = String(pct).padStart(3, "0");
        lastPct = pct;
      }
      const s = window.scrollY > 24;
      if (s !== scrolled) {
        scrolled = s;
        root.toggleAttribute("data-scrolled", s);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Section ticks on the meter: re-measured when the page reflows (images, fonts).
    let measureRaf = 0;
    const measure = () => {
      measureRaf = 0;
      meterW = fillRef.current?.parentElement?.offsetWidth ?? 0;
      max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const next = els.map((el) => Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45) / max)));
      setTicks((cur) => (cur.length === next.length && cur.every((v, i) => Math.abs(v - next[i]) < 0.002) ? cur : next));
      update();
    };
    const remeasure = () => {
      if (!measureRaf) measureRaf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(remeasure);
    const main = document.getElementById("main");
    if (main) ro.observe(main);
    ro.observe(root);
    // The viewport height changes the scroll range too (mobile URL bar), without resizing <main>.
    window.addEventListener("resize", remeasure, { passive: true });
    measureRaf = requestAnimationFrame(measure);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measureRaf);
      cancelAnimationFrame(sectionsRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
    };
  }, [links]);

  // ---- Clock: festival-local time on the page's shared 1 Hz tick (wall-clock aligned,
  // parked while the tab is hidden), written straight to the DOM. (Readouts hidden by a
  // breakpoint or the closed menu cost nothing: text in a display:none subtree never lays out.)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>("[data-clock]");
    return onSecond((now) => {
      const t = nycTime(new Date(now));
      nodes.forEach((n) => (n.textContent = t));
    });
  }, []);

  // ---- Sector change: decode the LCD, sweep the notch -----------------------
  const here = sections[active];
  const sector = sectorCode(sections, active, links);
  const lcdText = sector ? `${sector.index} ▸ ${sector.label}` : "SCANNING";
  useEffect(() => {
    const el = lcdRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = lcdText;
      return;
    }
    // First sector arrives during the boot: decode it a beat later, with the bar.
    const first = !booted.current;
    booted.current = true;
    const cancel = decode(el, lcdText, { ms: first ? 620 : 380, delay: first ? 520 : 0, pre: first });
    if (!first) {
      sweepRef.current?.animate(
        [
          { transform: "translateX(-100%)", opacity: 1 },
          { transform: "translateX(100%)", opacity: 0.2 },
        ],
        { duration: 520, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
      );
    }
    return cancel;
  }, [lcdText]);

  // ---- Desktop lock-on bracket: slides to the active link (transform only) --
  const activeHref = here ? `#${here.id}` : null;
  const placeReticle = useCallback(() => {
    const ret = reticleRef.current;
    const ul = linksRef.current;
    if (!ret || !ul) return;
    const a = activeHref ? ul.querySelector<HTMLAnchorElement>(`a[href="${activeHref}"]`) : null;
    if (!a || !a.offsetWidth) {
      ret.removeAttribute("data-on");
      return;
    }
    // Trailing letter-spacing sits after the last glyph; the bracket hugs the ink.
    const w = a.offsetWidth - parseFloat(getComputedStyle(a).letterSpacing || "0");
    ret.style.setProperty("--rx", `${a.offsetLeft}px`);
    ret.style.setProperty("--rw", `${w}px`);
    ret.setAttribute("data-on", "");
  }, [activeHref]);
  useLayoutEffect(placeReticle, [placeReticle]);
  useEffect(() => {
    const ul = linksRef.current;
    if (!ul) return;
    const ro = new ResizeObserver(() => placeReticle());
    ro.observe(ul);
    document.fonts?.ready.then(placeReticle);
    return () => ro.disconnect();
  }, [placeReticle]);

  const menuOpen = menu.phase !== "closed";

  return (
    <header ref={rootRef} className="whud" data-menu={menuOpen || undefined}>
      {/* ---- Chrome shell: caps, runs and the hanging notch ---- */}
      <div className="whud__shell" aria-hidden="true">
        <span className="whud__cap whud__cap--l">
          <svg viewBox="0 0 20 64" preserveAspectRatio="none" focusable="false">
            <path className="whud-fill" d="M8 0H20V64H18L8 54Z" />
            <path className="whud-stroke" d="M8.5 0V54L18 63.5H20" />
          </svg>
        </span>
        <span className="whud__run" />
        <span className="whud__cap whud__cap--r">
          <svg viewBox="0 0 20 64" preserveAspectRatio="none" focusable="false">
            <path className="whud-fill" d="M12 0H0V64H2L12 54Z" />
            <path className="whud-stroke" d="M11.5 0V54L2 63.5H0" />
          </svg>
        </span>
      </div>

      {/* ---- Chrome notch under the centre: glass orbs + recessed sector LCD ---- */}
      <div className="whud-notch whud__notch" aria-hidden="true">
        <span className="whud-notch__body" />
        <svg className="whud-notch__edge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <path d="M0 0L8 99.5H92L100 0" />
        </svg>
        <span className="whud-orb" data-size="sm" data-lit="" />
        <span className="whud-notch__lcd">
          <span ref={lcdRef} className="whud-notch__text">
            {lcdText}
          </span>
          <span className="whud__sweep">
            <span ref={sweepRef} />
          </span>
        </span>
        <span className="whud-orb" data-size="sm" data-lit="" />
      </div>

      {/* ---- Scroll meter with a tick per section ---- */}
      <div className="whud__meter" aria-hidden="true">
        <span ref={fillRef} className="whud__fill" />
        <span ref={headRef} className="whud__head" />
        {ticks.map((t, i) => (
          <i key={i} className="whud__tick" data-lit={i <= active || undefined} style={{ left: `${t * 100}%` } as CSSProperties} />
        ))}
      </div>

      <div className="whud__bar">
        <div className="whud__start">
          <a href="#hero" className="whud-brand" aria-label="ÄGAPĒ Winter Festival, back to top">
            <GlitchLayer as="span" intensity="subtle" className="whud-brand__glitch">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mark.src} width={mark.width} height={mark.height} alt="" className="whud-brand__mark" />
            </GlitchLayer>
            {/* Orbitron has no Ē: the wordmark is set "ÄGAPE" (the accessible name keeps the macron). */}
            <span className="whud-brand__word" aria-hidden="true">
              ÄGAPE
            </span>
          </a>
          <span className="whud__sep" aria-hidden="true" />
          <span className="whud__status" aria-hidden="true">
            <span className="whud-orb whud__beat" data-lit="" />
            <span className="whud__stack">
              <span className="whud__px">SYS ONLINE</span>
              <span className="whud__nano whud__nano--date">{code}</span>
              <span className="whud__nano whud__nano--clock">
                NYC <b data-clock>--:--:--</b>
              </span>
            </span>
          </span>
        </div>

        <nav className="whud__links" aria-label="Sections">
          <ul ref={linksRef}>
            {links.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as CSSProperties}>
                <a href={l.href} aria-current={activeHref === l.href ? "location" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span ref={reticleRef} className="whud__reticle" aria-hidden="true">
            <i />
            <i />
          </span>
        </nav>

        <div className="whud__end">
          <span className="whud__lcd" aria-hidden="true">
            <span>
              <i>NYC</i> <b data-clock>--:--:--</b>
            </span>
            <span>
              <i>SCAN</i>
              <span>
                <b ref={pctRef}>000</b>
                <i>%</i>
              </span>
            </span>
          </span>
          <span className="whud__bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <button
            ref={menuBtnRef}
            type="button"
            className="whud-btn whud__menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="whud-menu"
            onClick={menu.open}
          >
            <span className="whud-btn__glass" aria-hidden="true" />
            <span className="whud__burger" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Menu</span>
          </button>
        </div>
      </div>

      <MenuDialog
        menu={menu}
        links={links}
        sections={sections}
        active={active}
        ticketsUrl={ticketsUrl}
        ticketsLabel={ticketsLabel}
        mark={mark}
        socials={socials}
        dates={code}
      />
    </header>
  );
}
