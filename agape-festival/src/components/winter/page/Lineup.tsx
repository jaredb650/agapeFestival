import { Fragment } from "react";
import { Cell, LinkCell, Row, SectionGrid, SectionHeader } from "@/components/winter/grid";
import { sentenceCase } from "@/components/winter/nav/sections";
import { ARTIST_BY_SLUG, LINEUP, type LineupAct, type LineupDay } from "@/data/winter";
import "@/styles/sections/lineup.css";

type Artist = Extract<LineupAct, { kind: "artist" }>;

/** "Friday, February 19, 2027" → "Friday, February 19". */
const dayDate = (d: LineupDay) => d.dateLong.replace(/,\s*\d{4}$/, "");

/** The flyer prints caps; the page uses the name as the data spells it ("Ben Klock", "Überkikz"). */
const nameOf = (act: Artist) => ARTIST_BY_SLUG[act.slug]?.name ?? act.displayName;

/** Column spans (of 12) for a flyer line of `n` acts: thirds for three, halves for two. Always sums to 12. */
function lineSpans(n: number): number[] {
  const base = Math.floor(12 / n);
  const extra = 12 % n;
  return Array.from({ length: n }, (_, i) => base + (i >= n - extra ? 1 : 0));
}

function Act({ act, span, linked }: { act: LineupAct; span: number; linked: boolean }) {
  if (act.kind === "tba") {
    return (
      <Cell as="li" span={span} x="center" y="center" className="lu-act">
        <span className="lu-act__tba">To be announced</span>
      </Cell>
    );
  }
  const name = nameOf(act);
  if (!linked) {
    return (
      <Cell as="li" span={span} x="center" y="center" className="lu-act">
        <span className="w-title">{name}</span>
      </Cell>
    );
  }
  // The roster (ArtistSelect) listens for clicks on a[data-artist] and opens that act's profile.
  return (
    <LinkCell listItem href="#artists" data-artist={act.slug} span={span} x="center" y="center" size="title" className="lu-act">
      {name}
      <span className="w-sr-only">, artist profile</span>
    </LinkCell>
  );
}

/**
 * The lineup, set the way the flyer sets it: each day is a heading band and a list of cells, and each
 * line of the flyer is one line of cells (three names take thirds, two take halves), names centred.
 * Unannounced slots say so. No set times or stages beyond what is announced. Server-rendered, no client JS.
 */
export function Lineup({ linkToSelect }: { linkToSelect: boolean }) {
  return (
    <SectionGrid id="lineup" labelledBy="lineup-title" className="lu">
      <SectionHeader
        id="lineup-title"
        title="Lineup"
        aside={
          <p>
            One stage per day.
            <br />
            Set times to be announced.
          </p>
        }
      />

      {LINEUP.map((day) => {
        const headingId = `lineup-day-${day.day}`;
        return (
          <Fragment key={day.day}>
            <Row>
              <Cell h={1} y="center">
                <h3 id={headingId} className="lu-day">
                  {sentenceCase(day.label)}{" "}
                  <time dateTime={day.isoDate} className="lu-day__date">
                    {dayDate(day)}
                  </time>
                </h3>
              </Cell>
            </Row>
            <Row as="ul" aria-labelledby={headingId}>
              {day.lines.flatMap((line) => {
                const spans = lineSpans(line.length);
                return line.map((act, i) => (
                  <Act key={act.kind === "artist" ? act.slug : act.id} act={act} span={spans[i]} linked={linkToSelect} />
                ));
              })}
            </Row>
          </Fragment>
        );
      })}
    </SectionGrid>
  );
}
