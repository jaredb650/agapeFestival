import { AVENUES, STATION, STREETS, VENUE_ZONE, WALK, WATER, WORLD, at, aveW, stU, toXY } from "@/components/winter/map/geo";

const xy = (p: [number, number]) => toXY(p[0], p[1]);

/**
 * A plain street map of Sunset Park printed in grey on black: the bay, the
 * avenue/street grid, the 36 St station and the walk to Industry City, which
 * is the one red mark. Static SVG, no interaction.
 */
export function VenueMap({ title }: { title: string }) {
  const [sx, sy] = xy(STATION);
  const vb = `${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`;
  return (
    <figure className="pp-map">
      <svg className="pp-map__svg" viewBox={vb} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        <rect x={WORLD.x} y={WORLD.y} width={WORLD.w} height={WORLD.h} className="pp-map__land" />
        <path d={WATER} className="pp-map__water" />
        {STREETS.map((s) => (
          <path key={s.id} d={s.d} className="pp-map__street" data-major={s.major || undefined} />
        ))}
        {AVENUES.map((a) => (
          <path key={a.id} d={a.d} className="pp-map__street" data-major={a.major || undefined} />
        ))}
        <path d={VENUE_ZONE} className="pp-map__venue" />
        <path d={WALK} className="pp-map__walk" />
        <circle cx={sx} cy={sy} r={22} className="pp-map__station" />
      </svg>
      <span className="pp-map__label pp-map__label--venue" style={at(-101, stU(32.9))}>
        Industry City
      </span>
      <span className="pp-map__label pp-map__label--station" style={at(aveW(4), stU(36.9))}>
        36 St (D N R)
      </span>
      <span className="pp-map__label pp-map__label--water" style={at(760, stU(35))}>
        Upper Bay
      </span>
    </figure>
  );
}
