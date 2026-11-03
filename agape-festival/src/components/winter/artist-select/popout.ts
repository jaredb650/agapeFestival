// The bio panel's pop-out (WAAPI; transform + opacity only).
//
// The panel is two layers: a plain dark background and the content on top. Open: the background grows
// out of the element that was pressed (a card, or a name in the lineup) to the panel's box, a FLIP of
// translate + scale, which is safe because the layer holds no text; the content fades and rises in once
// the box has mostly landed. Close: the content goes first (fast), then the background shrinks back
// into the element and dissolves. Closing interrupts an open from wherever it is. With no usable origin
// (keyboard into a card that has scrolled away, or none at all) the panel scales up from 96% instead.

export type Rect = Pick<DOMRect, "left" | "top" | "width" | "height">;

interface Parts {
  bg: HTMLElement;
  content: HTMLElement;
}

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
    d3: ms("--m-dur-3", 420),
  };
}

/** The element's box if it is a sensible origin: laid out and at least partly on screen. */
export function originOf(el: Element | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  return r;
}

/** The transform that lays a box of `to` over `from` (transform-origin 0 0). */
function flip(from: Rect, to: Rect) {
  const sx = Math.max(0.01, from.width / to.width);
  const sy = Math.max(0.01, from.height / to.height);
  return `translate(${(from.left - to.left).toFixed(1)}px, ${(from.top - to.top).toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
}

const SMALL = "scale(0.96)";

export function popOpen({ bg, content }: Parts, from: Rect | null): Animation[] {
  const { ease, d2, d3 } = tokens(bg);
  // The panel's box: the background fills it (measured there, so a leftover transform can't skew it).
  const to = (bg.parentElement ?? bg).getBoundingClientRect();
  const start = from ? flip(from, to) : SMALL;
  return [
    bg.animate(
      [
        { transform: start, opacity: from ? 0.85 : 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: d3, easing: ease, fill: "both" },
    ),
    content.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: d2, delay: d3 * 0.55, easing: ease, fill: "both" },
    ),
  ];
}

/** Fold back from wherever the panel is now; cancels `running`. */
export function popClose({ bg, content }: Parts, to: Rect | null, running: Animation[]): Animation[] {
  const { ease, d1, d2 } = tokens(bg);
  const cs = getComputedStyle(bg);
  const fromTransform = cs.transform === "none" ? "none" : cs.transform;
  const op = (v: string) => (Number.isNaN(parseFloat(v)) ? 1 : parseFloat(v));
  const fromOpacity = op(cs.opacity);
  const contentOpacity = op(getComputedStyle(content).opacity);
  running.forEach((a) => a.cancel());
  // The background's rect includes the running transform: measure the untransformed box on the panel.
  const panel = (bg.parentElement ?? bg).getBoundingClientRect();
  const end = to ? flip(to, panel) : SMALL;
  return [
    content.animate([{ opacity: contentOpacity }, { opacity: 0 }], {
      duration: d1 * 0.75,
      easing: ease,
      fill: "both",
    }),
    bg.animate(
      [
        { transform: fromTransform, opacity: fromOpacity },
        { transform: end, opacity: fromOpacity, offset: 0.7 },
        { transform: end, opacity: 0 },
      ],
      { duration: d2 + d1 * 0.5, delay: d1 * 0.25, easing: ease, fill: "both" },
    ),
  ];
}
