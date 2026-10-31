// Tile geometry for the artist profiler ("shard" tiles).
//
// Desktop: every length is in tile units (1 unit = --tw, the regular tile
// width, set per breakpoint in artist-select.css). Polygons are emitted in %
// of each tile's own box, so one definition drives the clip-path AND the SVG
// edge (a non-scaling stroke on the same points), and focus/hover rings follow
// the shape at every size.
//
// Shape: a parallelogram that leans OUTWARD (Day 1 wing "\", Day 2 wing "/")
// with the outer-top corner chamfered. Rows below shift inward by the skew so
// the slanted gaps run straight through both rows, and the two wings close
// into one chevron around the centre plates (emblem above, RANDOM below).
// The wings are the day split of the GRID only; the splash above shows one
// artist at a time.
//
// Mobile: one day at a time, square "PDA keys" in a centred two-row inverted
// pyramid (positions in square steps, see pyramidCells).

import type { DayNumber } from "@/data/winter";

export const U = {
  /** Tile height. */
  h: 0.84,
  /** Horizontal lean (top edge vs bottom edge). */
  sk: 0.22,
  /** Gap between neighbours along a row (measured horizontally). */
  g: 0.07,
  /** Gap between rows. */
  vg: 0.06,
  /** Outer-top chamfer: along the top edge / down the outer edge. */
  chx: 0.13,
  chy: 0.17,
  /** Width of the centre channel at the bottom of the grid. */
  gc: 1.14,
} as const;

/** Distance between neighbouring regular tiles. */
export const STEP = 1 - U.sk + U.g;
/** Top row capacity 5, bottom row capacity 4 (shifted inward by one skew). */
export const ROW_CAP = [5, 4] as const;
/** One wing: 5 top tiles + the top row's outward shift. */
export const WING_W = U.sk + (ROW_CAP[0] - 1) * STEP + 1;
/** Both wings and the centre channel. */
export const FIELD_W = 2 * WING_W + U.gc;
export const FIELD_H = 2 * U.h + U.vg;

export type Pt = readonly [number, number];

export interface Box {
  /** Desktop position + size, in units. */
  x: number;
  y: number;
  w: number;
  /** Outline in % of the box. */
  poly: Pt[];
}

const r = (n: number) => Math.round(n * 1000) / 1000;

/** Leaning shard, chamfered on the outer-top corner. `lean` 1 = Day 1 ("\"), 2 = Day 2 ("/"). */
function shard(w: number, lean: DayNumber): Pt[] {
  const sk = (U.sk / w) * 100;
  const cx = (U.chx / w) * 100;
  const cy = (U.chy / U.h) * 100;
  // Day 2 ("/", outer edge on the right), then mirrored for Day 1.
  const pts: Pt[] = [
    [sk, 0],
    [100 - cx, 0],
    [100 - (sk * cy) / 100, cy],
    [100 - sk, 100],
    [0, 100],
  ];
  return (lean === 2 ? pts : pts.map(([x, y]) => [100 - x, y] as Pt)).map(([x, y]) => [r(x), r(y)] as Pt);
}

/** Inverted trapezoid that fills the V between the wings. */
function wedge(w: number): Pt[] {
  const sk = r((U.sk / w) * 100);
  return [
    [0, 0],
    [100, 0],
    [r(100 - sk), 100],
    [sk, 100],
  ];
}

export const toClipPath = (poly: readonly Pt[]) => `polygon(${poly.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
export const toSvgPoints = (poly: readonly Pt[]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

/** Width of each tile when a bottom row holds fewer than 4: they stretch to the same outline. */
function bottomWidth(n: number) {
  if (n >= ROW_CAP[1]) return 1;
  const target = ROW_CAP[1] - (ROW_CAP[1] - 1) * (U.sk - U.g);
  return (target + (n - 1) * (U.sk - U.g)) / n;
}

const ROW_Y = (row: number) => row * (U.h + U.vg);

/**
 * Place one wing's tiles. `count` per row, k = 0 is the tile nearest the centre.
 * Returns boxes in [row][k] order.
 */
export function placeWing(day: DayNumber, rows: readonly [number, number]): Box[][] {
  return rows.map((count, row) => {
    const w = row === 0 ? 1 : bottomWidth(count);
    const pitch = w - U.sk + U.g;
    return Array.from({ length: count }, (_, k) => {
      // Offset of the tile's inner side from the wing's inner edge.
      const o = (row === 0 ? U.sk : 0) + k * pitch;
      return {
        x: day === 1 ? WING_W - o - w : WING_W + U.gc + o,
        y: ROW_Y(row),
        w,
        poly: shard(w, day),
      } satisfies Box;
    });
  });
}

/** RANDOM: the wedge in the bottom row of the centre channel. */
export function randomBox(): Box {
  const w = U.gc + 2 * U.sk - 2 * U.g;
  return { x: WING_W - U.sk + U.g, y: ROW_Y(1), w, poly: wedge(w) };
}

/** Emblem plate: the wider wedge in the top row of the centre channel. */
export function emblemBox(): Box {
  const w = U.gc + 4 * U.sk - 2 * U.g;
  return { x: WING_W - 2 * U.sk + U.g, y: 0, w, poly: wedge(w) };
}

// ---- Mobile: square keys in a centred inverted pyramid ---------------------

/** Square "PDA key": chamfered top-right and bottom-left corners (% of the box). */
export const SQUARE: readonly Pt[] = [
  [0, 0],
  [84, 0],
  [100, 16],
  [100, 100],
  [16, 100],
  [0, 84],
];

/** Inverted pyramid rows for `n` tiles with `cap` in the top row: cap 5 → 9 = 5·4, 8 = 5·3. */
export function pyramidRows(n: number, cap: number): number[] {
  const rows: number[] = [];
  let left = n;
  let c = cap;
  while (left > 0) {
    const k = Math.min(c, left);
    rows.push(k);
    left -= k;
    c = Math.max(1, c - 1);
  }
  return rows;
}

/** Smallest top row that fits `n` tiles in TWO pyramid rows (min 3): 9 → 5 (5·4), so Day 1's 8 sit 5·3. */
export const pyramidCap = (n: number) => Math.max(3, Math.ceil((n + 1) / 2));

/** Cell positions in square steps (x is fractional on short rows: they're centred). */
export function pyramidCells(n: number, cap: number): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  pyramidRows(n, cap).forEach((k, row) => {
    const x0 = (cap - k) / 2;
    for (let i = 0; i < k; i++) cells.push({ x: x0 + i, y: row });
  });
  return cells;
}

/** Inline CSS custom properties for a box (consumed by artist-select.css). */
export function boxVars(b: { x: number; y: number; w: number }) {
  return { "--x": r(b.x), "--y": r(b.y), "--w": r(b.w) } as Record<string, number>;
}
