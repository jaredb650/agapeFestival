import { ARTIST_BY_SLUG, LINEUP, WINTER } from "@/data/winter";
import { dayStamp } from "./labels";

/**
 * The lineup set like end credits: two centred columns, the day and its date
 * over each, names in flyer order. Unannounced slots read "To be revealed".
 * With the roster on, a name opens that act there.
 */
export function Lineup({ linkToRoster }: { linkToRoster: boolean }) {
  const stage = WINTER.stagesPerDay === 1 ? "One stage each day" : `${WINTER.stagesPerDay} stages each day`;
  return (
    <section id="lineup" className="s-sec s-lineup" aria-labelledby="lineup-title" data-bg-dim="0.8">
      <header className="s-head" data-reveal="">
        <h2 id="lineup-title" className="s-title">
          Lineup
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">{stage}. Set times to be announced.</p>
      </header>

      <div className="s-credits">
        {LINEUP.map((day) => (
          <div key={day.day} className="s-credits__day" data-reveal="">
            <h3 className="s-credits__head">
              <span>Day {day.day}</span>
              <time className="s-mono" dateTime={day.isoDate}>
                {dayStamp(day.isoDate)}
              </time>
            </h3>
            <ul className="s-credits__list">
              {day.acts.map((act) => {
                if (act.kind === "tba") {
                  return (
                    <li key={act.id} className="s-credits__tba">
                      To be revealed
                    </li>
                  );
                }
                const name = ARTIST_BY_SLUG[act.slug]?.name ?? act.displayName;
                return (
                  <li key={act.slug}>
                    {linkToRoster ? (
                      <a className="s-credits__name" href="#artists" data-pick={act.slug}>
                        {name}
                      </a>
                    ) : (
                      <span className="s-credits__name">{name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
