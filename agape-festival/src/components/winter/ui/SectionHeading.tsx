import type { ReactNode } from "react";
import { HudLabel } from "./HudLabel";
import { cx } from "./cx";

export interface SectionHeadingProps {
  title: ReactNode;
  /** HUD kicker above the title, e.g. "LINEUP". */
  label?: string;
  /** Kicker index, e.g. "03". */
  index?: string;
  /** Optional lead paragraph under the title. */
  children?: ReactNode;
  align?: "left" | "center";
  /** Title scale. h1 for section titles, h2 for sub-sections, display for the one hero moment. */
  size?: "display" | "h1" | "h2";
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}

export function SectionHeading({ title, label, index, children, align = "left", size = "h1", as: H = "h2", id, className }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <header className={cx("w-section-heading", className)} data-align={center ? "center" : undefined}>
      {label && <HudLabel index={index} rule={!!index}>{label}</HudLabel>}
      <H id={id} className={`w-${size}`}>{title}</H>
      {children && <p className="w-lead">{children}</p>}
    </header>
  );
}
