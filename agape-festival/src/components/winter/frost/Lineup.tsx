import { LINEUP } from "@/data/winter";
import { SectionHead } from "./SectionHead";
import { properName } from "./text";

/**
 * The lineup as set type: two days side by side, names in the serif, flyer
 * order. Unannounced slots collapse into one quiet line. With the roster on,
 * each name opens that artist's profile.
 */
export function Lineup({ linkToRoster }: { linkToRoster: boolean }) {
  return (
    <section id="lineup" className="fr-section" aria-labelledby="lineup-title" data-reveal="">
      <div className="fr-wrap fr-split">
        <SectionHead id="lineup-title" title="Lineup">
          <p>One stage each day. Set times will be announced closer to the festival.</p>
        </SectionHead>
        <div className="fr-days">
          {LINEUP.map((day) => {
            const named = day.acts.filter((a) => a.kind === "artist");
            const hidden = day.acts.length - named.length;
            return (
              <article key={day.day} className="fr-day" aria-labelledby={`lineup-day-${day.day}`}>
                <h3 id={`lineup-day-${day.day}`} className="fr-day__head">
                  <span>Day {day.day}</span>
                  <time dateTime={day.isoDate}>{day.dateLong.replace(/, \d{4}$/, "")}</time>
                </h3>
                <ul className="fr-day__acts">
                  {named.map((act) =>
                    act.kind === "artist" ? (
                      <li key={act.slug}>
                        {linkToRoster ? (
                          <a href="#artists" data-artist={act.slug}>
                            {properName(act.displayName)}
                          </a>
                        ) : (
                          properName(act.displayName)
                        )}
                      </li>
                    ) : null,
                  )}
                </ul>
                {hidden > 0 && <p className="fr-day__more">More to be revealed</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
