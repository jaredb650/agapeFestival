"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

interface Props {
  links: { label: string; href: string }[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
}

/**
 * A quiet top bar: the Ä mark, the section links and, once the hero (with its
 * own big button) has scrolled away, a small Get tickets button. Phones get a
 * Menu button that opens a full-screen list (a native modal <dialog>, so focus
 * and Escape are handled by the browser).
 */
export function Nav({ links, ticketsUrl, ticketsLabel, mark, socials }: Props) {
  const barRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<string | null>(null);

  // Past the hero: solid bar + the ticket button. One observer, no scroll handler.
  useEffect(() => {
    const bar = barRef.current;
    const hero = document.getElementById("hero");
    if (!bar || !hero) return;
    const io = new IntersectionObserver(([e]) => bar.toggleAttribute("data-past", !e.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Current section: the one crossing the middle of the screen.
  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.href.slice(1))).filter((x): x is HTMLElement => !!x);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const hero = document.getElementById("hero");
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), { rootMargin: "-50% 0px -50% 0px" });
    if (hero) heroIo.observe(hero);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, [links]);

  const open = () => menuRef.current?.showModal();
  const close = () => menuRef.current?.close();

  return (
    <>
      <header ref={barRef} className="s-nav">
        <a className="s-nav__brand" href="#hero" aria-label="ÄGAPĒ Winter Festival, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" />
          <span>ÄGAPĒ</span>
        </a>
        <nav className="s-nav__links" aria-label="Sections">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={active === l.href ? "true" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="s-nav__end">
          <a className="s-btn s-btn--primary s-btn--sm s-nav__tickets" href={ticketsUrl} target="_blank" rel="noopener noreferrer">
            {ticketsLabel}
          </a>
          <button type="button" className="s-nav__menu" onClick={open} aria-haspopup="dialog">
            <MenuIcon />
            <span>Menu</span>
          </button>
        </div>
      </header>

      <dialog ref={menuRef} className="s-menu" aria-label="Menu" onClick={(e) => e.target === e.currentTarget && close()}>
        <div className="s-menu__inner">
          <div className="s-menu__top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark.src} width={mark.width} height={mark.height} alt="" />
            <button type="button" className="s-menu__close" onClick={close} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          <ul className="s-menu__links">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={close}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="s-menu__foot">
            <a className="s-btn s-btn--primary s-btn--lg" href={ticketsUrl} target="_blank" rel="noopener noreferrer">
              {ticketsLabel}
            </a>
            <ul className="s-menu__socials">
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
    </>
  );
}
