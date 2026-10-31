/** Cyan glass orb indicator (the artist select's, restyled under wmx-). `lit` crossfades its glow (opacity only). */
export function Orb({ lit, size = "sm" }: { lit?: boolean; size?: "sm" | "md" }) {
  return <span className="wmx-orb" data-lit={lit || undefined} data-size={size === "sm" ? undefined : size} aria-hidden="true" />;
}
