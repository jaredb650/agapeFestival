// Deprecated. The roster's shard geometry is gone (the grid redesign uses plain cells). These three
// helpers stay only because the Merch section (MerchCard, merch/Armory, merch/loadout) still imports
// them; delete this file once it no longer does.

export type Pt = readonly [number, number];

export const toClipPath = (poly: readonly Pt[]) => `polygon(${poly.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
export const toSvgPoints = (poly: readonly Pt[]) => poly.map(([x, y]) => `${x},${y}`).join(" ");
