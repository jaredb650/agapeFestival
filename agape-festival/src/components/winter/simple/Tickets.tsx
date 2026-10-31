import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import { dayStamp } from "./labels";

/**
 * One hand-off to DICE. Tiers and prices aren't confirmed
 * (WINTER.tickets.confirmNote), so nothing here names a ticket type or price.
 */
export function Tickets({ bgAt }: { bgAt?: number }) {
  return (
    <section id="tickets" className="s-sec s-tickets" aria-labelledby="tickets-title" data-bg-at={bgAt}>
      <header className="s-head" data-reveal="">
        <h2 id="tickets-title" className="s-title">
          Tickets
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">{TICKETS.body}</p>
      </header>

      <div className="s-tickets__body" data-reveal="">
        <dl className="s-days">
          {WINTER_DAYS.map((d) => (
            <div key={d.day} className="s-days__row">
              <dt>Day {d.day}</dt>
              <dd>
                <time className="s-mono" dateTime={d.isoDate}>
                  {dayStamp(d.isoDate)}
                </time>
              </dd>
              <dd className="s-days__where">
                {WINTER.venue.name}, {WINTER.venue.city}
              </dd>
            </div>
          ))}
        </dl>
        <a className="s-btn s-btn--primary s-btn--lg" href={TICKETS.url} target="_blank" rel="noopener noreferrer">
          Get tickets on {WINTER.tickets.provider}
        </a>
        <p className="s-note">Ticket options and prices are listed on the DICE event page.</p>
      </div>
    </section>
  );
}
