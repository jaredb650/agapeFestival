// The site's only icons: four line glyphs drawn on a 24px box (paths after Lucide, ISC), one stroke
// (1.5, square caps), currentColor, 16px by default. Never use emoji or Unicode arrows as icons.
import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Icon({ size = 16, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Leaves the site (external links). */
export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 7h10v10M7 17 17 7" />
  </Icon>
);

/** Goes somewhere on the page. */
export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9h16M4 15h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
