import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

/**
 * primary = flat red fill: the one primary action in a view (Get tickets).
 * secondary = hairline outline.
 * link = a quiet text link with an underline (no box).
 */
export type ButtonVariant = "primary" | "secondary" | "link";
/** sm 40px · md 48px (default) · lg 56px tall. */
export type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full width of its container (e.g. a cell). */
  block?: boolean;
  /** Optional trailing icon (16px, currentColor), e.g. from ui/icons. */
  icon?: ReactNode;
  className?: string;
}

type AnchorProps = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
  href: string;
  /** Opens in a new tab with rel=noopener. */
  external?: boolean;
};
type NativeButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
  href?: undefined;
};
export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * A plain rectangle (winter.css `.w-btn`): flat red fill or hairline outline, sentence-case label, no
 * radius, glow, ticks or glyphs. Hover is a colour step, press scales to 0.98. Renders <a> when `href` is
 * set, otherwise <button type="button">.
 *
 * The hero's Get tickets is this component too: winter.css gives `.wh .wh__cta` the frozen deployed look.
 */
export function Button({ children, variant = "primary", size, block, icon, className, ...rest }: ButtonProps) {
  const props = {
    className: cx("w-btn", className),
    "data-variant": variant,
    "data-size": variant === "link" || !size || size === "md" ? undefined : size,
    "data-block": block || undefined,
  };
  const inner = (
    <>
      <span className="w-btn__label">{children}</span>
      {icon}
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, ...anchor } = rest as Omit<AnchorProps, keyof BaseProps>;
    return (
      <a href={href} {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...anchor}>
        {inner}
      </a>
    );
  }
  const { type, ...button } = rest as Omit<NativeButtonProps, keyof BaseProps>;
  return (
    <button type={type ?? "button"} {...props} {...button}>
      {inner}
    </button>
  );
}
