import { TICKETS, WINTER } from "@/data/winter";
import { SectionHead } from "./SectionHead";

/** DICE is the only outlet and no tiers or prices are published yet, so: one line, one button. */
export function Tickets() {
  const [d1, d2] = WINTER.dates.days;
  return (
    <section id="tickets" className="fr-section" aria-labelledby="tickets-title" data-reveal="">
      <div className="fr-wrap fr-split">
        <SectionHead id="tickets-title" title="Tickets" />
        <div className="fr-tickets">
          <p className="fr-lead">{TICKETS.body}</p>
          <dl className="fr-facts">
            <div>
              <dt>Day 1</dt>
              <dd>{d1.dateLong}</dd>
            </div>
            <div>
              <dt>Day 2</dt>
              <dd>{d2.dateLong}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                {WINTER.venue.name}, {WINTER.venue.neighborhood}, {WINTER.venue.city}
              </dd>
            </div>
          </dl>
          <p className="fr-tickets__action">
            <a className="fr-btn fr-btn--lg" href={TICKETS.url} target="_blank" rel="noopener noreferrer">
              Get tickets on DICE
            </a>
            <span className="fr-note">Ticket options and prices are listed on DICE.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
