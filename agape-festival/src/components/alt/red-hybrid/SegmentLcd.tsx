import type { CSSProperties } from "react";
import { Orb } from "./Orb";
import { cx } from "./cx";

export interface SegmentGroup {
  /** Digits (or any short pixel string), e.g. "07". Each character gets its own cell with an unlit 8 behind it. */
  value: string;
  /** Unit letter beside the digits, e.g. "D". */
  unit?: string;
}

export interface SegmentLcdProps {
  groups: SegmentGroup[];
  /** Lead caps before the screen, e.g. "T–MINUS". */
  lead?: string;
  /** Pixel meta after the screen, e.g. "DAY 01". */
  meta?: string;
  /** Glass orbs at both ends (the right one blinks). Default true. */
  orbs?: boolean;
  /** CRT power-on on mount. Default true. */
  power?: boolean;
  /** Blink the colons (a live clock). Default true. */
  live?: boolean;
  /** Accessible reading of the value, e.g. "34 days 12 hours". */
  label: string;
  /** Digit size in px. Default 17. */
  fontSize?: number;
  className?: string;
}

/**
 * The hero countdown's segment strip (c9688b5 HeroBits Countdown / .wh-lcd): orb, lead caps
 * and a little ruler | a recessed digit window with an unlit "8" behind every digit and unit
 * letters | pixel meta and a blinking orb, inside a dim hairline with two ice corner ticks.
 */
export function SegmentLcd({ groups, lead, meta, orbs = true, power = true, live = true, label, fontSize, className }: SegmentLcdProps) {
  const style = fontSize ? ({ "--lcd-fs": `${fontSize}px` } as CSSProperties) : undefined;
  return (
    <div className={cx("rhk-seg", className)} role="img" aria-label={label} data-power={power || undefined} data-live={live || undefined} style={style}>
      {orbs && <Orb size="xs" lit />}
      {lead && <span className="rhk-seg__lead" aria-hidden="true">{lead}</span>}
      {lead && <span className="rhk-seg__rule" aria-hidden="true" />}
      <span className="rhk-seg__screen" aria-hidden="true">
        <span className="rhk-seg__digits">
          {groups.map((g, gi) => (
            <span key={gi} className="rhk-seg__grp">
              {gi > 0 && <span className="rhk-seg__colon">:</span>}
              <span className="rhk-seg__cells">
                {[...g.value].map((ch, ci) => (
                  <span key={ci} className="rhk-seg__d">
                    {ch}
                  </span>
                ))}
              </span>
              {g.unit && <span className="rhk-seg__unit">{g.unit}</span>}
            </span>
          ))}
        </span>
      </span>
      {meta && <span className="rhk-seg__meta" aria-hidden="true">{meta}</span>}
      {orbs && <Orb size="xs" lit blink />}
    </div>
  );
}
