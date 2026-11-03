// The lock over a locked piece: a padlock in the site's line style (24px box, 1.5 stroke, square
// caps and corners, like ui/icons.tsx) over an Orbitron caps caption. The roster's red "???" for merch.

/** A padlock glyph. Square corners: there is no radius anywhere on the site. */
export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M5 10.5h14v10H5z" />
      <path d="M12 14.5v2" />
    </svg>
  );
}

/** Lock + caption, centred over a silhouette. Decorative: the caption is in each piece's accessible name. */
export function LockMark({ label, size = "sm" }: { label: string; size?: "sm" | "lg" }) {
  return (
    <span className="mx-lock" data-size={size} aria-hidden="true">
      <LockIcon className="mx-lock__icon" />
      <span className="mx-lock__label">{label}</span>
    </span>
  );
}
