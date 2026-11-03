import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export type HoloButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type HoloButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  /** primary = the hologram ticket CTA (one per view). secondary = quiet hologram. ghost = text. link = HUD label + arrow. */
  variant?: HoloButtonVariant;
  /** Default: lg for primary, md otherwise. Ignored by `link`. */
  size?: HoloButtonSize;
  className?: string;
}

type AnchorProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
    /** Opens in a new tab with rel=noopener. */
    external?: boolean;
  };
type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };
export type HoloButtonProps = AnchorProps | NativeButtonProps;

function Arrow() {
  return (
    <svg className="rhk-hb__arrow" viewBox="0 0 22 10" fill="none" aria-hidden="true">
      <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/** Transport "play" glyph: the primary reads like a deck's ▶ key. */
function Play() {
  return (
    <svg className="rhk-hb__play" viewBox="0 0 8 10" aria-hidden="true">
      <path d="M0 0l8 5-8 5z" fill="currentColor" />
    </svg>
  );
}

/**
 * Hologram buttons (c9688b5 ui/Button.tsx): a plain rectangle of ice glass (scanlines + a
 * sheen that sweeps on hover) inside a 1px luminous edge, with targeting brackets on all
 * four corners that snap inward like a reticle locking on (hover / focus / press). The
 * primary also pulses: every few seconds its halo flares and a ring pings outward
 * (opacity/transform only, off under reduced motion), and its caps split red/cyan on hover.
 * Renders <a> when `href` is set, otherwise <button type="button">.
 */
export function HoloButton({ children, variant = "primary", size, className, ...rest }: HoloButtonProps) {
  const resolvedSize = variant === "link" ? undefined : size ?? (variant === "primary" ? "lg" : "md");
  const holo = variant === "primary" || variant === "secondary";
  const cls = cx("rhk-hb", `rhk-hb--${variant}`, className);
  const inner = (
    <>
      {variant === "primary" && <span className="rhk-hb__glow" aria-hidden="true" />}
      {variant === "primary" && <span className="rhk-hb__ping" aria-hidden="true" />}
      {holo && <span className="rhk-hb__glass" aria-hidden="true" />}
      {holo && <span className="rhk-hb__edge" aria-hidden="true" />}
      {holo && (
        <span className="rhk-hb__lock" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
      {variant === "primary" && <Play />}
      {/* data-text feeds the red/cyan split copies (pseudo-elements, transform/opacity only). */}
      <span className="rhk-hb__label" data-text={typeof children === "string" ? children : undefined}>
        {children}
      </span>
      {variant === "link" && <Arrow />}
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, ...anchor } = rest as Omit<AnchorProps, keyof BaseProps>;
    return (
      <a href={href} className={cls} data-size={resolvedSize} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...anchor}>
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
