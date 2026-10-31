import { BLOCKS, STATION, VENUE_BUILDINGS, VENUE_ZONE, WALK, WALK_TBA, WATER, toXY } from "@/components/winter/map/geo";
import { GETTING_HERE } from "@/data/winter";
import { ArrowIcon } from "./icons";
import { sentence } from "./labels";

const g = GETTING_HERE;
const APPLE_MAPS = `https://maps.apple.com/?daddr=${encodeURIComponent(g.address.full)}`;
// A crop of the geo.ts world (metres, venue at 0,0): about 1.8 km across, 16:10 like the frame,
// centred between the venue and the station so the bay doesn't take a corner.
const VB = { x: -795, y: -430, w: 1800, h: 1125 };
const [sx, sy] = toXY(STATION[0], STATION[1]);
/** Only the blocks inside the crop (the full grid is ~20 KB of path data). */
const inCrop = (d: string) =>
  (d.match(/-?[\d.]+ -?[\d.]+/g) ?? []).some((pt) => {
    const [x, y] = pt.split(" ").map(Number);
    return x > VB.x - 60 && x < VB.x + VB.w + 60 && y > VB.y - 60 && y < VB.y + VB.h + 60;
  });
const BLOCKS_IN_VIEW = (BLOCKS.match(/M[^Z]+Z/g) ?? []).filter(inCrop).join("");
const pos = (x: number, y: number) => ({ left: `${(((x - VB.x) / VB.w) * 100).toFixed(2)}%`, top: `${(((y - VB.y) / VB.h) * 100).toFixed(2)}%` });
const subway = g.cards.find((c) => c.id === "subway");

// The route list comes straight from GETTING_HERE; the subway card's "map link above" points at the directions link here.
const ROUTES = [
  ...g.cards.map((c) => ({
    id: c.id,
    label: sentence(c.label),
    title: c.id === "subway" && c.lines ? `${c.title} (${c.lines.map((l) => l.line).join(", ")})` : sentence(c.title).replace(/\b(bqe|i-278 w)\b/gi, (m) => m.toUpperCase()),
    body: c.body.replace(/the map link above/i, "the directions link"),
  })),
  { id: "bus", label: "Bus and Citi Bike", title: `Buses ${g.secondary.buses.join(", ")}`, body: `Citi Bike: ${g.secondary.citiBike}.` },
];

/**
 * A calm map (the Sunset Park street grid from map/geo.ts drawn in greys, the
 * venue as one red dot, the walk from the 36 St station dotted), the address,
 * directions links and the ways in.
 */
export function GettingHere() {
  return (
    <section id="getting-here" className="s-sec s-here" aria-labelledby="here-title">
      <header className="s-head" data-reveal="">
        <h2 id="here-title" className="s-title">
          Getting here
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">{g.intro}</p>
      </header>

      <div className="s-here__grid" data-reveal="">
        <figure className="s-map">
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Street map: ${g.mapTitle}, a short walk from the 36th St subway station`}>
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} className="s-map__land" />
            <path d={WATER} className="s-map__water" />
            <path d={BLOCKS_IN_VIEW} className="s-map__blocks" />
            <path d={VENUE_ZONE} className="s-map__zone" />
            <path d={VENUE_BUILDINGS} className="s-map__bldg" />
            <path d={WALK} className="s-map__walk" />
            <path d={WALK_TBA} className="s-map__walk" />
          </svg>
          <span className="s-map__dot" style={pos(sx, sy)} aria-hidden="true" />
          <span className="s-map__dot s-map__dot--venue" style={pos(0, 0)} aria-hidden="true" />
          <span className="s-map__label s-map__label--venue" style={pos(0, 0)} aria-hidden="true">
            Industry City
          </span>
          {subway && (
            <span className="s-map__label s-map__label--station" style={pos(sx, sy)} aria-hidden="true">
              {subway.title}
            </span>
          )}
        </figure>

        <div className="s-here__info">
          <address className="s-here__addr">
            {g.address.line1}
            <br />
            {g.address.line2}
          </address>
          <p className="s-here__links">
            <a className="s-btn s-btn--ghost" href={g.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              Directions
              <ArrowIcon />
            </a>
            <a className="s-link" href={APPLE_MAPS} target="_blank" rel="noopener noreferrer">
              Apple Maps
              <ArrowIcon />
            </a>
          </p>
          <dl className="s-routes">
            {ROUTES.map((r) => (
              <div key={r.id} className="s-routes__row">
                <dt>{r.label}</dt>
                <dd>
                  <span className="s-routes__title">{r.title}</span>
                  <span className="s-routes__body">{r.body}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
