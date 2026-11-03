"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MenuIcon } from "@/components/winter/ui";
import { MenuDialog, useMenu } from "@/components/winter/nav/MenuDialog";
import { barLinks, findSections, type NavLink } from "@/components/winter/nav/sections";
import { observeInView } from "@/components/winter/perf";
import "@/styles/sections/nav.css";

/**
 * While the flyer's stage holds the screen (its section crosses a line ~35% down the viewport: the hero
 * has mostly gone, until the stage has mostly left), the bar slides away so the poster has the screen.
 */
const FLYER_BAND = "-35% 0px -64% 0px";

interface Props {
  links: NavLink[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
}

/**
 * The top bar (classic): the mark and wordmark (back to top) on the left; from 1100px the section links in
 * Orbitron caps and the red Get tickets on the right, below 1100px a Menu button instead (MenuDialog; the
 * client asked for no Get tickets in the phone bar). The current section's link is white with a short red
 * rule under it. Transparent over the hero, a dark bar once the page moves, away over the flyer. The
 * bar's content lines up with the sections' content column.
 *
 * No per-frame work: the active section comes from one IntersectionObserver, the scrolled flag from a
 * rAF-throttled scroll check that only flips an attribute.
 */
export function Nav({ links, ticketsUrl, ticketsLabel, mark, socials }: Props) {
  const items = useMemo(() => barLinks(links), [links]);
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menu = useMenu(menuBtnRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = findSections()
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    // Current section: the last one crossing a thin band at the middle of the viewport. Between two
    // sections (a gap band) the last one stays current.
    const hit = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? hit.add(e.target) : hit.delete(e.target)));
        const current = els.filter((el) => hit.has(el)).pop();
        if (current) setActive(current.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));

    let raf = 0;
    let scrolled: boolean | null = null;
    const update = () => {
      raf = 0;
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
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const flyer = document.getElementById("flyer");
    if (!root || !flyer) return;
    const off = observeInView(flyer, (on) => root.toggleAttribute("data-away", on), { rootMargin: FLYER_BAND });
    return () => {
      off();
      root.removeAttribute("data-away");
    };
  }, []);

  const menuOpen = menu.phase !== "closed";

  return (
    <header ref={rootRef} className="wnav" data-menu={menuOpen || undefined}>
      <div className="wnav__bar">
        <a href="#hero" className="wnav__brand" aria-label="ÄGAPĒ Winter Festival, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" className="wnav__mark" />
          <span className="wnav__word" aria-hidden="true">
            ÄGAPĒ
          </span>
        </a>

        <nav className="wnav__links" aria-label="Sections">
          <ul>
            {items.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="wnav__link" aria-current={active && l.href === `#${active}` ? "location" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href={ticketsUrl} target="_blank" rel="noopener noreferrer" className="wnav__tickets">
          <span className="wnav__tickets-label">{ticketsLabel}</span>
          <span className="w-sr-only"> (opens in a new tab)</span>
        </a>

        <button
          ref={menuBtnRef}
          type="button"
          className="wnav__menu"
          aria-label="Menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="wnav-menu"
          onClick={menu.open}
        >
          <span className="wnav__menu-label" aria-hidden="true">
            Menu
          </span>
          <MenuIcon size={20} />
        </button>
      </div>

      <MenuDialog menu={menu} links={items} active={active} ticketsUrl={ticketsUrl} ticketsLabel={ticketsLabel} mark={mark} socials={socials} />
    </header>
  );
}
