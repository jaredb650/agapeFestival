// A handful of line icons in one style (24 grid, 1.5 stroke, round caps), drawn
// after lucide's shapes. They take the colour of their text.
type Name = "plus" | "arrow-up-right" | "pause" | "play" | "menu" | "close";

const PATHS: Record<Name, string> = {
  plus: "M12 5v14M5 12h14",
  "arrow-up-right": "M7 17 17 7M8 7h9v9",
  pause: "M9 5v14M15 5v14",
  play: "M8 5.5v13l10-6.5z",
  menu: "M4 8h16M4 16h16",
  close: "M6 6l12 12M18 6 6 18",
};

export function Icon({ name, size = 16, className }: { name: Name; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
