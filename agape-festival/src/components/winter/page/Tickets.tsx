import { Section } from "@/components/winter/classic";
import { sentenceCase } from "@/components/winter/nav/sections";
import { ArrowRight, ArrowUpRight, Button } from "@/components/winter/ui";
import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import "@/styles/sections/tickets.css";

/** "Friday, February 19, 2027" → "Friday, February 19". */
const dayDate = (dateLong: string) => dateLong.replace(/,\s*\d{4}$/, "");

/**
 * Tickets, classic: the September "Secure your entry" block, quieter. A centred display title over the
 * background footage, standing on its own reflection (a flipped copy under a mask fade, CSS only, kept
 * from the grid version). Then the facts as hairline rows (the days, the venue, doors once announced) and
 * one red Get tickets to DICE. Tiers and prices aren't published here (TODO_CONFIRM in winter.ts); they
 * live on the DICE page, so the section names none. Server-rendered, no client JS.
 */
export function Tickets() {
  const { provider, url, cta } = WINTER.tickets;
  const title = sentenceCase(TICKETS.eyebrow);

  return (
    <Section
      id="tickets"
      align="center"
      className="tk"
      title={
        <>
          <span className="tk-word">{title}</span>
          {/* The reflection: decorative, so it's left out of the heading's name. */}
          <span className="tk-word tk-word--mirror" aria-hidden="true">
            {title}
          </span>
        </>
      }
      intro={TICKETS.body}
    >
      <div className="tk-body">
        <dl className="tk-facts" data-reveal="">
          {WINTER_DAYS.map((day) => (
            <div key={day.day} className="tk-row">
              <dt className="k-label k-label--red">{sentenceCase(day.label)}</dt>
              <dd className="tk-value">
                <time dateTime={day.isoDate}>{dayDate(day.dateLong)}</time>
              </dd>
            </div>
          ))}
          <div className="tk-row">
            <dt className="k-label">Venue</dt>
            <dd className="tk-value">
              <a href="#getting-here" className="tk-link">
                <span>
                  {WINTER.venue.name}
                  <span className="tk-value__city">, {WINTER.venue.city}</span>
                </span>
                <span className="w-sr-only">, getting here</span>
                <ArrowRight className="tk-arrow" size={16} />
              </a>
            </dd>
          </div>
          {WINTER.hours && (
            <div className="tk-row">
              <dt className="k-label">Doors</dt>
              <dd className="tk-value">{WINTER.hours}</dd>
            </div>
          )}
        </dl>

        <div className="tk-cta">
          <Button
            href={url}
            external
            size="lg"
            className="tk-btn"
            icon={<ArrowUpRight className="w-btn__icon" size={16} />}
            aria-label={`${cta} on ${provider} (opens in a new tab)`}
          >
            {cta}
          </Button>
        </div>
      </div>
    </Section>
  );
}
