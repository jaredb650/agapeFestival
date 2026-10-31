import type { CSSProperties } from "react";
import { Button, GlassWindow, Marquee } from "@/components/winter/ui";
import { Pass } from "@/components/winter/tickets/Pass";
import { TerminalFrame } from "@/components/winter/tickets/TerminalFrame";
import { TerminalShell } from "@/components/winter/tickets/TerminalShell";
import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import "@/styles/sections/tickets.css";

// Clean ÄGAPĒ Festival lockup (white, alpha), exported from the client's 1233px master.
const LOGO = { src: "/assets/winter/tickets/agape-festival-logo-720.webp", width: 720, height: 398, alt: "ÄGAPĒ Festival" };

const pad2 = (n: number) => String(n).padStart(2, "0");
/** "2027-02-19" → "02.19.27" */
const lcdDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}.${d}.${y.slice(2)}`;
};
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * Tickets as an ACCESS TERMINAL: a mech-cockpit bezel around a holographic
 * pass, with LCD readouts (status, countdown) and one big hand-off to DICE.
 * Tiers and prices aren't confirmed (WINTER.tickets.confirmNote), so nothing
 * here names a ticket type or a price: the pass carries the days, the venue
 * and the provider, and the readouts say options and prices live on DICE.
 */
export function Tickets({ bgAt }: { bgAt?: number }) {
  const { provider, url, cta } = WINTER.tickets;
  // The DICE event id from the ticket URL ("…/event/6dyng3-…"): the pass serial.
  const serial = (/\/event\/([a-z0-9]+)-/i.exec(url)?.[1] ?? "WINTER").toUpperCase();
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
    } catch {
      return provider;
    }
  })();
  const days = WINTER_DAYS.map((day) => ({
    label: `DAY ${pad2(day.day)}`,
    lcd: `${day.weekday.slice(0, 3).toUpperCase()} ${lcdDate(day.isoDate)}`,
    isoDate: day.isoDate,
    dateLong: day.dateLong,
  }));
  const [d1, d2] = days;
  const stages = `${pad2(WINTER.stagesPerDay)} per day`;
  const edition = WINTER.edition.toUpperCase();
  const venueCity = `${WINTER.venue.name}, ${WINTER.venue.location}`.toUpperCase();

  const log: { k: string; v: string }[] = [
    { k: `LINK ${host}`, v: "OK" },
    { k: `EVENT ${serial}`, v: "FOUND" },
    { k: `${lcdDate(d1.isoDate).slice(0, 5)}–${lcdDate(d2.isoDate)}`, v: `${pad2(days.length)} DAYS` },
    { k: WINTER.venue.name.toUpperCase(), v: WINTER.venue.city.toUpperCase() },
    { k: "STAGE", v: `${pad2(WINTER.stagesPerDay)} / DAY` },
    { k: "STATUS", v: "ON SALE" },
  ];

  const ticker = [
    `${edition} ${WINTER.year}`,
    WINTER.dates.display.toUpperCase(),
    venueCity,
    `ONE STAGE PER DAY`,
    `TICKETS ON SALE VIA ${provider}`,
  ];

  return (
    <section id="tickets" className="tk" aria-labelledby="tickets-title" data-bg-at={bgAt}>
      <TerminalShell className="tk-term" targetIso={WINTER.countdown.targetIso}>
        <div className="tk-scrim" aria-hidden="true" />
        <TerminalFrame label=":: Access terminal ::" foot={`${WINTER.dates.short.toUpperCase()} :: ${WINTER.year}`} />
        <div className="tk-boot" aria-hidden="true">
          <i className="tk-boot__line" />
          <i className="tk-boot__flash" />
        </div>

        <header className="tk-bar tk-in" data-in="bar" style={d(0.2)} aria-hidden="true">
          <span className="tk-bar__id">
            <i className="tk-orb" data-lit="" /> SYS <b>::</b> TICKETS
          </span>
          <span className="tk-bar__rule" />
          <span className="tk-bar__gap" />
          <span className="tk-bar__rule tk-bar__rule--r" />
          <span className="tk-bar__link">
            LINK <b>::</b> {host} <i className="tk-orb tk-orb--pulse tk-loop" data-lit="" />
          </span>
        </header>

        <div className="tk-grid">
          {/* ---- Left: title + boot log -------------------------------------- */}
          <div className="tk-intel">
            <p className="tk-kicker tk-in" data-in="fade" style={d(0.35)} aria-hidden="true">
              <span data-tk-decode="0.35">{`:: ${edition} ${WINTER.year} ::`}</span>
            </p>
            <h2 id="tickets-title" className="tk-title">
              <span className="tk-title__solid tk-in" data-in="glitch" data-text={TICKETS.eyebrow} style={d(0.4)}>
                {TICKETS.eyebrow}
              </span>
              <span className="tk-title__ghost tk-in" data-in="ghost" style={d(0.55)} aria-hidden="true">
                {TICKETS.eyebrow}
              </span>
            </h2>
            <p className="tk-chip tk-in" data-in="fade" style={d(0.7)}>
              <i className="tk-orb tk-orb--pulse tk-loop" data-lit="" aria-hidden="true" /> On sale <span aria-hidden="true">::</span> {provider}
            </p>

            <ol className="tk-log tk-in" data-in="panel" style={d(0.6)} aria-hidden="true">
              {log.map((row, i) => (
                <li key={row.k} className="tk-in" data-in="line" style={d(0.75 + i * 0.12)}>
                  <span className="tk-log__k">
                    <b>&gt;</b> <span data-tk-decode={0.75 + i * 0.12}>{row.k}</span>
                  </span>
                  <span className="tk-log__dots" />
                  <span className="tk-log__v" data-tk-decode={0.9 + i * 0.12}>
                    {row.v}
                  </span>
                </li>
              ))}
              <li className="tk-log__ready tk-in" data-in="line" style={d(1.6)}>
                <b>&gt;</b> READY<i className="tk-caret tk-loop" />
              </li>
            </ol>
            <p className="tk-note tk-in" data-in="fade" style={d(1.7)}>
              {/* Same wording as before: the DICE page owns the options. */}
              Ticket options and prices are on the {provider} event page.
            </p>
          </div>

          {/* ---- Centre: the pass on its targeting ring ---------------------- */}
          <div className="tk-stage" data-tk-anchor>
            <svg className="tk-reticle tk-in" data-in="lock" style={d(0.45)} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              <circle className="tk-reticle__ring" cx="50" cy="50" r="49" />
              <g className="tk-reticle__spin tk-loop">
                <circle className="tk-reticle__dash" cx="50" cy="50" r="45" />
              </g>
              <circle className="tk-reticle__ring tk-reticle__ring--in" cx="50" cy="50" r="34" />
              <path className="tk-reticle__cross" d="M50 0v7M50 93v7M0 50h7M93 50h7" />
              <path className="tk-reticle__tick" d="M14.6 14.6l3.5 3.5M85.4 14.6l-3.5 3.5M14.6 85.4l3.5-3.5M85.4 85.4l-3.5-3.5" />
            </svg>
            <span className="tk-lockon tk-in" data-in="lockon" style={d(0.95)} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="tk-callout tk-callout--a tk-in" data-in="fade" style={d(1.9)} aria-hidden="true">
              <i>↘</i> Access pass <b>:: 01</b>
            </span>
            <span className="tk-callout tk-callout--b tk-in" data-in="fade" style={d(2.05)} aria-hidden="true">
              Holo-auth <i>↖</i>
            </span>
            <Pass
              logo={LOGO}
              serial={serial}
              edition={edition}
              year={WINTER.year}
              days={days}
              venue={{ name: WINTER.venue.name.toUpperCase(), location: WINTER.venue.location.toUpperCase() }}
              provider={provider}
              stages={stages.toUpperCase()}
            />
            <span className="tk-hint tk-in" data-in="fade" style={d(2.2)} aria-hidden="true">
              <span className="tk-hint__fine">◂ Move to inspect ▸</span>
              <span className="tk-hint__touch">Tap the pass</span>
            </span>
          </div>

          {/* ---- Right: readouts + the hand-off ------------------------------ */}
          <div className="tk-ops">
            <div className="tk-mods">
              <div className="tk-in" data-in="win" style={d(0.95)}>
              <GlassWindow as="div" skin="chrome" active controls={false} className="tk-win" title=":: Status ::" meta={provider} aria-label="Ticket status">
                <div className="tk-lcd tk-lcd--status">
                  <span className="tk-lcd__big">
                    <i className="tk-orb tk-orb--lg tk-orb--pulse tk-loop" data-lit="" aria-hidden="true" />
                    <span data-tk-decode="1.15">ON SALE</span>
                  </span>
                  <span className="tk-lcd__row">
                    VIA <span data-tk-decode="1.3">{host}</span>
                  </span>
                  <span className="tk-lcd__row tk-lcd__row--wide">
                    OPTIONS + PRICES <i>/</i> ON {provider}
                  </span>
                </div>
              </GlassWindow>
              </div>

              <div className="tk-in" data-in="win" style={d(1.1)}>
              <GlassWindow as="div" skin="chrome" controls={false} className="tk-win" title=":: T-minus ::" meta={d1.label} aria-label={`Countdown to ${d1.dateLong}`}>
                <div className="tk-lcd tk-lcd--cd">
                  <span className="tk-cd" aria-hidden="true">
                    <span className="tk-cd__u">
                      <b data-u="d">---</b>
                      <i>Days</i>
                    </span>
                    <span className="tk-cd__sep">:</span>
                    <span className="tk-cd__u">
                      <b data-u="h">--</b>
                      <i>Hrs</i>
                    </span>
                    <span className="tk-cd__sep">:</span>
                    <span className="tk-cd__u">
                      <b data-u="m">--</b>
                      <i>Min</i>
                    </span>
                    <span className="tk-cd__sep tk-cd__sep--s">:</span>
                    <span className="tk-cd__u tk-cd__u--s">
                      <b data-u="s">--</b>
                      <i>Sec</i>
                    </span>
                  </span>
                  <span className="tk-lcd__row tk-lcd__row--wide">
                    TO {d1.label} <i>/</i> {d1.lcd}
                  </span>
                  <span className="w-sr-only">Day 1 is {d1.dateLong}.</span>
                </div>
              </GlassWindow>
              </div>
            </div>

            <div className="tk-start tk-in" data-in="cta" style={d(1.25)}>
              <p className="tk-prompt" aria-hidden="true">
                <span className="tk-prompt__say">
                  <span className="tk-prompt__a tk-loop">▶ Insert coin</span>
                  <span className="tk-prompt__b">▶ Press start</span>
                </span>
                <span className="tk-prompt__credit">
                  Credit{" "}
                  <span className="tk-prompt__cn">
                    <b className="tk-prompt__c0">00</b>
                    <b className="tk-prompt__c1">01</b>
                  </span>
                </span>
              </p>
              <Button href={url} external size="lg" className="tk-cta" data-tickets-cta aria-label={`${cta} on ${provider} (opens in a new tab)`}>
                {cta}
              </Button>
              <p className="tk-out" aria-hidden="true">
                Options + prices <i>::</i> {host} <i>↗</i>
              </p>
            </div>
          </div>
        </div>

        <footer className="tk-bar tk-bar--foot tk-in" data-in="bar" style={d(0.3)}>
          <Marquee items={ticker} separator="::" duration={36} className="tk-ticker" label={`${WINTER.dates.display}, ${WINTER.venue.full}. Tickets on sale via ${provider}.`} />
        </footer>
      </TerminalShell>
    </section>
  );
}
