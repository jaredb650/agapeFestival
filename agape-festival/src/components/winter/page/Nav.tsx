"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { GlitchLayer } from "@/components/winter/ui";
import { findSections, type HudSection } from "@/components/winter/nav/hud";
import { MenuDialog, useMenu } from "@/components/winter/nav/MenuDialog";
import { observeInView } from "@/components/winter/perf";
import "@/styles/sections/nav.css";

/**
 * While the flyer's stage holds the screen (its section crosses a line ~35% down
 * the viewport: the hero has mostly gone, until the stage has mostly left), the bar
 * goes compact so the poster gets the top of the screen.
 */
const FLYER_BAND = "-35% 0px -64% 0px";

interface Props {
  links: { label: string; href: string }[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
}

/**
 * The top bar (red hybrid): the blue build's structure without its HUD
 * clutter. A slim frame across the top with chamfered end caps, a scroll
 * meter with a tick per section along its bottom edge, the Ä mark + wordmark,
 * and (desktop) the section links with the original hover and a sliding red
 * bracket on the current section; (mobile) a MENU key that unfolds the menu.
 * Over the flyer it slims down ([data-compact], from one IntersectionObserver).
 * No status lights, clocks, readouts or codes.
 *
 * Motion budget: nothing re-renders per frame. Scroll writes one transform;
 * React state changes only when the current section changes.
 */
export function Nav({ links, ticketsUrl, ticketsLabel, mark, socials }: Props) {
  const [sections, setSections] = useState<HudSection[]>([]);
  const [active, setActive] = useState(0);
  const [ticks, setTicks] = useState<number[]>([]);

  const rootRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const reticleRef = useRef<HTMLSpanElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const menu = useMenu(menuBtnRef);

  // ---- Sections, scroll meter, scrolled flag -------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const found = findSections(links);
    // The DOM is the source of truth for which sections exist (flags, other agents' sections).
    const sectionsRaf = requestAnimationFrame(() => setSections(found));
    const els = found.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);

    // Current section: the last one crossing a thin band at the middle of the viewport.
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

    // Scroll meter: one transform per frame. No layout reads per scroll: the range is cached by `measure`.
    let raf = 0;
    let max = document.documentElement.scrollHeight - window.innerHeight;
    let scrolled: boolean | null = null;
    const update = () => {
      raf = 0;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
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

  // ---- Compact over the flyer: one shared IntersectionObserver, no scroll work.
  useEffect(() => {
    const root = rootRef.current;
    const flyer = document.getElementById("flyer");
    if (!root || !flyer) return;
    const off = observeInView(flyer, (on) => root.toggleAttribute("data-compact", on), { rootMargin: FLYER_BAND });
    return () => {
      off();
      root.removeAttribute("data-compact");
    };
  }, []);

  // ---- Desktop bracket: slides to the active link (transform only) ---------
  const here = sections[active];
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
      {/* ---- Frame: chamfered caps + run ---- */}
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

      {/* ---- Scroll meter with a tick per section ---- */}
      <div className="whud__meter" aria-hidden="true">
        <span ref={fillRef} className="whud__fill" />
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
          <button
            ref={menuBtnRef}
            type="button"
            className="whud-btn whud__menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="whud-menu"
            onClick={menu.open}
          >
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
      />
    </header>
  );
}
