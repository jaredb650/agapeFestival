import { Section } from "@/components/winter/classic";
import { sentenceCase } from "@/components/winter/nav/sections";
import { ArrowRight } from "@/components/winter/ui";
import { ARTIST_BY_SLUG, LINEUP, type LineupAct, type LineupDay } from "@/data/winter";
import "@/styles/sections/lineup.css";

type Artist = Extract<LineupAct, { kind: "artist" }>;

/** "Friday, February 19, 2027" → "Friday, February 19". */
const dayDate = (d: LineupDay) => d.dateLong.replace(/,\s*\d{4}$/, "");

/** The flyer prints caps; the page uses the name as the data spells it ("Ben Klock", "Überkikz"). */
const nameOf = (act: Artist) => ARTIST_BY_SLUG[act.slug]?.name ?? act.displayName;

function Act({ act, linked }: { act: LineupAct; linked: boolean }) {
  if (act.kind === "tba") {
    return (
      <li className="lu-row lu-row--tba">
        <span className="lu-tba" aria-hidden="true">
          ???
        </span>
        <span className="k-label lu-tba__label">To be revealed</span>
      </li>
    );
  }
  const name = nameOf(act);
  if (!linked) {
    return (
      <li className="lu-row">
        <span className="lu-name">{name}</span>
      </li>
    );
  }
  // The roster (artist-select/Roster.tsx) listens for clicks on a[data-artist] and opens that act's bio.
  return (
    <li className="lu-row">
      <a className="lu-link" href="#artists" data-artist={act.slug}>
        <span className="lu-name">{name}</span>
        <span className="w-sr-only">, bio</span>
        <ArrowRight className="lu-arrow" size={16} />
      </a>
    </li>
  );
}

/**
 * The lineup, as the September site set its schedule: the two days side by side (stacked on phones), a
 * red day label over the date, then one row per act in flyer order, names in Orbitron. Unannounced slots
 * keep the old "to be revealed" treatment. No set times or stages beyond what is announced.
 * Server-rendered, no client JS.
 */
export function Lineup({ linkToSelect }: { linkToSelect: boolean }) {
  return (
    <Section id="lineup" title="Lineup" intro="One stage per day. Set times to be announced." className="lu">
      <div className="lu-days">
        {LINEUP.map((day) => {
          const headingId = `lineup-day-${day.day}`;
          return (
            <div key={day.day} className="lu-day">
              <div className="lu-day__head">
                <p className="k-label k-label--red">{sentenceCase(day.label)}</p>
                <h3 id={headingId} className="k-h2">
                  <time dateTime={day.isoDate}>{dayDate(day)}</time>
                </h3>
              </div>
              <ul className="lu-list" aria-labelledby={headingId} data-reveal="">
                {day.acts.map((act) => (
                  <Act key={act.kind === "artist" ? act.slug : act.id} act={act} linked={linkToSelect} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
