import { Button, Section } from "@/components/winter/classic";
import { sentenceCase } from "@/components/winter/nav/sections";
import { ArrowRight } from "@/components/winter/ui";
import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import { PromoCode } from "./PromoCode";
import "@/styles/sections/tickets.css";

/** "Friday, February 19, 2027" → "Friday, February 19". */
const dayDate = (dateLong: string) => dateLong.replace(/,\s*\d{4}$/, "");

/**
 * Tickets, classic: the September "Secure your entry" block, quieter. A centred display title over the
 * background footage, standing on its own reflection (a flipped copy under a mask fade, CSS only, kept
 * from the grid version). Then the facts as hairline rows (the days, the venue, doors once announced) and
 * one red Get tickets to DICE. Tiers and prices aren't published here (TODO_CONFIRM in winter.ts); they
 * live on the DICE page, so the section names none. The last row is the promo code (a tap copies it: the
 * one client island, PromoCode), and under the button a small Afterpay line. Otherwise server-rendered.
 */
export function Tickets() {
  const { provider, url, cta } = WINTER.tickets;
  const title = sentenceCase(TICKETS.eyebrow);
  const { promo, afterpay } = TICKETS;

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
          {promo.code && (
            <div className="tk-row tk-row--promo">
              <dt className="k-label">{promo.label}</dt>
              <dd className="tk-promo">
                <PromoCode code={promo.code} until={promo.until} />
                <span className="tk-promo__exp">Valid until {promo.expires}</span>
                <Button variant="link" href={promo.url} external className="tk-promo__apply" aria-label={`Apply promo code ${promo.code} on DICE (opens in a new tab)`}>
                  Apply on DICE
                </Button>
              </dd>
            </div>
          )}
        </dl>

        <div className="tk-cta">
          <Button href={url} external size="lg" className="tk-btn" aria-label={`${cta} on ${provider} (opens in a new tab)`}>
            {cta}
          </Button>
        </div>

        <p className="tk-pay">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 3 KB SVG mark; static export, no optimiser */}
          <img className="tk-pay__logo" src={afterpay.logo} width={72} height={14} alt="Afterpay" />
          <span className="tk-pay__note">{afterpay.note}</span>
        </p>
      </div>
    </Section>
  );
}
