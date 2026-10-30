"use client";

import { useEffect, useRef, useState } from "react";
import { Button, cx } from "@/components/winter/ui";

interface Props {
  links: { label: string; href: string }[];
  ticketsUrl: string;
  ticketsLabel: string;
  mark: { src: string; width: number; height: number };
  socials: { url: string; handle: string }[];
}

/**
 * Persistent nav. Transparent over the hero, ink once the page moves.
 * The nav's Get tickets only appears when no other primary CTA is on screen
 * (hero CTA scrolled away, tickets section not in view).
 * Mobile: compact bar + a modal <dialog> menu (native focus trap + Esc).
 */
export function Nav({ links, ticketsUrl, ticketsLabel, mark, socials }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Other primary CTAs on screen → hide ours.
    // The hero CTA fades out as the hero leaves, so it only counts while it is in
    // the lower half of the viewport; the tickets CTA counts whenever it's on screen.
    const visible = new Set<Element>();
    const onCta = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setShowCta(visible.size === 0);
    };
    const heroIo = new IntersectionObserver(onCta, { rootMargin: "-50% 0px 0px 0px" });
    const ticketsIo = new IntersectionObserver(onCta);
    document.querySelectorAll("[data-hero-cta]").forEach((el) => heroIo.observe(el));
    document.querySelectorAll("[data-tickets-cta]").forEach((el) => ticketsIo.observe(el));

    // Section currently under the middle of the viewport.
    const ids = links.map((l) => l.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const secIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => secIo.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      heroIo.disconnect();
      ticketsIo.disconnect();
      secIo.disconnect();
    };
  }, [links]);

  // Menu open/close drives the native modal dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    if (open && !dialog.open) {
      dialog.showModal();
      root.classList.add("wmenu-open");
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) root.classList.remove("wmenu-open");
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    menuBtnRef.current?.focus({ preventScroll: true });
  };

  return (
    <header className="wnav" data-scrolled={scrolled || undefined} data-cta={showCta || undefined}>
      <div className="wnav__bar">
        <a href="#hero" className="wnav__brand" aria-label="ÄGAPĒ Winter Festival, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark.src} width={mark.width} height={mark.height} alt="" className="wnav__mark" />
          <span className="wnav__word" aria-hidden="true">ÄGAPĒ</span>
        </a>

        <nav className="wnav__links" aria-label="Sections">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={active === l.href.slice(1) ? "location" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="wnav__end">
          <div className="wnav__cta" inert={!showCta}>
            <Button href={ticketsUrl} external size="sm">
              {ticketsLabel}
            </Button>
          </div>
          <button
            ref={menuBtnRef}
            type="button"
            className="wnav__menu-btn"
            aria-expanded={open}
            aria-controls="wnav-menu"
            onClick={() => setOpen(true)}
          >
            <span className="wnav__burger" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      <dialog
        id="wnav-menu"
        ref={dialogRef}
        className="wmenu"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className="wmenu__inner">
          <div className="wmenu__top">
            <span className="w-hud" data-tone="frost">Menu</span>
            <button type="button" className="wmenu__close" onClick={closeMenu}>
              <span>Close</span>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>
          <nav aria-label="Sections">
            <ol className="wmenu__list">
              {links.map((l, i) => (
                <li key={l.href}>
                  <a href={l.href} className={cx("wmenu__link", active === l.href.slice(1) && "is-active")} onClick={() => setOpen(false)}>
                    <span className="wmenu__idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className="w-h2">{l.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="wmenu__foot">
            <Button href={ticketsUrl} external size="md">
              {ticketsLabel}
            </Button>
            <ul className="wmenu__socials">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-hud">
                    {s.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </header>
  );
}
