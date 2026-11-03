import { cx } from "./cx";

export interface OrbProps {
  /** Lit: the ice core + glow crossfade in (opacity only). */
  lit?: boolean;
  /** xs 5 · sm 8 · default 10 · md 11 · lg 14 px. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Breathes (the HUD bar's status orb). */
  beat?: boolean;
  /** Blinks (the countdown's orb). */
  blink?: boolean;
  /** Darker, emptier glass (the roster's locked slots). */
  locked?: boolean;
  /** p2 = the roster's Day 2 crimson. */
  tone?: "ice" | "p2";
  className?: string;
}

/** The artist select's glass orb indicator (c9688b5 asel-orb / wmx-orb / wfq__orb / whud-orb / tk-orb). */
export function Orb({ lit, size, beat, blink, locked, tone, className }: OrbProps) {
  return (
    <span
      className={cx("rhk-orb", className)}
      data-lit={lit || undefined}
      data-size={size}
      data-beat={beat || undefined}
      data-blink={blink || undefined}
      data-locked={locked || undefined}
      data-tone={tone === "p2" ? "p2" : undefined}
      aria-hidden="true"
    />
  );
}
