import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";

export interface ChromeKeyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** On: the ice glass lights and the + turns into ×. (aria-pressed / aria-expanded="true" do the same.) */
  on?: boolean;
  /** Required: the key has no visible text. */
  "aria-label": string;
}

/** The FAQ's chrome keycap (c9688b5 .wfq__key): chamfered silver, a + that rotates to ×, an ice glass state. */
export function ChromeKey({ on, className, type, ...rest }: ChromeKeyProps) {
  return (
    <button type={type ?? "button"} className={cx("rhk-key", className)} data-on={on || undefined} {...rest}>
      <i aria-hidden="true" />
    </button>
  );
}
