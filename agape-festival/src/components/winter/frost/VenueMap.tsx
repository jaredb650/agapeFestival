import {
  AVE_ANGLE,
  BLOCKS,
  I278_A,
  I278_B,
  PIERS,
  STATION,
  SUBWAY_NR,
  VENUE_ZONE,
  WATER,
  aveW,
  stU,
  toXY,
} from "@/components/winter/map/geo";

// The crop: the venue in the middle, the bay top left, the 36 St station bottom right.
const VIEW = { x: -760, y: -470, w: 1520, h: 940 };

const xy = (w: number, u: number) => toXY(w, u).map((n) => Math.round(n));

const [sx, sy] = xy(STATION[0], STATION[1]);
// Placed so each label also sits inside the square crop phones get.
const AVE_LABELS = [
  { text: "2nd Ave", at: xy(aveW(2) + 22, stU(30.6)) },
  { text: "3rd Ave", at: xy(aveW(3) + 22, stU(30.6)) },
  { text: "4th Ave", at: xy(aveW(4) + 22, stU(32.8)) },
];
const [vx, vy] = xy(aveW(2) - 30, stU(32.6));

/**
 * A calm locator map of Sunset Park: city blocks in a near-black step, the
 * bay darker, Industry City's blocks in deep red, the 36 St station as a
 * white dot. Geometry from the site's own street-grid model (map/geo.ts).
 */
export function VenueMap({ title }: { title: string }) {
  return (
    <svg className="fr-map" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice">
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} className="fr-map__land" />
      <path d={WATER} className="fr-map__water" />
      <path d={PIERS} className="fr-map__block" />
      <path d={BLOCKS} className="fr-map__block" />
      <path d={`${I278_A}${I278_B}`} className="fr-map__road" />
      <path d={SUBWAY_NR} className="fr-map__rail" />
      <path d={VENUE_ZONE} className="fr-map__venue" />
      {AVE_LABELS.map((l) => (
        <text key={l.text} className="fr-map__label" transform={`translate(${l.at[0]} ${l.at[1]}) rotate(${AVE_ANGLE})`}>
          {l.text}
        </text>
      ))}
      <text className="fr-map__label fr-map__label--venue" x={vx} y={vy}>
        Industry City
      </text>
      <circle cx={sx} cy={sy} r={9} className="fr-map__station" />
      <text className="fr-map__label fr-map__label--station" x={sx + 20} y={sy + 6}>
        36 St
      </text>
    </svg>
  );
}
