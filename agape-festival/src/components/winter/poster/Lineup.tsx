import { ARTIST_BY_SLUG, LINEUP, TBA_LABEL, WINTER } from "@/data/winter";
import { CurrentDay } from "./CurrentDay";
import { SectionHead } from "./SectionHead";

const tba = TBA_LABEL.charAt(0) + TBA_LABEL.slice(1).toLowerCase();

/**
 * The lineup as a poster's typographic bill: Day 1 and Day 2 side by side,
 * every name set large in flyer order, unannounced slots greyed in place.
 * The next (or current) festival day is marked in red.
 */
export function Lineup({ index, linkToSelect }: { index: string; linkToSelect: boolean }) {
  return (
    <section id="lineup" className="pp-sec" aria-labelledby="lineup-title" data-reveal>
      <SectionHead
        index={index}
        id="lineup-title"
        title="Lineup"
        meta={
          <>
            {WINTER.venue.name}, {WINTER.venue.city}. One stage per day
          </>
        }
      />
      <div className="pp-bill">
        {LINEUP.map((day) => (
          <article key={day.day} id={`lineup-day-${day.day}`} className="pp-day" data-day={day.day} data-current={day.day === 1 || undefined} aria-labelledby={`lineup-day-${day.day}-label`}>
            <header className="pp-day__head">
              <h3 id={`lineup-day-${day.day}-label`} className="pp-day__label">
                Day {day.day}
              </h3>
              <p className="pp-day__date">
                <time dateTime={day.isoDate}>{day.dateLong.replace(/, \d{4}$/, "")}</time>
                <span className="pp-day__tag" data-day-tag>
                  {day.day === 1 ? "Up next" : ""}
                </span>
              </p>
            </header>
            <ol className="pp-day__acts">
              {day.acts.map((act, i) => {
                if (act.kind === "tba") {
                  return (
                    <li key={i} className="pp-act" data-tba="">
                      <span>{tba}</span>
                    </li>
                  );
                }
                const name = ARTIST_BY_SLUG[act.slug]?.name ?? act.displayName;
                return (
                  <li key={i} className="pp-act">
                    {linkToSelect ? (
                      <a href="#artists" data-artist={act.slug} aria-label={`${name}, open artist profile`}>
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </div>
      <p className="pp-bill__note">
        Set times will be announced closer to the festival.{linkToSelect ? " Select a name to open its profile." : ""}
      </p>
      <CurrentDay days={LINEUP.map((d) => d.isoDate)} />
    </section>
  );
}
