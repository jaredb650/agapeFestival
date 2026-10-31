// Geometry for the Getting Here map: a stylised, north-up drawing of the
// Industry City / Sunset Park street grid.
//
// Map space is metres. `w` runs along the numbered streets toward the bay
// (NW), measured from the venue centreline (midway between 2nd and 3rd Ave);
// `u` runs along the avenues toward NE, measured from 35th St. Sunset Park's
// avenues bear ~38° (fitted from the 36 St and 59 St stations on 4th Ave),
// numbered streets ~80 m apart, avenues ~220 m apart. Stylised, not survey
// grade: it only has to put the venue, the 4th Ave subway, 3rd Ave's I-278
// and the bay in the right relationship.

/** The transport modes, in the order of the route tabs. */
export type RouteMode = "subway" | "drive" | "ride" | "bike";

/** A map point: [w, u] in metres. */
export type Pt = readonly [w: number, u: number];

const D2R = Math.PI / 180;
const BEARING = 38;
/** Unit vector along an avenue toward NE, in SVG space (x = east, y = south). */
const AV = [Math.sin(BEARING * D2R), -Math.cos(BEARING * D2R)] as const;
/** Unit vector along a numbered street toward the bay (NW). */
const ST = [-Math.cos(BEARING * D2R), -Math.sin(BEARING * D2R)] as const;

/** On-screen angle (deg) of text set along an avenue. */
export const AVE_ANGLE = Math.round(Math.atan2(AV[1], AV[0]) / D2R); // -52

const AV_GAP = 220;
const ST_GAP = 80;
/** Half a street's width: the venue block is inset by this. */
const HALF_ST = 9;
/** Bulkhead line (the shore), in w. */
const SHORE = 450;
/** How far the lines run past the visible box, in m. */
const U_SPAN = 1500;
const W_FAR = -1500;

export const aveW = (n: number) => (2.5 - n) * AV_GAP; // 2nd Ave → 110, 3rd → -110, 4th → -330
export const stU = (k: number) => (35 - k) * ST_GAP; // 35th → 0, 36th → -80, 32nd → 240

/** World (the SVG viewBox), centred on the venue. Aspect 1.6 (getting-here.css sizes the box to cover). */
export const WORLD = { x: -1200, y: -750, w: 2400, h: 1500 } as const;

function toXY([w, u]: Pt): [number, number] {
  return [w * ST[0] + u * AV[0], w * ST[1] + u * AV[1]];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const pct = ([x, y]: [number, number]) => ({
  left: `${r1(((x - WORLD.x) / WORLD.w) * 100)}%`,
  top: `${r1(((y - WORLD.y) / WORLD.h) * 100)}%`,
});

/** CSS position (percent of the world box) of a map point. */
export const at = (p: Pt) => pct(toXY(p));

/** CSS for a straight route line drawn in HTML: its start, its length (percent of the world box's width) and its angle. */
export function seg(a: Pt, b: Pt) {
  const [x0, y0] = toXY(a);
  const [x1, y1] = toXY(b);
  return {
    ...pct([x0, y0]),
    width: `${r1((Math.hypot(x1 - x0, y1 - y0) / WORLD.w) * 100)}%`,
    "--a": `${Math.round((Math.atan2(y1 - y0, x1 - x0) / D2R) * 10) / 10}deg`,
  };
}

// ---------------------------------------------------------------- paths (one per layer)

const pt = (p: Pt) => toXY(p).map(r1).join(" ");
const line = (a: Pt, b: Pt) => `M${pt(a)}L${pt(b)}`;

/** Avenues 1st → 9th. */
export const AVENUES_D = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => line([aveW(n), U_SPAN], [aveW(n), -U_SPAN])).join("");

/** Numbered streets 18th → 52nd, from the shore inland. */
export const STREETS_D = Array.from({ length: 35 }, (_, i) => 18 + i)
  .map((k) => line([SHORE, stU(k)], [W_FAR, stU(k)]))
  .join("");

export const SHORE_D = line([SHORE, U_SPAN], [SHORE, -U_SPAN]);

/** Industry City: the 2nd–3rd Ave blocks from 33rd to 37th St. */
export const VENUE_D = (() => {
  const w0 = aveW(3) + HALF_ST;
  const w1 = aveW(2) - HALF_ST;
  const u0 = stU(33) - HALF_ST;
  const u1 = stU(37) + HALF_ST;
  return `M${pt([w0, u0])}L${pt([w1, u0])}L${pt([w1, u1])}L${pt([w0, u1])}Z`;
})();

// ---------------------------------------------------------------- places (from GETTING_HERE)

/** 36 St station: 4th Ave at 36th St. */
export const STATION: Pt = [aveW(4), stU(36)];
/** Lots B + C entry: 2nd Ave + 37th St. */
export const LOTS: Pt = [aveW(2), stU(37)];
/** Rideshare: the address, on 2nd Ave between 35th and 36th St. */
export const DROP: Pt = [aveW(2), stU(35.75)];
/** Citi Bike: 2nd Ave + 32 St (closest) and 3rd Ave + 36 St. */
export const BIKE_A: Pt = [aveW(2), stU(32)];
export const BIKE_B: Pt = [aveW(3), stU(36)];

/** The line each mode draws when it is picked. */
export const ROUTE_LINES: Record<RouteMode, readonly [Pt, Pt]> = {
  // Walk: along 36th St from the station to the venue's 3rd Ave side (the gate is not announced).
  subway: [STATION, [aveW(3) + HALF_ST, stU(36)]],
  // I-278 rides above 3rd Ave; drawn north-east to south-west, the way the westbound road runs.
  // It spans the widest map's height (22nd to 46th St), so the whole draw happens on screen.
  drive: [
    [aveW(3), stU(22)],
    [aveW(3), stU(46)],
  ],
  // The 2nd Ave curb at the address.
  ride: [
    [aveW(2) - 2, stU(35.2)],
    [aveW(2) - 2, stU(36.3)],
  ],
  // From the closest dock down 2nd Ave to the venue's corner at 33rd St.
  bike: [BIKE_A, [aveW(2), stU(33) - HALF_ST]],
};
