import { useId } from "react";
import { cx } from "./cx";

export interface RedactionProps {
  /** Width in em of the surrounding type. ~1em per two characters of the name it hides. Default 5. */
  length?: number;
  /** Shape seed; change it so neighbouring blobs don't look stamped. */
  seed?: number;
  /** Accessible name. Default "To be revealed". */
  label?: string;
  className?: string;
}

const H = 40; // viewBox units per em of height

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A marker swipe: fat rounded left cap, gently wobbling edges, tapered right end. */
function blobPath(seed: number, W: number): string {
  const r = rng(seed);
  const steps = Math.max(4, Math.round(W / 34));
  const tilt = (r() - 0.5) * 3;
  const f = (n: number) => n.toFixed(1);
  const tailLen = Math.min(W * 0.18, 34);
  const x0 = 10;
  const x1 = W - tailLen;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const lean = tilt * t;
    top.push([x, 2 + r() * 2.5 + lean]);
    bottom.push([x, H - 1.5 - r() * 2.5 + lean - t * 2]);
  }
  // Smooth the wobble with quadratic midpoints.
  const smooth = (pts: [number, number][]) =>
    pts.slice(1).map((p, i) => {
      const q = pts[i];
      return `Q${f(q[0])} ${f(q[1])} ${f((q[0] + p[0]) / 2)} ${f((q[1] + p[1]) / 2)}`;
    });
  const [tx, ty] = top[top.length - 1];
  const [bx, by] = bottom[bottom.length - 1];
  const tipY = H * (0.42 + r() * 0.2) + tilt;
  const revBottom = [...bottom].reverse();
  return [
    `M${f(x0)} ${f(top[0][1])}`,
    ...smooth(top),
    // tapered tip
    `C${f(tx + tailLen * 0.6)} ${f(ty)} ${f(W)} ${f(tipY - 6)} ${f(W - r() * 3)} ${f(tipY)}`,
    `C${f(W - 4)} ${f(tipY + 8)} ${f(bx + tailLen * 0.5)} ${f(by)} ${f(bx)} ${f(by)}`,
    ...smooth(revBottom),
    // fat rounded left cap
    `C${f(r() * 3)} ${f(H + 1)} ${f(-1)} ${f(H * 0.55)} ${f(1 + r() * 2)} ${f(H * 0.4)}`,
    `C${f(2 + r() * 2)} ${f(H * 0.12)} ${f(x0 - 6)} ${f(top[0][1])} ${f(x0)} ${f(top[0][1])}`,
    "Z",
  ].join(" ");
}

/**
 * The flyer's grainy off-white redaction blob: an unannounced act. Inline,
 * sized in em, so it sits in a line of display type. One static SVG filter
 * (soft edge wobble + faint mottling); the page <Grain> supplies film grain.
 */
export function Redaction({ length = 5, seed = 7, label = "To be revealed", className }: RedactionProps) {
  const fid = `wr${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const W = Math.round(length * H);
  return (
    <span className={cx("w-redaction", className)} style={{ width: `${length}em` }} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <filter id={fid} x="-4%" y="-20%" width="108%" height="140%" colorInterpolationFilters="sRGB">
          {/* Soft wobble on the edge, a slight bleed, then faint mottling (the page grain does the rest). */}
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed={seed} result="edge" />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="3" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feGaussianBlur in="rough" stdDeviation="0.7" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed={seed + 11} result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.35 0 0 0 1.16" result="grain" />
          <feComposite in="soft" in2="grain" operator="in" />
        </filter>
        <path d={blobPath(seed, W)} fill="currentColor" filter={`url(#${fid})`} />
      </svg>
    </span>
  );
}
