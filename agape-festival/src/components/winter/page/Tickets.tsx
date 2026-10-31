import { Cell, LinkCell, Row, SectionGrid } from "@/components/winter/grid";
import { sentenceCase } from "@/components/winter/nav/sections";
import { TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import "@/styles/sections/tickets.css";

/** "FRI FEB 19" → "Feb 19". */
const monthDay = (date: string) => {
  const [, month, day] = date.split(" ");
  return `${month.charAt(0)}${month.slice(1).toLowerCase()} ${day}`;
};

/**
 * Tickets, on the grid. The title stands on a hairline and its reflection hangs below it (a flipped
 * copy under a mask fade, CSS only). Then one band: the red ticket cell beside four facts from the data.
 * Tiers and prices aren't published here (TODO_CONFIRM in winter.ts); they live on the DICE page, so the
 * section names none. Server-rendered, no client JS.
 */
export function Tickets() {
  const { provider, url, cta } = WINTER.tickets;
  const title = sentenceCase(TICKETS.eyebrow);

  return (
    <SectionGrid id="tickets" labelledBy="tickets-title" className="tk">
      <Row>
        <Cell h={3} y="end" className="tk-head">
          <h2 id="tickets-title" className="w-display tk-word">
            {title}
          </h2>
        </Cell>
      </Row>

      {/* The reflection: the row's top hairline is the surface the title stands on. */}
      <Row aria-hidden="true">
        <Cell className="tk-mirror">
          <span className="w-display tk-word tk-word--mirror">{title}</span>
        </Cell>
      </Row>

      <Row>
        <LinkCell
          href={url}
          external
          variant="primary"
          size="title"
          h={4}
          label={`On sale now via ${provider}`}
          className="tk-ticket"
          aria-label={`${cta} on ${provider} (opens in a new tab)`}
        >
          {cta}
        </LinkCell>
        {WINTER_DAYS.map((day) => (
          <Cell key={day.day} as="dl" spanSm={2} y="between" className="tk-fact">
            <dt className="tk-fact__k">{day.weekday}</dt>
            <dd className="w-title w-num">
              <time dateTime={day.isoDate}>{monthDay(day.date)}</time>
            </dd>
          </Cell>
        ))}
        <LinkCell href="#getting-here" icon="arrow" size="title" label="Venue" className="tk-fact">
          {WINTER.venue.name}
        </LinkCell>
        <Cell as="dl" y="between" className="tk-fact">
          <dt className="tk-fact__k">Doors</dt>
          <dd className="w-title" data-tba={WINTER.hours ? undefined : ""}>
            {WINTER.hours ?? "To be announced"}
          </dd>
        </Cell>
      </Row>
    </SectionGrid>
  );
}
