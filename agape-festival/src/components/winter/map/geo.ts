// Geometry for the Getting Here tactical map: a stylised, true-north-up
// blueprint of the Industry City / Sunset Park street grid.
//
// Map space is metres. `w` runs along the numbered streets toward the bay
// (NW), measured from the venue centreline (midway between 2nd and 3rd Ave);
// `u` runs along the avenues toward NE, measured from 35th St. Sunset Park's
// avenues bear ~38° (fitted from the 36 St and 59 St stations on 4th Ave),
// numbered streets ~80 m apart, avenues ~220 m apart. Stylised, not survey
// grade: it only has to put the venue, the 4th Ave subway, 3rd Ave's I-278
// and the bay in the right relationship.

/** Venue anchor (Industry City). */
export const VENUE = { lat: 40.6559, lon: -74.0076 } as const;

const D2R = Math.PI / 180;
const BEARING = 38;
/** Unit vector along an avenue toward NE, in SVG space (x = east, y = south). */
const AV: [number, number] = [Math.sin(BEARING * D2R), -Math.cos(BEARING * D2R)];
/** Unit vector along a numbered street toward the bay (NW). */
const ST: [number, number] = [-Math.cos(BEARING * D2R), -Math.sin(BEARING * D2R)];

/** On-screen angle (deg) for text running along an avenue / a street. */
export const AVE_ANGLE = Math.round(Math.atan2(AV[1], AV[0]) / D2R); // -52
export const ST_ANGLE = Math.round(Math.atan2(-ST[1], -ST[0]) / D2R); // 38

export const AV_GAP = 220;
export const ST_GAP = 80;
/** Half the street width: blocks are inset by this. */
const HALF_ST = 9;
/** Bulkhead line (shore), in w. */
export const SHORE = 450;

export const aveW = (n: number) => (2.5 - n) * AV_GAP; // 2nd Ave → 110, 3rd → -110, 4th → -330
export const stU = (k: number) => (35 - k) * ST_GAP; // 35th → 0, 36th → -80, 32nd → 240

/** World (SVG viewBox), centred on the venue. Aspect 1.6. */
export const WORLD = { x: -1200, y: -750, w: 2400, h: 1500 } as const;
export const WORLD_AR = WORLD.w / WORLD.h;

export function toXY(w: number, u: number): [number, number] {
  return [w * ST[0] + u * AV[0], w * ST[1] + u * AV[1]];
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** CSS position (percent of the world box) for a map point. */
export function at(w: number, u: number) {
  const [x, y] = toXY(w, u);
  return { left: `${r1(((x - WORLD.x) / WORLD.w) * 100)}%`, top: `${r1(((y - WORLD.y) / WORLD.h) * 100)}%` };
}

const M_PER_DEG_LAT = 111_320;
const M_PER_DEG_LON = M_PER_DEG_LAT * Math.cos(VENUE.lat * D2R);

/** World fraction (0..1, 0..1) → lat/lon. */
export function latLonAt(fx: number, fy: number) {
  const x = WORLD.x + fx * WORLD.w;
  const y = WORLD.y + fy * WORLD.h;
  return { lat: VENUE.lat - y / M_PER_DEG_LAT, lon: VENUE.lon + x / M_PER_DEG_LON, dist: Math.hypot(x, y) };
}

export const fmtLat = (lat: number, dp = 4) => `${Math.abs(lat).toFixed(dp)}° ${lat >= 0 ? "N" : "S"}`;
export const fmtLon = (lon: number, dp = 4) => `${Math.abs(lon).toFixed(dp)}° ${lon >= 0 ? "E" : "W"}`;

// ---------------------------------------------------------------- paths

const pt = (w: number, u: number) => toXY(w, u).map((n) => r1(n)).join(" ");
const poly = (pts: [number, number][]) => `M${pts.map(([w, u]) => pt(w, u)).join("L")}Z`;
const rect = (w0: number, w1: number, u0: number, u1: number) =>
  poly([
    [w0, u0],
    [w1, u0],
    [w1, u1],
    [w0, u1],
  ]);

export interface Seg {
  id: string;
  d: string;
  major?: boolean;
}

const U_SPAN = 1700;
const W_FAR = -1700;

/** Avenue centrelines, 1st → 10th Ave. */
export const AVENUES: Seg[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  id: `a${n}`,
  d: `M${pt(aveW(n), U_SPAN)}L${pt(aveW(n), -U_SPAN)}`,
  major: n === 4,
}));

/** Numbered streets, 15th → 55th St (bay to the far edge). */
export const STREETS: Seg[] = Array.from({ length: 41 }, (_, i) => 15 + i).map((k) => ({
  id: `s${k}`,
  d: `M${pt(SHORE, stU(k))}L${pt(W_FAR, stU(k))}`,
  major: k === 36 || k === 39,
}));

/** City blocks (one path): faint tiles between the streets. The bay column is the marine terminal, merged in pairs. */
export const BLOCKS = (() => {
  const out: string[] = [];
  const cols: [number, number][] = [];
  for (let n = 1; n <= 9; n++) cols.push([aveW(n + 1) + HALF_ST, aveW(n) - HALF_ST]);
  for (let k = 15; k < 55; k++) {
    const u0 = stU(k) - HALF_ST;
    const u1 = stU(k + 1) + HALF_ST;
    for (const [w0, w1] of cols) {
      // Industry City's own blocks are drawn separately.
      if (w1 > 0 && w0 < 0 && k >= 33 && k < 37) continue;
      out.push(rect(w0, w1, u0, u1));
    }
  }
  // Waterfront terminal strip (1st Ave → bulkhead), two streets per tile.
  for (let k = 15; k < 55; k += 2) out.push(rect(aveW(1) + HALF_ST, SHORE - 4, stU(k) - HALF_ST, stU(k + 2) + HALF_ST));
  return out.join("");
})();

/** Industry City: the 2nd–3rd Ave blocks from 33rd to 37th St, plus the long buildings either side of each courtyard. */
export const VENUE_ZONE = rect(aveW(3) + HALF_ST, aveW(2) - HALF_ST, stU(33) - HALF_ST, stU(37) + HALF_ST);
export const VENUE_BUILDINGS = (() => {
  const out: string[] = [];
  const w0 = aveW(3) + HALF_ST + 4;
  const w1 = aveW(2) - HALF_ST - 4;
  for (let k = 33; k < 37; k++) {
    const top = stU(k) - HALF_ST - 3;
    const bot = stU(k + 1) + HALF_ST + 3;
    const depth = (top - bot) * 0.34;
    out.push(rect(w0, w1, top, top - depth), rect(w0, w1, bot + depth, bot));
  }
  return out.join("");
})();

/** The bay: everything beyond the bulkhead. */
export const WATER = poly([
  [SHORE, U_SPAN],
  [SHORE, -U_SPAN],
  [SHORE + 2600, -U_SPAN],
  [SHORE + 2600, U_SPAN],
]);
export const SHORELINE = `M${pt(SHORE, U_SPAN)}L${pt(SHORE, -U_SPAN)}`;
/** Terminal piers (stylised). */
export const PIERS = [380, 170, -40, -250, -470].map((u) => rect(SHORE - 2, SHORE + 250, u + 30, u - 30)).join("");

// ---------------------------------------------------------------- transit (from GETTING_HERE content)

/** 36 St station sits on 4th Ave at 36th St. */
export const STATION: [number, number] = [aveW(4), stU(36)];
/** Subway under 4th Ave: two parallel route lines (D orange, N/R yellow). */
export const SUBWAY_D = `M${pt(aveW(4) + 6, U_SPAN)}L${pt(aveW(4) + 6, -U_SPAN)}`;
export const SUBWAY_NR = `M${pt(aveW(4) - 6, U_SPAN)}L${pt(aveW(4) - 6, -U_SPAN)}`;
/** Walk: along 36th St from the station to the venue's 3rd Ave edge, then a dotted leg to the target (gate TBA). */
export const WALK = `M${pt(STATION[0], STATION[1])}L${pt(aveW(3) + HALF_ST, stU(36))}`;
export const WALK_TBA = `M${pt(aveW(3) + HALF_ST, stU(36))}L${pt(-40, stU(36))}L${pt(0, 0)}`;
/** I-278 (Gowanus / BQE) rides above 3rd Ave. */
export const I278_A = `M${pt(aveW(3) + 7, U_SPAN)}L${pt(aveW(3) + 7, -U_SPAN)}`;
export const I278_B = `M${pt(aveW(3) - 7, U_SPAN)}L${pt(aveW(3) - 7, -U_SPAN)}`;
/** Lots B + C entry: 2nd Ave + 37th St. */
export const LOTS: [number, number] = [aveW(2), stU(37)];
/** Rideshare drop: the venue address on 2nd Ave (between 35th and 36th St). */
export const DROP: [number, number] = [aveW(2), stU(35.75)];
export const DROP_CURB = `M${pt(aveW(2) - 2, stU(35.2))}L${pt(aveW(2) - 2, stU(36.3))}`;
/** Citi Bike: 2nd Ave + 32 St (closest) and 3rd Ave + 36 St. */
export const BIKE_A: [number, number] = [aveW(2), stU(32)];
export const BIKE_B: [number, number] = [aveW(3), stU(36)];

/** Distance rings (m). */
export const RINGS = [250, 500] as const;
