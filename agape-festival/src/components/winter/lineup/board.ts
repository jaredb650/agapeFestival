import { ARTIST_BY_SLUG, LINEUP, type DayNumber, type LineupAct, type LineupDay } from "@/data/winter";

/** Fired on window when a lineup name is clicked while the artist profiler is on. detail: { slug }. */
export const LINEUP_PICK_EVENT = "w:lineup-pick";

export interface BoardRow {
  act: LineupAct;
  day: DayNumber;
  /** 1-based running index across both days (the outlined number, the ticker). */
  n: number;
  /** 0-based position within the day (stagger). */
  k: number;
}

export interface BoardDay {
  info: LineupDay;
  rows: BoardRow[];
  named: number;
  locked: number;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2027-02-19" → "02.19.27". */
export function dotDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${m}.${d}.${y.slice(2)}`;
}

/** Both days in flyer order, numbered 01…NN straight through (Day 1 first). */
export function buildBoard(): BoardDay[] {
  let n = 0;
  return LINEUP.map((info) => {
    const rows = info.acts.map((act, k) => ({ act, day: info.day, n: ++n, k }));
    const named = rows.filter((r) => r.act.kind === "artist").length;
    return { info, rows, named, locked: rows.length - named };
  });
}

/** Proper-cased name for screen readers (the board shows the flyer's caps). */
export function spokenName(act: LineupAct) {
  return act.kind === "artist" ? (ARTIST_BY_SLUG[act.slug]?.name ?? act.displayName) : null;
}

// ---- Bezel ---------------------------------------------------------------

export interface BezelSpec {
  /** corner chamfer */
  c: number;
  /** notch floor width */
  nw: number;
  /** notch depth */
  nd: number;
  /** notch slope run */
  ns: number;
}

export const BEZEL_WIDE: BezelSpec = { c: 22, nw: 208, nd: 22, ns: 22 };
export const BEZEL_NARROW: BezelSpec = { c: 12, nw: 132, nd: 17, ns: 14 };

/** Chamfered rectangle with a notch dipping into the top-centre edge, inset by `i`. */
export function bezelPath(w: number, h: number, i: number, { c: c0, nw, nd, ns }: BezelSpec) {
  const c = c0 - i * 0.42;
  const l = i + 0.5;
  const t = i + 0.5;
  const r = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const half = nw / 2 - (i ? i * 0.42 : 0);
  return [
    `M${l + c} ${t}`,
    `H${mid - half - ns}`,
    `L${mid - half} ${t + nd}`,
    `H${mid + half}`,
    `L${mid + half + ns} ${t}`,
    `H${r - c}`,
    `L${r} ${t + c}`,
    `V${b - c}`,
    `L${r - c} ${b}`,
    `H${l + c}`,
    `L${l} ${b - c}`,
    `V${t + c}`,
    "Z",
  ].join(" ");
}

/** Connector pins either side of the notch floor (the bright ticks). */
export function bezelPins(w: number, { nw, nd }: BezelSpec) {
  const mid = w / 2;
  const y = nd + 5.5;
  const pin = Math.min(18, nw * 0.1);
  return `M${mid - nw / 2 + 8} ${y}h${pin}M${mid + nw / 2 - 8 - pin} ${y}h${pin}`;
}
