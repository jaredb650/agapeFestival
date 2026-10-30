// Tile geometry for the artist select ("shard" tiles).
//
// Every length is in tile units (1 unit = --tw, the regular tile width, set
// per breakpoint in artist-select.css). Polygons are emitted in % of each
// tile's own box, so one definition drives the clip-path AND the SVG edge
// (a non-scaling stroke on the same points), and focus/hover rings follow the
// shape at every size.
//
// Shape: a parallelogram that leans OUTWARD (Day 1 wing "\", Day 2 wing "/")
// with the outer-top corner chamfered. Rows below shift inward by the skew so
// the slanted gaps run straight through both rows, and the two wings close
// into one chevron around the centre plates (emblem above, RANDOM below).

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
  /** Mobile: gap between the stacked blocks (wing / centre strip / wing). */
  mg: 0.2,
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
/** Mobile (stacked): wing, centre strip, wing. */
export const MOBILE_W = WING_W;
export const MOBILE_H = 2 * FIELD_H + U.h + 2 * U.mg;

export type Pt = readonly [number, number];

export interface Box {
  /** Desktop (split) position + size, in units. */
  x: number;
  y: number;
  w: number;
  /** Mobile (stacked) position, in units. Same width. */
  mx: number;
  my: number;
  /** Outline in % of the box. */
  poly: Pt[];
}

const r = (n: number) => Math.round(n * 1000) / 1000;

/** Leaning shard, chamfered on the outer-top corner. `lean` 1 = Day 1 ("\"), 2 = Day 2 ("/"). */
function shard(w: number, lean: DayNumber, chamfer = true): Pt[] {
  const sk = (U.sk / w) * 100;
  const cx = (U.chx / w) * 100;
  const cy = (U.chy / U.h) * 100;
  // Day 2 ("/", outer edge on the right), then mirrored for Day 1.
  const pts: Pt[] = chamfer
    ? [
        [sk, 0],
        [100 - cx, 0],
        [100 - (sk * cy) / 100, cy],
        [100 - sk, 100],
        [0, 100],
      ]
    : [
        [sk, 0],
        [100, 0],
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

export const toClipPath = (poly: Pt[]) => `polygon(${poly.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
export const toSvgPoints = (poly: Pt[]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

/** Width of each tile when a bottom row holds fewer than 4: they stretch to the same outline. */
function bottomWidth(n: number) {
  if (n >= ROW_CAP[1]) return 1;
  const target = ROW_CAP[1] - (ROW_CAP[1] - 1) * (U.sk - U.g);
  return (target + (n - 1) * (U.sk - U.g)) / n;
}

const ROW_Y = (row: number) => row * (U.h + U.vg);
/** Mobile: where the Day 2 wing starts. */
const MOBILE_D2_Y = FIELD_H + U.mg + U.h + U.mg;

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
      const y = ROW_Y(row);
      const xLeftWing = WING_W - o - w;
      return {
        x: day === 1 ? xLeftWing : WING_W + U.gc + o,
        y,
        w,
        mx: day === 1 ? xLeftWing : o,
        my: day === 1 ? y : MOBILE_D2_Y + y,
        poly: shard(w, day),
      } satisfies Box;
    });
  });
}

/** RANDOM: the wedge in the bottom row of the centre channel. */
export function randomBox(): Box {
  const w = U.gc + 2 * U.sk - 2 * U.g;
  return {
    x: WING_W - U.sk + U.g,
    y: ROW_Y(1),
    w,
    mx: (MOBILE_W - w) / 2,
    my: FIELD_H + U.mg,
    poly: wedge(w),
  };
}

/** Emblem plate: the wider wedge in the top row of the centre channel (desktop only). */
export function emblemBox(): Box {
  const w = U.gc + 4 * U.sk - 2 * U.g;
  return { x: WING_W - 2 * U.sk + U.g, y: 0, w, mx: 0, my: 0, poly: wedge(w) };
}

/** Mobile centre strip: the two day plates either side of RANDOM, parallel to its slanted sides. */
export function mobilePlates(): Record<DayNumber, { mx: number; my: number; w: number; poly: Pt[] }> {
  const rnd = randomBox();
  const my = rnd.my;
  // Left plate leans like the Day 1 wing; its right edge runs parallel to RANDOM's left edge.
  const lw = rnd.mx - U.g + U.sk;
  const rx = rnd.mx + rnd.w + U.g - U.sk;
  const rw = MOBILE_W - rx;
  return {
    1: { mx: 0, my, w: lw, poly: shard(lw, 1, false) },
    2: { mx: rx, my, w: rw, poly: shard(rw, 2, false) },
  };
}

/** Inline CSS custom properties for a box (consumed by artist-select.css). */
export function boxVars(b: { x?: number; y?: number; w: number; mx: number; my: number }) {
  return {
    "--x": r(b.x ?? 0),
    "--y": r(b.y ?? 0),
    "--w": r(b.w),
    "--mx": r(b.mx),
    "--my": r(b.my),
  } as Record<string, number>;
}
