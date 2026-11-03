import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { CloseIcon } from "../ui/icons";
import { cx } from "../ui/cx";

/**
 * plain   = the glyph alone (a quiet control in a bar).
 * outline = a dark plate with a hairline edge, like the secondary button (previous / next, share).
 * red     = the deep red fill. Close: the way out of every panel and dialog.
 */
export type IconButtonVariant = "plain" | "outline" | "red";
/** sm 36 · md 44 (default) · lg 56 square. sm still answers to a 44px touch. */
export type IconButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  /** The accessible name ("Close bio", "Next artist"). Required: the button has no visible text. */
  label: string;
  /** The glyph (ui/icons). The button sizes it: 16px for sm, 20px otherwise. */
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Busy: the glyph dims and a hairline runs along the foot. */
  loading?: boolean;
  className?: string;
}

type AnchorProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "aria-label"> & { href: string; external?: boolean };
type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "aria-label"> & { href?: undefined; ref?: Ref<HTMLButtonElement> };
export type IconButtonProps = AnchorProps | NativeButtonProps;

/**
 * A square control with one glyph (styles/kit/buttons.css, `.k-ibtn`). Same states as the Button:
 * hover, press (scale 0.94: a small square needs a little more travel to be felt), focus ring,
 * disabled, loading, and on/off for toggles (`aria-pressed`: white glyph, red foot mark).
 * The glyph is centred by the button's own flexbox at an explicit size (never stretched: iOS).
 */
export function IconButton({ label, icon, variant = "plain", size = "md", loading, className, ...rest }: IconButtonProps) {
  const props = {
    className: cx("k-ibtn", className),
    "data-variant": variant === "plain" ? undefined : variant,
    "data-size": size === "md" ? undefined : size,
    "data-loading": loading || undefined,
    "aria-busy": loading || undefined,
    "aria-label": label,
  };
  const inner = (
    <>
      {icon}
      {loading && <span className="k-load" aria-hidden="true" />}
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
  const { type, onClick, ...button } = rest as Omit<NativeButtonProps, keyof BaseProps>;
  return (
    <button type={type ?? "button"} {...props} aria-disabled={loading || undefined} onClick={loading ? undefined : onClick} {...button}>
      {inner}
    </button>
  );
}

/**
 * Close, everywhere: the red square with the X. The bio pop-out, the menu, any future panel or dialog.
 * Red because leaving a layer is the one action every layer shares; the fill makes it findable at once.
 */
export function CloseButton({ label = "Close", ...rest }: Omit<NativeButtonProps, "icon" | "variant" | "label"> & { label?: string }) {
  return <IconButton label={label} icon={<CloseIcon size={20} />} variant="red" {...rest} />;
}
