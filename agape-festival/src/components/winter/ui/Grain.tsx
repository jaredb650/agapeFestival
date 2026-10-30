import type { CSSProperties } from "react";

export interface GrainProps {
  /** Shift the grain tile at ~10fps (desktop + motion-OK only; compositor transform). */
  animated?: boolean;
  /** Grain alpha. Default 0.075 matches the flyer. */
  opacity?: number;
}

/** Fixed, site-wide film grain. Render once inside the `.winter` root. */
export function Grain({ animated = false, opacity }: GrainProps) {
  const style = opacity === undefined ? undefined : ({ ["--w-grain-a" as string]: String(opacity) } as CSSProperties);
  return <div className="w-grain" aria-hidden="true" data-animated={animated || undefined} style={style} />;
}
