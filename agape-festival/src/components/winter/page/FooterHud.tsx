"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Button, GLITCH_EVENT, GlitchLayer, Marquee } from "@/components/winter/ui";
import { HudBezel } from "./HudBezel";
import { armEntrance, decodeText, LIVE_MARGIN, onSecond, prefersReducedMotion } from "./hudFx";
import "@/styles/sections/footer.css";

/** Crisp lockup exports (see public/assets/winter/logos/). */
const FEST_LOGO = {
  src: "/assets/winter/logos/agape-festival-logo-720.webp",
  srcSet: "/assets/winter/logos/agape-festival-logo-400.webp 400w, /assets/winter/logos/agape-festival-logo-720.webp 720w, /assets/winter/logos/agape-festival-logo-1153.webp 1153w",
  width: 1153,
  height: 602,
};

interface FooterHudProps {
  links: { label: string; href: string }[];
  newsletter: { eyebrow: string; title: string; body: string; cta: string; url: string };
  socials: { url: string; handle: string }[];
  contactEmail: string;
  credit: { label: string; url: string; icon: string };
  copyright: string;
  origin: string;
  venue: { name: string; city: string; addressFull: string };
  dates: { display: string; short: string };
  edition: string;
  brand: string;
  dateScrawl: { src: string; width: number; height: number; alt: string };
}

interface Slot {
  href: string;
  label: string;
  readout: string;
  icon: ReactNode;
  external: boolean;
}

const IG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const SIGNAL = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M12 13v8M9 21h6" />
    <circle cx="12" cy="11" r="2" />
    <path d="M8.5 7.5a5 5 0 0 0 0 7M15.5 7.5a5 5 0 0 1 0 7M5.6 4.6a9 9 0 0 0 0 12.8M18.4 4.6a9 9 0 0 1 0 12.8" />
  </svg>
);
const MAIL = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="1" />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
);

const IDLE_READOUT = "SELECT A CHANNEL";

/**
 * END CREDITS / SYSTEM SHUTDOWN: the newsletter CTA (the hologram
 * "Sign up for updates" button, unchanged), the crisp ÄGAPĒ marks, socials as
 * inventory slots with an LCD readout, a stage-select nav, a dotted-leader
 * credits roll and a wide-spaced ticker. Entrance: bezel power-on, title
 * decode, the Ä assembling, a glitch burst on the festival lockup, slots
 * popping in. All DOM writes; no per-frame React state.
 */
export function FooterHud(p: FooterHudProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const cancelReadout = useRef<() => void>(() => {});

  const slots: Slot[] = [
    ...p.socials.map((s) => ({ href: s.url, label: `Instagram ${s.handle}`, readout: s.handle.toUpperCase(), icon: IG, external: true })),
    { href: p.newsletter.url, label: "Newsletter: sign up on Laylo", readout: "LAYLO :: TEXT DROPS", icon: SIGNAL, external: true },
    { href: `mailto:${p.contactEmail}`, label: `Email ${p.contactEmail}`, readout: p.contactEmail.toUpperCase(), icon: MAIL, external: false },
  ];

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const timers: number[] = [];
    let cancelTitle = () => {};
    let stopTick: (() => void) | null = null;

    // CONTINUE? 9…0 while the panel is on screen (one textContent write a second, shared 1 Hz ticker).
    const count = countRef.current;
    let n = 9;
    const io = new IntersectionObserver((entries) => {
      const onScreen = entries[entries.length - 1].isIntersecting;
      // CSS loops (the end-of-transmission cursor) only run while the panel is on screen.
      shell.toggleAttribute("data-live", onScreen);
      if (onScreen && !stopTick && count && !prefersReducedMotion()) {
        stopTick = onSecond(() => {
          n = n <= 0 ? 9 : n - 1;
          count.textContent = String(n);
          count.toggleAttribute("data-zero", n === 0);
        });
      } else if (!onScreen && stopTick) {
        stopTick();
        stopTick = null;
      }
    }, { rootMargin: LIVE_MARGIN });
    io.observe(shell);

    const disarm = armEntrance(shell, () => {
      if (titleRef.current) cancelTitle = decodeText(titleRef.current, p.newsletter.title, 720);
      timers.push(window.setTimeout(() => logoRef.current?.querySelector(".w-glitch")?.dispatchEvent(new Event(GLITCH_EVENT)), 900));
    });
    return () => {
      disarm();
      cancelTitle();
      io.disconnect();
      shell.removeAttribute("data-live");
      stopTick?.();
      timers.forEach(clearTimeout);
      cancelReadout.current();
    };
  }, [p.newsletter.title]);

  const showReadout = (text: string) => {
    const el = readoutRef.current;
    if (!el) return;
    cancelReadout.current();
    cancelReadout.current = decodeText(el, text, 300);
  };

  return (
    <footer id="footer" className="wft" aria-labelledby="footer-title">
      <div ref={shellRef} className="wft__shell">
        <HudBezel label=":: End credits ::" bottomLabel=":: System shutdown ::" />
        <div className="wft__grid">
          {/* ---- Join the movement ---- */}
          <div className="wft__join">
            <p className="wft__kicker">
              <span className="wft__kidx">07</span>
              <span className="wft__krule" aria-hidden="true" />
              <span>{p.newsletter.eyebrow}</span>
            </p>
            <h2 id="footer-title" className="wft__title">
              <span className="w-sr-only">{p.newsletter.title}</span>
              <span ref={titleRef} aria-hidden="true">
                {p.newsletter.title}
              </span>
            </h2>
            <p className="wft__body">{p.newsletter.body}</p>
            <div className="wft__cta">
              <Button variant="secondary" href={p.newsletter.url} external size="lg">
                {p.newsletter.cta}
              </Button>
              <span className="wft__continue" aria-hidden="true">
                Continue? <b ref={countRef}>9</b>
              </span>
            </div>
          </div>

          {/* ---- Sign-off: crisp marks ---- */}
          <div className="wft__emblem">
            <div className="wft__logos">
              <svg className="wft__mark" viewBox="0 0 1476 2090" role="img" aria-label="ÄGAPĒ">
                <g className="wft__mark-dots">
                  <circle cx="140" cy="133" r="133" />
                  <circle cx="535" cy="133" r="133" />
                </g>
                <path className="wft__mark-body" fillRule="evenodd" d="M0 388H972L1473 849L1150 1154L1472 1463V2090H0ZM460 817V1661H1144V1152L781 817Z" />
              </svg>
              <span className="wft__logos-rule" aria-hidden="true" />
              <div ref={logoRef} className="wft__fest-wrap">
                <GlitchLayer intensity="subtle" className="wft__fest">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={FEST_LOGO.src}
                    srcSet={FEST_LOGO.srcSet}
                    sizes="(max-width: 959px) 150px, 300px"
                    width={FEST_LOGO.width}
                    height={FEST_LOGO.height}
                    alt={p.brand}
                    loading="lazy"
                    decoding="async"
                  />
                </GlitchLayer>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wft__date" src={p.dateScrawl.src} width={p.dateScrawl.width} height={p.dateScrawl.height} alt={p.dateScrawl.alt} loading="lazy" decoding="async" />
            <p className="wft__addr">{p.venue.addressFull}</p>
          </div>

          <span className="wft__rule" aria-hidden="true" />

          {/* ---- Stage select ---- */}
          <nav className="wft__nav" aria-label="Footer">
            <p className="wft__h" aria-hidden="true">
              <span>A</span> Stage select
            </p>
            <ul>
              {p.links.map((l, i) => (
                <li key={l.href} style={{ "--i": i } as CSSProperties}>
                  <a href={l.href}>
                    <span className="wft__nav-k" aria-hidden="true">
                      ▸
                    </span>
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- Comms slots ---- */}
          <div className="wft__comms">
            <p className="wft__h" aria-hidden="true">
              <span>B</span> Comms link
            </p>
            <ul className="wft__slots">
              {slots.map((s, i) => (
                <li key={s.href} style={{ "--i": i } as CSSProperties}>
                  <a
                    className="wft__slot"
                    href={s.href}
                    aria-label={s.label}
                    {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onPointerEnter={() => showReadout(s.readout)}
                    onFocus={() => showReadout(s.readout)}
                    onPointerLeave={() => showReadout(IDLE_READOUT)}
                    onBlur={() => showReadout(IDLE_READOUT)}
                  >
                    <span className="wft__slot-icon">{s.icon}</span>
                    <span className="wft__slot-n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="wft__readout" aria-hidden="true">
              <span ref={readoutRef}>{IDLE_READOUT}</span>
            </p>
          </div>

          {/* ---- Credits roll ---- */}
          <div className="wft__credits">
            <p className="wft__h" aria-hidden="true">
              <span>C</span> Credits
            </p>
            <dl>
              <div data-desk>
                <dt>Presented by</dt>
                <dd>ÄGAPĒ</dd>
              </div>
              <div data-desk>
                <dt>Venue</dt>
                <dd>
                  {p.venue.name}, {p.venue.city}
                </dd>
              </div>
              <div>
                <dt>Site design</dt>
                <dd>
                  <a className="wft__meka" href={p.credit.url} target="_blank" rel="noopener noreferrer" aria-label={p.credit.label}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.credit.icon} width={400} height={380} alt="" loading="lazy" decoding="async" />
                    MEKA
                  </a>
                </dd>
              </div>
              <div data-desk>
                <dt>Contact</dt>
                <dd>
                  <a href={`mailto:${p.contactEmail}`}>{p.contactEmail}</a>
                </dd>
              </div>
            </dl>
          </div>

          {/* ---- Base: ticker + legal ---- */}
          <div className="wft__base">
            <Marquee
              className="wft__ticker"
              duration={70}
              separator="::"
              label={`${p.brand}, ${p.edition}, ${p.dates.display}, ${p.venue.name}`}
              items={[p.brand, p.edition, p.dates.short, `${p.venue.name} ${p.venue.city}`, "Thank you for playing", "System shutdown"]}
            />
            <div className="wft__legal">
              <p>{p.copyright}</p>
              <p>{p.origin}</p>
              <p className="wft__eot" aria-hidden="true">
                End of transmission<i />
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
