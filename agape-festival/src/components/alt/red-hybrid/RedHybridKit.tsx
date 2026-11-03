import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import "./red-hybrid.css";

export interface RedHybridKitProps {
  children?: ReactNode;
  /** red (default) = the red-hybrid mapping of the legacy ice/volt names; blue = the original c9688b5 palette. */
  palette?: "red" | "blue";
  as?: "div" | "section" | "main" | "aside" | "span";
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * The kit's scope: every rule in red-hybrid.css sits under `.rhk` and every token is
 * defined on it, so the pieces only render inside this wrapper and nothing leaks out.
 * Importing this component is what loads the stylesheet. Fonts come from the page:
 * put the app's font variable classes (e.g. `winterFontVariables`) on it or an ancestor.
 */
export function RedHybridKit({ children, palette = "red", as = "div", className, style, id }: RedHybridKitProps) {
  const Tag = as as "div";
  return (
    <Tag id={id} className={cx("rhk", className)} data-palette={palette === "blue" ? "blue" : undefined} style={style}>
      {children}
    </Tag>
  );
}
