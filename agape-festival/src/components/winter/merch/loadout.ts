// Loadout data for the merch armory: derived from MERCH_ITEMS without adding
// facts. Class and artwork come from the item name ("INFERNO TEE" → art
// INFERNO, class TEE); anything that doesn't parse falls back to APPAREL.

import type { MerchItem } from "@/data/winter";
import type { Pt } from "@/components/winter/artist-select/geometry";

export type View = "back" | "front";
export type Side = 1 | 2;

export interface Gear {
  item: MerchItem;
  /** 1-based slot number. */
  n: number;
  /** Artwork series, e.g. "INFERNO". */
  art: string;
  /** Garment class, e.g. "TEE". */
  cls: string;
  /** Product page in the shop. */
  href: string;
}

const CLASSES = ["TEE", "HOODIE", "LONGSLEEVE", "CREWNECK", "SWEATSHIRT", "JACKET", "HAT", "CAP", "BEANIE", "TOTE", "SHORTS", "PANTS"];

export function toGear(items: readonly MerchItem[], productUrl: (handle: string) => string): Gear[] {
  return items.map((item, i) => {
    const words = item.name.trim().toUpperCase().split(/\s+/);
    const last = words[words.length - 1] ?? "";
    const known = words.length > 1 && CLASSES.includes(last);
    return {
      item,
      n: i + 1,
      art: known ? words.slice(0, -1).join(" ") : words.join(" "),
      cls: known ? last : "APPAREL",
      href: productUrl(item.handle),
    };
  });
}

/** Left wing = first half, right wing = the rest (today: INFERNO pair | LIBERTY pair). */
export function splitWings<T>(list: readonly T[]): [T[], T[]] {
  const half = Math.ceil(list.length / 2);
  return [list.slice(0, half), list.slice(half)];
}

/** The wing's shared artwork, or null when it mixes series. */
export const wingArt = (wing: readonly Gear[]) => (wing.length && wing.every((g) => g.art === wing[0].art) ? wing[0].art : null);

export const pad2 = (n: number) => String(n).padStart(2, "0");

// ---- Slot shapes ------------------------------------------------------------
// The artist select's shard, in % of each slot's box: a parallelogram leaning
// outward with the outer-top corner chamfered. Side 1 (left wing) leans "\",
// side 2 leans "/". `desk` = the wide stacked slots, `rail` = the phone rail.

function shard(sk: number, cx: number, cy: number, side: Side): Pt[] {
  const pts: Pt[] = [
    [sk, 0],
    [100 - cx, 0],
    [100 - (sk * cy) / 100, cy],
    [100 - sk, 100],
    [0, 100],
  ];
  return (side === 2 ? pts : pts.map(([x, y]) => [100 - x, y] as Pt)).map(([x, y]) => [Math.round(x * 100) / 100, y] as Pt);
}

export const SLOT_SHAPES: Record<"desk" | "rail", Record<Side, Pt[]>> = {
  desk: { 1: shard(9, 6, 22, 1), 2: shard(9, 6, 22, 2) },
  rail: { 1: shard(22, 13, 22, 1), 2: shard(22, 13, 22, 2) },
};

/** Phone rail centre wedge (0.8 tile wide; its sides run parallel to the neighbours' 0.22 lean). */
export const WEDGE: Pt[] = [
  [0, 0],
  [100, 0],
  [72.5, 100],
  [27.5, 100],
];
