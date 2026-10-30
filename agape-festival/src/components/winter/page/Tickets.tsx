import { Button } from "@/components/winter/ui";
import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";

/**
 * A ticket stub, not a pricing table: tiers and prices aren't confirmed, so the
 * stub carries only what's known (days, venue, DICE) and hands off to DICE.
 */
export function Tickets({ bgAt }: { bgAt?: number }) {
  return (
    <section id="tickets" className="w-section wtickets" aria-labelledby="tickets-title" data-bg-at={bgAt}>
      <div className="w-container">
        <div className="wticket w-frame" data-size="lg">
          <div className="wticket__main">
            {/* The button says "Get tickets"; the heading names the section instead of repeating it. */}
            <h2 id="tickets-title" className="w-h1">
              {TICKETS.eyebrow}
            </h2>
            <p className="w-lead">Ticket options and prices are on the DICE event page.</p>
          </div>
          <div className="wticket__perf" aria-hidden="true" />
          <div className="wticket__stub">
            <dl className="wticket__facts">
              {WINTER_DAYS.map((d) => (
                <div key={d.day}>
                  <dt className="w-hud">{d.label}</dt>
                  <dd>
                    <time dateTime={d.isoDate}>{d.date}</time>
                  </dd>
                </div>
              ))}
              <div>
                <dt className="w-hud">Venue</dt>
                <dd>
                  {WINTER.venue.name}, {WINTER.venue.city}
                </dd>
              </div>
            </dl>
            <Button href={TICKETS.url} external className="wticket__cta" data-tickets-cta>
              {WINTER.tickets.cta}
            </Button>
            <p className="w-hud wticket__foot">On sale now via {WINTER.tickets.provider}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
