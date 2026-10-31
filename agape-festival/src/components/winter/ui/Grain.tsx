import type { CSSProperties } from "react";

export interface GrainProps {
  /** The deployed scanlines over the whole page. Default true. */
  scanlines?: boolean;
  /** Static film-grain alpha. Default 0 (off). Keep it ≤ 0.04 if used. Never animated. */
  grain?: number;
}

/**
 * The page's one global texture layer (fixed, painted once): the deployed
 * site's scanlines, plus optional static grain. Render once inside the
 * `.winter` root. Sections never add their own scanlines (hybrid-theme.md).
 */
export function Grain({ scanlines = true, grain = 0 }: GrainProps) {
  const style = grain > 0 ? ({ ["--w-grain-a" as string]: String(grain) } as CSSProperties) : undefined;
  return <div className="w-grain" aria-hidden="true" data-scan={scanlines || undefined} data-grain={grain > 0 || undefined} style={style} />;
}
