// The bio panel's pop-out (WAAPI, clip-path + transform + opacity only).
//
// Open: the panel's fill is clipped to the page column under the pointer, inside the feature row; it
// unfolds sideways to the full row (--m-dur-1), then rises to the full panel (--m-dur-2). Each leg eases
// with --m-ease, so the rectangle settles for a beat between them. Four hairlines ride the clip's edges,
// brighter while they move, and fade once the panel's own grid lines are in place.
// Close: from wherever the clip is (an open can be interrupted), back down into the feature row
// (--m-dur-2), dissolving as it lands.

export interface Point {
  x: number;
  y: number;
}

/** Insets of the clip rectangle from the panel's edges, in px. */
interface Inset {
  t: number;
  r: number;
  b: number;
  l: number;
}

interface Parts {
  panel: HTMLElement;
  fill: HTMLElement;
  /** Top, right, bottom, left hairlines (positioned on the panel's edges, transform-origin 0 0). */
  edges: HTMLElement[];
}

const OPEN: Inset = { t: 0, r: 0, b: 0, l: 0 };

function tokens(el: Element) {
  const cs = getComputedStyle(el);
  // The CSS build may rewrite "160ms" as ".16s": honour the unit.
  const ms = (name: string, fallback: number) => {
    const v = cs.getPropertyValue(name).trim();
    const n = parseFloat(v);
    if (Number.isNaN(n)) return fallback;
    return v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : fallback;
  };
  return {
    ease: cs.getPropertyValue("--m-ease").trim() || "cubic-bezier(0.22, 1, 0.36, 1)",
    d1: ms("--m-dur-1", 160),
    d2: ms("--m-dur-2", 240),
  };
}

const clip = (i: Inset) => `inset(${i.t}px ${i.r}px ${i.b}px ${i.l}px)`;

/** The transforms that put each hairline on the clip rectangle's edges. */
function edgeTransforms(i: Inset, w: number, h: number) {
  const sx = Math.max(1, w - i.l - i.r) / w;
  const sy = Math.max(1, h - i.t - i.b) / h;
  return [
    `translate(${i.l}px, ${i.t}px) scaleX(${sx})`,
    `translate(${-i.r}px, ${i.t}px) scaleY(${sy})`,
    `translate(${i.l}px, ${-i.b}px) scaleX(${sx})`,
    `translate(${i.l}px, ${i.t}px) scaleY(${sy})`,
  ];
}

/** The feature row as an inset of the panel (full panel width, the row's visible height). */
function rowInset(row: DOMRect, p: DOMRect): Inset {
  const top = Math.min(Math.max(row.top, p.top), p.bottom - 1);
  const bottom = Math.max(Math.min(row.bottom, p.bottom), top + 1);
  return { t: top - p.top, r: 0, b: p.bottom - bottom, l: 0 };
}

/** The clip as it is painted right now (mid-animation included); `inset(0)` when unclipped. */
function readInset(el: Element): Inset {
  const m = /inset\(([^)]*)\)/.exec(getComputedStyle(el).clipPath);
  if (!m) return OPEN;
  const n = m[1]
    .replace(/round.*$/, "")
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v));
  if (!n.length || n.some((v) => Number.isNaN(v))) return OPEN;
  const [t, r = t, b = t, l = r] = n;
  return { t, r, b, l };
}

function run(parts: Parts, frames: Inset[], offsets: number[], duration: number, ease: string, edgeEnd?: number) {
  const { panel, fill, edges } = parts;
  const w = panel.clientWidth;
  const h = panel.clientHeight;
  const timing: KeyframeAnimationOptions = { duration, fill: "both" };
  const anims = [fill.animate(frames.map((f, k) => ({ clipPath: clip(f), offset: offsets[k], easing: ease })), timing)];
  const lines = frames.map((f) => edgeTransforms(f, w, h));
  edges.forEach((edge, e) => {
    anims.push(
      edge.animate(
        frames.map((_, k) => ({
          transform: lines[k][e],
          opacity: edgeEnd !== undefined && k === frames.length - 1 ? edgeEnd : 1,
          offset: offsets[k],
          easing: ease,
        })),
        timing,
      ),
    );
  });
  return anims;
}

/**
 * Unfold the panel out of the feature row. `origin` is the pointer (null for a keyboard press: the row
 * rises without the sideways leg). `cols` is the page's column count, so the first rectangle is one real
 * grid column.
 */
export function unfoldOpen(parts: Parts, row: DOMRect, origin: Point | null, cols: number): Animation[] {
  const { ease, d1, d2 } = tokens(parts.panel);
  const p = parts.panel.getBoundingClientRect();
  const full = rowInset(row, p);
  let anims: Animation[];
  if (origin) {
    const colW = p.width / cols;
    const k = Math.min(cols - 1, Math.max(0, Math.floor((origin.x - p.left) / colW)));
    const column = { ...full, l: k * colW, r: p.width - (k + 1) * colW };
    anims = run(parts, [column, full, OPEN], [0, d1 / (d1 + d2), 1], d1 + d2, ease);
  } else {
    anims = run(parts, [full, OPEN], [0, 1], d1 + d2, ease);
  }
  // The black fill comes up over the first leg, so the pressed cell turns into the panel rather than
  // being covered by it.
  anims.push(parts.fill.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d1, easing: ease, fill: "backwards" }));
  // The bright edges hand over to the panel's own 12% grid lines once it is up.
  parts.edges.forEach((edge) =>
    anims.push(edge.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d2, delay: d1 + d2, easing: ease, fill: "backwards" })),
  );
  return anims;
}

/** Fold the panel back into the feature row from wherever it is now; cancels `running`. */
export function unfoldClose(parts: Parts, row: DOMRect, running: Animation[]): Animation[] {
  const { ease, d2 } = tokens(parts.panel);
  const from = readInset(parts.fill);
  const painted = parseFloat(getComputedStyle(parts.fill).opacity);
  const alpha = Number.isNaN(painted) ? 1 : painted;
  running.forEach((a) => a.cancel());
  const to = rowInset(row, parts.panel.getBoundingClientRect());
  // The edges land at 30% (40% × 0.3 ≈ the 12% of the row's own hairlines), so the hand-off is seamless.
  const anims = run(parts, [from, to], [0, 1], d2, ease, 0.3);
  // The fill stays solid while it folds, then dissolves into the row as it lands.
  anims.push(parts.fill.animate([{ opacity: alpha }, { opacity: alpha, offset: 0.4, easing: ease }, { opacity: 0 }], { duration: d2, fill: "both" }));
  return anims;
}
