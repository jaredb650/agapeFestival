import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { ArrowRight, ArrowUpRight } from "../ui/icons";
import { cx } from "../ui/cx";

/**
 * primary   = the deep red fill (#8b0000). The one action a view exists for (Get tickets).
 * secondary = a dark plate with a hairline edge. Every other boxed action (Lockers, directions, socials).
 * ghost     = Orbitron caps and an arrow, no box (View all →, Back to top).
 * link      = an Archivo text link, for words that can't be caps (handles, emails, a sentence).
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
/** sm 40 · md 48 (default) · lg 56 tall. Every size keeps a 44px touch target. */
export type ButtonSize = "sm" | "md" | "lg";
/** A trailing glyph: "arrow" goes somewhere on the page, "external" leaves the site. */
export type ButtonIcon = "arrow" | "external" | ReactNode;

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The full width of its container. */
  block?: boolean;
  /** Trailing icon. External links get the ↗ arrow by default; pass `null` for none. */
  icon?: ButtonIcon;
  /** A leading icon (16px, currentColor), e.g. a calendar or play glyph. It doesn't nudge on hover. */
  lead?: ReactNode;
  /** A mixed-case value after the caps label, in Archivo ("Instagram  @flash.gea"). */
  meta?: ReactNode;
  /** Busy: the label dims, a red hairline runs along the foot, presses are ignored (aria-busy). */
  loading?: boolean;
  /** Underline (link variant): for a link that stands next to running text. */
  underline?: boolean;
  className?: string;
}

type AnchorProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
    /** Opens in a new tab (rel=noopener) and tells screen readers so. */
    external?: boolean;
    /** Renders the link inert (no href, aria-disabled). */
    disabled?: boolean;
    ref?: Ref<HTMLAnchorElement>;
  };
type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };
export type ButtonProps = AnchorProps | NativeButtonProps;

/** "(opens in a new tab)" for screen readers, unless an aria-label already names the link. */
const NEW_TAB = <span className="w-sr-only"> (opens in a new tab)</span>;

/**
 * The classic button (styles/kit/buttons.css, `.k-btn`). Square, Orbitron caps (Archivo for `link`),
 * red / plate / text. States: hover (fine pointers), press (scale 0.97), focus ring, disabled, loading,
 * selected (`aria-pressed` / `aria-current`: white with a red foot mark). Renders `<a>` when `href` is
 * set, otherwise `<button type="button">`.
 *
 * Nothing inside is laid out by stretching (iOS Safari doesn't stretch a <button>'s children): the label
 * and icons are inline content centred by the button's own flexbox.
 *
 * The hero's frozen Get tickets is the older `ui/Button` (`.w-btn.wh__cta`); this one never touches it.
 */
export function Button({ children, variant = "primary", size = "md", block, icon, lead, meta, loading, underline, className, ...rest }: ButtonProps) {
  const isLink = rest.href !== undefined;
  const external = isLink && (rest as AnchorProps).external;
  const glyph = icon === undefined ? (external ? "external" : null) : icon;
  const trailing =
    glyph === "arrow" ? <ArrowRight className="k-btn__icon" /> : glyph === "external" ? <ArrowUpRight className="k-btn__icon" /> : glyph;
  const named = "aria-label" in rest && rest["aria-label"];

  const props = {
    className: cx("k-btn", className),
    "data-variant": variant,
    "data-size": size === "md" ? undefined : size,
    "data-block": block || undefined,
    "data-icon": glyph === "arrow" || glyph === "external" ? glyph : undefined,
    "data-underline": (variant === "link" && underline) || undefined,
    "data-loading": loading || undefined,
    "aria-busy": loading || undefined,
  };
  const inner = (
    <>
      {lead && <span className="k-btn__lead">{lead}</span>}
      <span className="k-btn__label">{children}</span>
      {meta && <span className="k-btn__meta">{meta}</span>}
      {trailing}
      {external && !named && NEW_TAB}
      {loading && <span className="k-load" aria-hidden="true" />}
    </>
  );

  if (isLink) {
    const { href, external: _external, disabled, ...anchor } = rest as Omit<AnchorProps, keyof BaseProps>;
    void _external;
    const inert = disabled || loading;
    return (
      <a
        {...props}
        {...(inert ? { "aria-disabled": true, role: "link" } : { href })}
        {...(external && !inert ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchor}
      >
        {inner}
      </a>
    );
  }
  const { type, onClick, disabled, ...button } = rest as Omit<NativeButtonProps, keyof BaseProps>;
  return (
    // Loading keeps focus where it is (aria-disabled, not disabled) and swallows the click.
    <button
      type={type ?? "button"}
      {...props}
      disabled={disabled}
      aria-disabled={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...button}
    >
      {inner}
    </button>
  );
}
