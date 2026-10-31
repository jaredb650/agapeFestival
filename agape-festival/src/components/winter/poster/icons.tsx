// Line icons: one size (16px box), 1.5 stroke, currentColor. Decorative only.

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  "aria-hidden": true,
  focusable: false,
} as const;

/** External link: arrow up-right. */
export function ArrowUpRight() {
  return (
    <svg {...base}>
      <path d="M5 11 11 5M6 5h5v5" strokeLinecap="square" />
    </svg>
  );
}

export function Plus() {
  return (
    <svg {...base} className="pp-plus">
      <path d="M8 3v10" className="pp-plus__v" />
      <path d="M3 8h10" />
    </svg>
  );
}

export function Pause() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      <rect x="4" y="3" width="2.5" height="10" />
      <rect x="9.5" y="3" width="2.5" height="10" />
    </svg>
  );
}

export function Play() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      <path d="M4.5 2.5 13 8l-8.5 5.5Z" />
    </svg>
  );
}

/** The ÄGAPĒ mark (public/assets/winter/logos/agape-mark.svg), inline so it takes currentColor. */
export function AgapeMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1476 2090" fill="currentColor" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M0 388H972L1473 849L1150 1154L1472 1463V2090H0ZM460 817V1661H1144V1152L781 817Z" />
      <circle cx="140" cy="133" r="133" />
      <circle cx="535" cy="133" r="133" />
    </svg>
  );
}
