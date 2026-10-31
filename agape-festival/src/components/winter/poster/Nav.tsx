"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AgapeMark } from "./icons";

export interface NavLink {
  label: string;
  href: string;
  index: string;
}

interface Props {
  /** Desktop bar links. */
  links: NavLink[];
  /** Phone menu: every numbered section. */
  menu: NavLink[];
  ticketsUrl: string;
  ticketsLabel: string;
  provider: string;
  socials: { url: string; handle: string }[];
}

/**
 * A quiet bar: the ÄGAPĒ mark, the section links, and Get tickets, which only
 * appears once the hero's own button has scrolled away (one red button per
 * screen). Transparent over the hero, solid black with a hairline after.
 * Phones get a Menu button that opens a full-screen list (native modal
 * <dialog>: focus trap, Esc, inert page).
 */
export function Nav({ links, menu, ticketsUrl, ticketsLabel, provider, socials }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let scrolled: boolean | null = null;
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = window.scrollY > 8;
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

    // The bar's ticket button shows once the hero button is out of view.
    const heroCta = document.querySelector("[data-hero-cta]");
    let io: IntersectionObserver | null = null;
    if (heroCta) {
      io = new IntersectionObserver(([e]) => root.toggleAttribute("data-cta", !e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
      io.observe(heroCta);
    } else {
      root.setAttribute("data-cta", "");
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      document.documentElement.style.overflow = "";
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const openMenu = () => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();
    document.documentElement.style.overflow = "hidden";
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();
  // Close first so the page is no longer inert when the link's own jump runs.
  const onMenuLink = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.target !== "_blank") closeMenu();
  };

  return (
    <header ref={rootRef} className="pp-nav">
      <a className="pp-nav__brand" href="#hero" aria-label="ÄGAPĒ Festival, back to top">
        <AgapeMark className="pp-nav__mark" />
      </a>
      <nav className="pp-nav__links" aria-label="Sections">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pp-nav__end">
        <a className="pp-btn pp-btn--sm pp-nav__cta" href={ticketsUrl} target="_blank" rel="noopener noreferrer" aria-label={`${ticketsLabel} on ${provider} (opens in a new tab)`}>
          {ticketsLabel}
        </a>
        <button type="button" className="pp-nav__menu" aria-haspopup="dialog" aria-expanded={open} onClick={openMenu}>
          Menu
        </button>
      </div>

      <dialog ref={dialogRef} className="pp-menu" aria-label="Menu">
        <div className="pp-menu__bar">
          <AgapeMark className="pp-nav__mark" />
          <button type="button" className="pp-nav__menu" onClick={closeMenu} autoFocus>
            Close
          </button>
        </div>
        <ul className="pp-menu__list">
          {menu.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={onMenuLink}>
                <span className="pp-menu__idx" aria-hidden="true">
                  {l.index}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="pp-menu__foot">
          <a className="pp-btn pp-btn--lg" href={ticketsUrl} target="_blank" rel="noopener noreferrer" onClick={onMenuLink}>
            {ticketsLabel}
          </a>
          <p className="pp-menu__socials">
            {socials.map((s) => (
              <a key={s.url} className="pp-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.handle}
              </a>
            ))}
          </p>
        </div>
      </dialog>
    </header>
  );
}
