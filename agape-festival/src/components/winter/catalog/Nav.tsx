"use client";

import { useEffect, useRef, type MouseEvent } from "react";

interface Props {
  items: { href: string; label: string; cat: string }[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
  when: string;
}

/**
 * Fixed top bar. Over the hero it is transparent and carries no ticket button
 * (the hero has the big one); once the hero has scrolled away it turns black
 * with a hairline and a small red Get tickets appears. One observer, no scroll
 * handler. Phones get a full-screen <dialog> menu (focus trap and Esc built in).
 */
export function Nav({ items, ticketsUrl, ticketsLabel, mark, socials, when }: Props) {
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const el = bar.current;
    if (!hero || !el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-solid", !e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    menu.current?.close();
    requestAnimationFrame(() => {
      document.getElementById(href.slice(1))?.scrollIntoView();
      history.replaceState(null, "", href);
    });
  };

  return (
    <header ref={bar} className="cat-nav">
      <div className="cat-nav__in">
        <a href="#hero" className="cat-nav__brand" aria-label="ÄGAPĒ Winter Festival, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" />
        </a>
        <nav className="cat-nav__links" aria-label="Sections">
          <ul>
            {items.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="cat-btn cat-btn--sm cat-nav__tix" href={ticketsUrl} target="_blank" rel="noopener noreferrer">
          {ticketsLabel}
        </a>
        <button type="button" className="cat-nav__menu" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
          Menu
        </button>
      </div>

      <dialog ref={menu} className="cat-menu" aria-label="Menu">
        <div className="cat-menu__top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" />
          <button type="button" className="cat-nav__menu" onClick={() => menu.current?.close()}>
            Close
          </button>
        </div>
        <nav aria-label="Sections">
          <ol className="cat-menu__list">
            {items.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)}>
                  <span className="cat-menu__no">{l.cat}</span>
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="cat-menu__foot">
          <a className="cat-btn cat-btn--lg" href={ticketsUrl} target="_blank" rel="noopener noreferrer">
            {ticketsLabel}
          </a>
          <p className="cat-menu__when">{when}</p>
          <ul className="cat-menu__social">
            {socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  Instagram {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </header>
  );
}
