"use client";

import type { CSSProperties } from "react";
import { cx } from "../ui/cx";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Unavailable (a sold-out size): shown struck through, not pressable. */
  disabled?: boolean;
}

export interface SegmentedProps<T extends string> {
  /** What the group switches ("Side shown", "Size"). */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** id(s) of what the options change (aria-controls). */
  controls?: string;
  /** sm 36 · md 44 (default). */
  size?: "sm" | "md";
  /** Where the red mark runs: the foot (default), or the top when the group sits under what it changes. */
  mark?: "top" | "bottom";
  /** Draw the hairline box (default). Off when the group sits inside a plate that already has an edge. */
  frame?: boolean;
  /** The full width of its container. */
  block?: boolean;
  className?: string;
}

/**
 * A segmented toggle (styles/kit/buttons.css, `.k-seg`): a row of equal cells between hairlines, Orbitron
 * caps; the chosen one is white with a red mark that slides to it. For a small set of mutually exclusive
 * values that change something in place: a side, a day, a size. Toggle-button semantics (role=group,
 * aria-pressed). For options that each show their own panel, use the TabRail.
 *
 * Cells are equal by construction (an inline grid of 1fr columns), so the mark is positioned by index
 * alone, no measuring.
 */
export function Segmented<T extends string>({ label, options, value, onChange, controls, size = "md", mark = "bottom", frame = true, block, className }: SegmentedProps<T>) {
  const at = options.findIndex((o) => o.value === value);
  const style = { "--ks-n": options.length, "--ks-i": Math.max(0, at) } as CSSProperties;
  return (
    <div
      role="group"
      aria-label={label}
      className={cx("k-seg", className)}
      data-size={size === "md" ? undefined : size}
      data-mark={mark === "top" ? "top" : undefined}
      data-frame={frame ? undefined : "none"}
      data-block={block || undefined}
      style={style}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="k-seg__opt"
          aria-pressed={o.value === value}
          aria-controls={controls}
          disabled={o.disabled}
          onClick={() => o.value !== value && onChange(o.value)}
        >
          <span className="k-seg__label">{o.label}</span>
        </button>
      ))}
      <span className="k-seg__mark" aria-hidden="true" data-on={at >= 0 || undefined} />
    </div>
  );
}
