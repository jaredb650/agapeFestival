import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import { ArrowUpRight } from "./icons";
import { SectionHead } from "./SectionHead";

/**
 * Tickets: one statement, the facts a buyer checks, one hand-off to DICE.
 * Tiers and prices are not confirmed (WINTER.tickets.confirmNote), so nothing
 * here names a ticket type or a price.
 */
export function Tickets({ index }: { index: string }) {
  const { provider, url, cta } = WINTER.tickets;
  const [d1, d2] = WINTER_DAYS;
  const facts = [
    { k: "Dates", v: `${d1.dateLong.replace(/, \d{4}$/, "")} and ${d2.dateLong}` },
    { k: "Venue", v: `${WINTER.venue.name}, ${WINTER.venue.neighborhood}, ${WINTER.venue.city}` },
    { k: "Stages", v: "One stage per day" },
  ];

  return (
    <section id="tickets" className="pp-sec" aria-labelledby="tickets-title" data-reveal>
      <SectionHead index={index} id="tickets-title" title="Tickets" />
      <div className="pp-grid pp-tickets">
        <div className="pp-tickets__lead">
          <p className="pp-lead">{TICKETS.body}</p>
          <p className="pp-note">Ticket options and prices are listed on the {provider} event page.</p>
          <a className="pp-btn pp-btn--lg" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${cta} on ${provider} (opens in a new tab)`}>
            {cta} on {provider}
            <ArrowUpRight />
          </a>
        </div>
        <dl className="pp-facts">
          {facts.map((f) => (
            <div key={f.k} className="pp-facts__row">
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
