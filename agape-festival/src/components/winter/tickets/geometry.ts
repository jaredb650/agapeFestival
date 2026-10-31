// Pass silhouette, authored once in a 200x300 box (the pass is always 2:3) and
// emitted as both a CSS clip-path (percentages, so it scales with the pass) and
// an SVG outline path (viewBox 0 0 200 300, non-scaling stroke).
//
// Shape: big chamfers top-left / bottom-right, small ones on the other two
// corners (the button/frame language), V notches either side of the tear line,
// and a punched lanyard slot near the top (an even-odd hole).

type Pt = readonly [number, number];

/** Tear line between the pass and its stub, in box units (of 300). */
export const TEAR_Y = 232;

const OUTER: Pt[] = [
  [16, 0],
  [195, 0],
  [200, 5],
  [200, TEAR_Y - 7],
  [193, TEAR_Y],
  [200, TEAR_Y + 7],
  [200, 284],
  [184, 300],
  [5, 300],
  [0, 295],
  [0, TEAR_Y + 7],
  [7, TEAR_Y],
  [0, TEAR_Y - 7],
  [0, 16],
];

const SLOT: Pt[] = [
  [85, 11],
  [115, 11],
  [117, 13],
  [117, 17],
  [115, 19],
  [85, 19],
  [83, 17],
  [83, 13],
];

const num = (n: number) => +n.toFixed(3);
const pct = ([x, y]: Pt) => `${num(x / 2)}% ${num(y / 3)}%`;

/** clip-path for the pass body (outer silhouette minus the lanyard slot). */
export const PASS_CLIP = `polygon(evenodd, ${[...OUTER, OUTER[0], ...SLOT, SLOT[0]].map(pct).join(", ")})`;

const sub = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;

/** Outline of the silhouette and the slot, for the luminous edge. */
export const PASS_OUTLINE = `${sub(OUTER)}${sub(SLOT)}`;

/** Tear line as a % of the pass height (for the perforation row). */
export const TEAR_PCT = `${num((TEAR_Y / 300) * 100)}%`;
