"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

interface NavProps {
  links: { label: string; href: string }[];
  ticketsUrl: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
  dateLine: string;
}

/**
 * A quiet top bar. Over the hero it is transparent and carries no ticket
 * button (the hero has the one red button); once the hero has scrolled away it
 * turns solid black with a hairline and the small Get tickets appears. Phones
 * get a Menu button that opens a full-screen sheet (a modal <dialog>).
 */
export function Nav({ links, ticketsUrl, mark, socials, dateLine }: NavProps) {
  const [solid, setSolid] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const open = () => menu.current?.showModal();
  const close = () => menu.current?.close();

  return (
    <header className="fr-nav" data-solid={solid || undefined}>
      <div className="fr-nav__bar">
        <a className="fr-nav__home" href="#hero" aria-label="ÄGAPĒ Winter Festival, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" />
          <span className="fr-nav__name">ÄGAPĒ</span>
        </a>
        <nav className="fr-nav__links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="fr-nav__end">
          <a className="fr-btn fr-btn--sm fr-nav__tix" href={ticketsUrl} target="_blank" rel="noopener noreferrer" tabIndex={solid ? undefined : -1}>
            Get tickets
          </a>
          <button type="button" className="fr-nav__menu" onClick={open} aria-haspopup="dialog">
            Menu
          </button>
        </div>
      </div>

      <dialog ref={menu} className="fr-menu" aria-label="Menu" onClick={(e) => e.target === e.currentTarget && close()}>
        <div className="fr-menu__inner">
          <div className="fr-menu__top">
            <span className="fr-nav__name">ÄGAPĒ</span>
            <button type="button" className="fr-nav__menu" onClick={close} aria-label="Close menu">
              <Icon name="close" size={20} />
            </button>
          </div>
          <nav className="fr-menu__links" aria-label="Sections">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={close}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="fr-menu__foot">
            <a className="fr-btn" href={ticketsUrl} target="_blank" rel="noopener noreferrer">
              Get tickets
            </a>
            <p className="fr-menu__meta">{dateLine}</p>
            <p className="fr-menu__meta">
              {socials.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && " · "}
                  <a className="fr-link" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.handle}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
