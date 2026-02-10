// ============================================================
// ÄGAPĒ FESTIVAL 2026 — Single source of truth for all content
// ============================================================

export interface Artist {
  name: string;
  day: 1 | 2;
  stage: "outdoor" | "indoor";
  stageHost: string;
  bio: string;
  isPlaceholderBio: boolean;
  imageUrl: string | null;
  note?: string; // e.g. "B2B", "F2F"
}

export interface StageInfo {
  day: 1 | 2;
  dayLabel: string;
  stage: "outdoor" | "indoor";
  host: string;
  artists: Artist[];
}

export interface BrandPartner {
  name: string;
  logoUrl: string | null;
  logoUrlAlt?: string | null;
  website?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
}

// ---- FESTIVAL INFO ----

export const FESTIVAL = {
  name: "ÄGAPĒ FESTIVAL",
  year: "2026",
  tagline: "September 5 + 6, 2026",
  dates: {
    day1: "Saturday, September 5, 2026",
    day2: "Sunday, September 6, 2026",
  },
  venue: {
    name: "Industry City",
    location: "Brooklyn, NYC",
    full: "Industry City, Brooklyn, NYC",
  },
  ticketUrl: "https://posh.vip/e/gap-festival-1",
  contactEmail: "bookings@agapemusic.us",
  websiteUrl: "https://agapemusic.us/",
} as const;

// ---- BRAND COPY ----

export const COPY = {
  about:
    "From raw, intimate warehouse sessions to full-scale, high-energy raves, ÄGAPĒ delivers elevated production, bold sound design, and a genuine, inclusive atmosphere.",
  aboutExtended:
    "Born in New York City, ÄGAPĒ has become a cornerstone of the underground techno scene. What started as intimate warehouse gatherings has evolved into one of the most respected hard techno brands on the East Coast. With ÄGAPĒ FESTIVAL, we bring that energy to its largest scale yet — two days of unrelenting sound across indoor and outdoor stages at Industry City, Brooklyn.",
  merchComingSoon: "Merch dropping soon. Stay tuned.",
  origin: "New York Based",
} as const;

// ---- SOCIAL LINKS ----

export const SOCIALS: SocialLink[] = [
  {
    platform: "Instagram",
    url: "https://www.instagram.com/agape.festival/",
    handle: "@agape.festival",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/agape__music/",
    handle: "@agape__music",
  },
];

// ---- BRAND PARTNERS ----

export const PARTNERS: BrandPartner[] = [
  {
    name: "ÄGAPĒ",
    logoUrl: "/assets/logos/agape_logo_white.png",
    website: "https://agapemusic.us/",
  },
  {
    name: "44",
    logoUrl: "/assets/logos/44-logo-white.png",
  },
  {
    name: "240 km/h",
    logoUrl: "/assets/logos/240-logo-white.png",
  },
  {
    name: "Face 2 Face",
    logoUrl: "/assets/logos/f2f-logo-white.png",
    logoUrlAlt: "/assets/logos/f2f-logo-black.png",
  },
  {
    name: "HotMeal",
    logoUrl: "/assets/logos/hotmeal-logo-white.png",
  },
  {
    name: "Industry City",
    logoUrl: "/assets/logos/ic-logo-block-white.png",
    logoUrlAlt: "/assets/logos/ic-logo-line.png",
  },
];

// ---- ARTISTS ----

const placeholderBio = (name: string) =>
  `${name} is a force in the global hard techno scene, known for relentless energy and commanding performances. [Placeholder — awaiting EPK]`;

export const ARTISTS: Artist[] = [
  // DAY 1 — OUTDOOR (Agape)
  {
    name: "Ollie Lishman",
    day: 1,
    stage: "outdoor",
    stageHost: "ÄGAPĒ",
    bio: placeholderBio("Ollie Lishman"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/ollie-lishman.jpg",
  },
  {
    name: "FUMI",
    day: 1,
    stage: "outdoor",
    stageHost: "ÄGAPĒ",
    bio: placeholderBio("FUMI"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/fumi.jpg",
  },
  {
    name: "Mischluft",
    day: 1,
    stage: "outdoor",
    stageHost: "ÄGAPĒ",
    bio: placeholderBio("Mischluft"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/mischluft.png",
  },
  {
    name: "Bad Boombox",
    day: 1,
    stage: "outdoor",
    stageHost: "ÄGAPĒ",
    bio: placeholderBio("Bad Boombox"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/bad-boombox.jpg",
  },

  // DAY 1 — INDOOR (Face 2 Face)
  {
    name: "Cloudy",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Cloudy"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/cloudy.jpg",
  },
  {
    name: "Serafina",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Serafina"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/serafina.jpg",
    note: "F2F",
  },
  {
    name: "Adrian Mills",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Adrian Mills"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/adrian-mills.jpg",
  },
  {
    name: "Hector Oaks",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Hector Oaks"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/hector-oaks.webp",
    note: "F2F",
  },
  {
    name: "Odymel",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Odymel"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/odymel.jpg",
  },
  {
    name: "Emilija",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Emilija"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/emilija.jpg",
    note: "F2F",
  },
  {
    name: "Fenrick",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Fenrick"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/fenrick.jpg",
  },
  {
    name: "Supergloss",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Supergloss"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/supergloss.jpg",
    note: "F2F",
  },

  // DAY 2 — OUTDOOR (44)
  {
    name: "Aiden",
    day: 2,
    stage: "outdoor",
    stageHost: "44",
    bio: placeholderBio("Aiden"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/aiden.jpg",
    note: "B2B",
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "outdoor",
    stageHost: "44",
    bio: placeholderBio("Kobosil"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/kobosil.jpg",
  },
  {
    name: "David Löhlein",
    day: 2,
    stage: "outdoor",
    stageHost: "44",
    bio: placeholderBio("David Löhlein"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/david-lohlein.jpg",
  },
  {
    name: "Future.666",
    day: 2,
    stage: "outdoor",
    stageHost: "44",
    bio: placeholderBio("Future.666"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/future666.jpg",
  },

  // DAY 2 — INDOOR (44)
  {
    name: "Clara Cuve",
    day: 2,
    stage: "indoor",
    stageHost: "44",
    bio: placeholderBio("Clara Cuve"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/clara-cuve.jpg",
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "indoor",
    stageHost: "44",
    bio: placeholderBio("Kobosil"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/kobosil.jpg",
  },
  {
    name: "Somewhen",
    day: 2,
    stage: "indoor",
    stageHost: "44",
    bio: placeholderBio("Somewhen"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/somewhen.jpg",
  },
  {
    name: "Ueberrest",
    day: 2,
    stage: "indoor",
    stageHost: "44",
    bio: placeholderBio("Ueberrest"),
    isPlaceholderBio: true,
    imageUrl: "/assets/artists/ueberrest.jpg",
    note: "B2B2B",
  },
];

// ---- HELPER: Group artists by stage ----

export function getStages(): StageInfo[] {
  return [
    {
      day: 1,
      dayLabel: "Day 1 — Saturday",
      stage: "outdoor",
      host: "ÄGAPĒ",
      artists: ARTISTS.filter((a) => a.day === 1 && a.stage === "outdoor"),
    },
    {
      day: 1,
      dayLabel: "Day 1 — Saturday",
      stage: "indoor",
      host: "Face 2 Face",
      artists: ARTISTS.filter((a) => a.day === 1 && a.stage === "indoor"),
    },
    {
      day: 2,
      dayLabel: "Day 2 — Sunday",
      stage: "outdoor",
      host: "44",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "outdoor"),
    },
    {
      day: 2,
      dayLabel: "Day 2 — Sunday",
      stage: "indoor",
      host: "44",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "indoor"),
    },
  ];
}

// ---- PHOTOS ----

export const PHOTOS = [
  "/assets/photos/1D3A9267.jpg",
  "/assets/photos/1D3A9488.jpeg",
  "/assets/photos/1D3A9620-2.jpeg",
  "/assets/photos/3BF199AD.jpg",
  "/assets/photos/AGAPE_D7.jpeg",
  "/assets/photos/AGAPE_F5.jpeg",
  "/assets/photos/DSC05585.jpeg",
  "/assets/photos/DSC05632.jpeg",
];

// ---- VIDEOS ----

export const VIDEOS = {
  davidLohlein: {
    mp4: "/assets/videos/david_lohlein_4x5.mp4",
    webm: "/assets/videos/david_lohlein_4x5.webm",
  },
  flyerAnimated: {
    mp4: "/assets/videos/flyer-animated.mp4",
    webm: "/assets/videos/flyer-animated.webm",
  },
};

// ---- LOGOS ----

export const LOGOS = {
  festivalBlack: "/assets/logos/AGAPE_FESTIVAL.PNG",
  festivalWhite: "/assets/logos/AGAPE_FESTIVALWHITE.PNG",
  festivalWhiteTransparent: "/assets/logos/aFestWhite.png",
  festivalBlackTransparent: "/assets/logos/aFestBlack.png",
  agapeWhite: "/assets/logos/agape_logo_white.png",
  agapeWhiteSm: "/assets/logos/agape_logo_white_sm.png",
  agapeIcon: "/assets/logos/agape_icon.png",
  agapeTxt: "/assets/logos/agape_txtLogo.png",
  flyer2d: "/assets/flyer-2d.png",
};
