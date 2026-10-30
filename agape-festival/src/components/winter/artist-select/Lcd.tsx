import type { ReactNode } from "react";
import { cx } from "@/components/winter/ui";

/** Recessed LCD readout (ChonkyPixels, ice light). Each row is one line of data. */
export function Lcd({ rows, className, label }: { rows: ReactNode[]; className?: string; label?: string }) {
  return (
    <div className={cx("asel-lcd", className)} role={label ? "group" : undefined} aria-label={label}>
      {rows.map((row, i) => (
        <span key={i} className="asel-lcd__row">
          {row}
        </span>
      ))}
    </div>
  );
}

/** Cyan glass orb indicator. `lit` lights it (opacity-only crossfade). */
export function Orb({ lit, locked, size = "md", className }: { lit?: boolean; locked?: boolean; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cx("asel-orb", className)}
      data-lit={lit || undefined}
      data-locked={locked || undefined}
      data-size={size === "md" ? undefined : size}
      aria-hidden="true"
    />
  );
}
