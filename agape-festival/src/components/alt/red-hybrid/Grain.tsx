import type { CSSProperties } from "react";

export interface GrainProps {
  /** Shift the grain tile at ~8fps (fine pointers + motion OK only; compositor transform). */
  animated?: boolean;
  /** Grain alpha. Default 0.075 matches the flyer. */
  opacity?: number;
  /** Cover the nearest positioned ancestor instead of the viewport (fixed, z 60). */
  local?: boolean;
}

/** The flyer's brightness-only film grain (c9688b5 ui/Grain.tsx). One layer, no blend mode. */
export function Grain({ animated = false, opacity, local }: GrainProps) {
  const style = opacity === undefined ? undefined : ({ ["--grain-a" as string]: String(opacity) } as CSSProperties);
  return <div className="rhk-grain" aria-hidden="true" data-animated={animated || undefined} data-local={local || undefined} style={style} />;
}
