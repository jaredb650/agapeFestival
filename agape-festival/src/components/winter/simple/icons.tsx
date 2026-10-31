// Line icons (lucide geometry), 16px, 1.5 stroke, currentColor.
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** lucide arrow-up-right: opens another site. */
export const ArrowIcon = () => (
  <svg {...base} className="s-icon">
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

/** lucide plus: FAQ disclosure (rotates to an x when open). */
export const PlusIcon = () => (
  <svg {...base} className="s-icon s-icon--plus">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

/** lucide x. */
export const CloseIcon = () => (
  <svg {...base} className="s-icon">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/** Two-line menu glyph. */
export const MenuIcon = () => (
  <svg {...base} className="s-icon">
    <path d="M4 9h16" />
    <path d="M4 15h16" />
  </svg>
);
