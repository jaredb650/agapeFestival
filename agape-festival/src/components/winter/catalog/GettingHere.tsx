import type { CSSProperties, ReactNode } from "react";
import { AVE_ANGLE, AV_GAP, SHORE, ST_GAP, aveW, stU, toXY } from "@/components/winter/map/geo";
import { GETTING_HERE } from "@/data/winter";
import { ARROW } from "./data";
import { Section } from "./Section";

const g = GETTING_HERE;
const subway = g.cards.find((c) => c.id === "subway");
const drive = g.cards.find((c) => c.id === "drive");

// ---- The map: true north up, metres, centred on Industry City (geo.ts grid) ----
const VB = { x: -900, y: -380, w: 1600, h: 800 };
const HALF_ST = 9;
/** (w, u) street-grid metres → SVG x/y. Blocks are drawn as plain rects in (w, u) space under this matrix. */
const [ax, ay] = toXY(1, 0);
const [bx, by] = toXY(0, 1);
const GRID = `matrix(${ax.toFixed(4)} ${ay.toFixed(4)} ${bx.toFixed(4)} ${by.toFixed(4)} 0 0)`;
/** Percent position of an SVG point inside the map box, for the HTML labels (they stay 12px at any width). */
const atXY = (x: number, y: number): CSSProperties => ({
  left: `${(((x - VB.x) / VB.w) * 100).toFixed(2)}%`,
  top: `${(((y - VB.y) / VB.h) * 100).toFixed(2)}%`,
});
const at = (w: number, u: number) => atXY(...toXY(w, u));

type R = [number, number, number, number];
const AVE = AV_GAP - 2 * HALF_ST;
const BLK = ST_GAP - 2 * HALF_ST;
/** City blocks between 1st and 7th Avenue, 22nd to 50th Street, minus Industry City's own blocks. */
const BLOCKS: R[] = [];
for (let n = 1; n <= 6; n++) {
  for (let k = 22; k < 50; k++) {
    if (n === 2 && k >= 33 && k < 37) continue;
    BLOCKS.push([aveW(n + 1) + HALF_ST, stU(k + 1) + HALF_ST, AVE, BLK]);
  }
}
// Waterfront strip (1st Ave to the bulkhead), two streets per block.
for (let k = 22; k < 50; k += 2) BLOCKS.push([aveW(1) + HALF_ST, stU(k + 2) + HALF_ST, SHORE - aveW(1) - HALF_ST - 4, ST_GAP + BLK]);

/** Industry City: 2nd to 3rd Avenue, 33rd to 37th Street. */
const VENUE: R = [aveW(3) + HALF_ST, stU(37) + HALF_ST, AVE, stU(33) - stU(37) - 2 * HALF_ST];
const STATION: [number, number] = [aveW(4), stU(36)];
const [sx, sy] = toXY(...STATION);

function VenueMap() {
  return (
    <figure className="cat-map">
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        role="img"
        aria-label="Map: Industry City fills the blocks between 2nd and 3rd Avenue from 33rd to 37th Street. The 36 St subway station is on 4th Avenue, one block east."
      >
        <g transform={GRID}>
          <g className="cat-map__blocks">
            {BLOCKS.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} />
            ))}
          </g>
          <line className="cat-map__subway" x1={aveW(4)} y1={-2000} x2={aveW(4)} y2={2000} />
          <rect className="cat-map__venue" x={VENUE[0]} y={VENUE[1]} width={VENUE[2]} height={VENUE[3]} />
          <path className="cat-map__walk" d={`M${STATION[0]} ${STATION[1]}H${aveW(3) + HALF_ST}`} />
          <circle className="cat-map__station" cx={STATION[0]} cy={STATION[1]} r={16} />
        </g>
      </svg>
      <span className="cat-map__label" data-strong="" style={at(0, 236)}>
        Industry City
      </span>
      <span className="cat-map__label" data-anchor="right" style={atXY(sx, sy)}>
        36 St
      </span>
      <span className="cat-map__label" data-road="" style={{ ...at(aveW(4) + 26, 300), "--r": `${AVE_ANGLE}deg` } as CSSProperties}>
        4th Ave
      </span>
      <span className="cat-map__label" data-water="" style={atXY(VB.x + 110, VB.y + 60)}>
        Upper Bay
      </span>
    </figure>
  );
}

const q = encodeURIComponent(g.address.full);

/** Address, transit and a small monochrome map, with plain directions links. */
export function GettingHere() {
  const lines = subway?.lines ?? [];
  const rows: [string, ReactNode][] = [
    ["Address", g.address.full],
    ["Entrance", g.entrance ?? "To be announced"],
    [
      "Subway",
      <>
        <span className="cat-lines" role="img" aria-label={`Lines ${lines.map((l) => l.line).join(", ")}`}>
          {lines.map((l) => (
            <span key={l.line} aria-hidden="true">
              {l.line}
            </span>
          ))}
        </span>{" "}
        to {subway?.title ?? "36th St Station"}, the closest stop
      </>,
    ],
    ["Drive", `${(drive?.title ?? "").replace("EXIT", "exit")}. ${drive?.body ?? ""}`],
    ["Rideshare", `Set your Uber or Lyft destination to ${g.address.full}`],
    ["Bus", g.secondary.buses.join(", ")],
    ["Citi Bike", g.secondary.citiBike],
  ];
  return (
    <Section id="getting-here" intro="Industry City is in Sunset Park, Brooklyn. Easy by subway, car or rideshare.">
      <dl className="cat-spec">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <VenueMap />
      <p className="cat-more">
        <a className="cat-link" href={g.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
          Directions in Google Maps {ARROW}
        </a>
        <a className="cat-link" href={`https://maps.apple.com/?daddr=${q}`} target="_blank" rel="noopener noreferrer">
          Apple Maps {ARROW}
        </a>
      </p>
    </Section>
  );
}
