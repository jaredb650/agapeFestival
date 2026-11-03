import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Accent (ice) brackets, larger. Use on interactive / selected blocks. */
  accent?: boolean;
  /** Adds the 1px hairline border between the brackets. */
  hairline?: boolean;
  /** Bracket arm length: md = 12px (16px accent), lg = 22px. */
  size?: "md" | "lg";
  /** Brackets flicker bright on hover (cards, tiles). */
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li" | "figure" | "span";
}

/** The Sept corner-bracket frame (c9688b5 ui/Frame.tsx). Brackets are one ::after, no extra DOM. */
export function Frame({ children, accent, hairline, size = "md", interactive, as = "div", className, ...rest }: FrameProps) {
  const Tag = as as "div";
  return (
    <Tag
      className={cx("rhk-frame", className)}
      data-accent={accent || undefined}
      data-variant={hairline ? "hairline" : undefined}
      data-size={size === "lg" ? "lg" : undefined}
      data-interactive={interactive || undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
