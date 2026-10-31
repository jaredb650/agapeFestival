import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  /** primary = the red ticket CTA (one per view). secondary = transparent hairline. ghost = text. link = label + arrow. */
  variant?: ButtonVariant;
  /** Default: lg for primary, md otherwise. Ignored by `link`. */
  size?: ButtonSize;
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

function Arrow() {
  return (
    <svg className="w-btn__arrow" viewBox="0 0 22 10" fill="none" aria-hidden="true">
      <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/**
 * The deployed site's button: flat solid red with white Orbitron caps and four
 * small corner ticks (CSS only). The primary breathes a soft red glow every 4s
 * (opacity only, off under reduced motion). Secondary is a transparent pane with
 * a white hairline. No gradients, glass, bevels or 3D shading (hybrid-theme.md).
 * Renders <a> when `href` is set, otherwise <button type="button">.
 */
export function Button({ children, variant = "primary", size, className, ...rest }: ButtonProps) {
  const resolvedSize = variant === "link" ? undefined : size ?? (variant === "primary" ? "lg" : "md");
  const cls = cx("w-btn", `w-btn--${variant}`, className);
  const inner = (
    <>
      {variant === "primary" && <span className="w-btn__glow" aria-hidden="true" />}
      <span className="w-btn__label">{children}</span>
      {variant === "link" && <Arrow />}
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, ...anchor } = rest as Omit<AnchorProps, keyof BaseProps>;
    return (
      <a
        href={href}
        className={cls}
        data-size={resolvedSize}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchor}
      >
        {inner}
      </a>
    );
  }
  const { type, ...button } = rest as Omit<NativeButtonProps, keyof BaseProps>;
  return (
    <button type={type ?? "button"} className={cls} data-size={resolvedSize} {...button}>
      {inner}
    </button>
  );
}
