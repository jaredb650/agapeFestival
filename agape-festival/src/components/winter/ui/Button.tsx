import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  /** primary = the hologram ticket CTA (one per view). secondary = quiet hologram. ghost = text. link = HUD label + arrow. */
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

/** Transport "play" glyph: the primary reads like a deck's ▶ key. */
function Play() {
  return (
    <svg className="w-btn__play" viewBox="0 0 8 10" aria-hidden="true">
      <path d="M0 0l8 5-8 5z" fill="currentColor" />
    </svg>
  );
}

/**
 * Hologram buttons: a chamfered pane of ice glass (scanlines + a sheen that
 * sweeps on hover) inside a 1px luminous edge, with the Sept corner brackets
 * standing off the two square corners. No fill slab, bevel or drop shadow.
 * Renders <a> when `href` is set, otherwise <button type="button">.
 */
export function Button({ children, variant = "primary", size, className, ...rest }: ButtonProps) {
  const resolvedSize = variant === "link" ? undefined : size ?? (variant === "primary" ? "lg" : "md");
  const holo = variant === "primary" || variant === "secondary";
  const cls = cx("w-btn", `w-btn--${variant}`, className);
  const inner = (
    <>
      {variant === "primary" && <span className="w-btn__glow" aria-hidden="true" />}
      {holo && <span className="w-btn__glass" aria-hidden="true" />}
      {holo && <span className="w-btn__edge" aria-hidden="true" />}
      {variant === "primary" && <Play />}
      {/* data-text feeds the red/cyan split copies (pseudo-elements, transform/opacity only). */}
      <span className="w-btn__label" data-text={typeof children === "string" ? children : undefined}>
        {children}
      </span>
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
