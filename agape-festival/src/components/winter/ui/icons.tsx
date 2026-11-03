// The site's only icons: line glyphs drawn on a 24px box (paths after Lucide, ISC), one stroke
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

/** Back (the mirror of ArrowRight): previous item. */
export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

/** Back to the top of the page. */
export const ArrowUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4.5v15L19 12Z" />
  </Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 5v14M16 5v14" />
  </Icon>
);

/** Sound off (a muted clip). */
export const MutedIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4ZM17 9.5l5 5M22 9.5l-5 5" />
  </Icon>
);

/** Sound on. */
export const SoundIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4ZM17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 9h11v11H9ZM5 15H4V4h11v1" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16v14H4ZM4 10h16M8 3v5M16 3v5" />
  </Icon>
);

export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15V4M8 8l4-4 4 4M5 12v8h14v-8" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

// ---- Transport modes (Getting here). Square-cut, the same stroke as every other glyph. ----

/** Subway: a train seen from the front. */
export const TrainIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12v13H6ZM6 10h12M9 13h.5M14.5 13h.5M8.5 16 6.5 21M15.5 16l2 5" />
  </Icon>
);

/** Drive: a car in profile. */
export const CarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 17v-5l2.5-1L8 6.5h7.5L19 11l2 1v5h-2M9.5 17h5M5 17H3" />
    <circle cx="7.25" cy="17" r="2.25" />
    <circle cx="16.75" cy="17" r="2.25" />
  </Icon>
);

/** Rideshare: a car seen from the front (the one that comes to you). */
export const CarFrontIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 5h11L20 11v7H4v-7ZM4 11h16M7 14.5h1.5M15.5 14.5H17M6 18v2.5M18 18v2.5" />
  </Icon>
);

/** Bus and bike. */
export const BikeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="5.5" cy="16.5" r="3.5" />
    <circle cx="18.5" cy="16.5" r="3.5" />
    <path d="M5.5 16.5 9 9h7l2.5 7.5M9 9l3.5 7.5h-7M12.5 16.5 16 9M14 5.5h3" />
  </Icon>
);
