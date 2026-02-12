// ============================================================
// ÄGAPĒ FESTIVAL 2026 — Single source of truth for all content
// ============================================================

// Base path for GitHub Pages deployment — empty in dev, /agapeFestival in prod
export const BASE_PATH = process.env.NODE_ENV === "production" ? "/agapeFestival" : "";

export interface Artist {
  name: string;
  day: 1 | 2;
  stage: "outdoor" | "indoor";
  stageHost: string;
  bio: string;
  isPlaceholderBio: boolean;
  imageUrl: string | null;
  videoUrl?: string;
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
    "ÄGAPĒ started in a warehouse somewhere in Brooklyn. No grand strategy — just nights that felt memorable, music that pushed boundaries, and a room where people could lose themselves. The early shows were simple and focused. Over time, more people found their way in. The gatherings became regular. Familiar faces turned into a tangible community. Nothing happened overnight. It just built, slowly and with fierce intention.",
  aboutExtended:
    "Now we're bringing that same spirit into something new. ÄGAPĒ Festival is beyond mere scale — it's about dwelling in an environment shaped by the people who built us up. A full weekend together in a communal plane, the kind we've been building toward for half a decade. ÄGAPĒ welcomes you to the movement.",
  merchComingSoon: "Merch dropping soon. Stay tuned.",
  origin: "Brooklyn, New York",
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
    logoUrl: `${BASE_PATH}/assets/logos/agape_logo_white.png`,
    website: "https://agapemusic.us/",
  },
  {
    name: "44 Label Group",
    logoUrl: `${BASE_PATH}/assets/logos/44-logo-white.png`,
  },
  {
    name: "240 km/h",
    logoUrl: `${BASE_PATH}/assets/logos/240-logo-white.png`,
  },
  {
    name: "Face 2 Face",
    logoUrl: `${BASE_PATH}/assets/logos/f2f-logo-white.png`,
    logoUrlAlt: `${BASE_PATH}/assets/logos/f2f-logo-black.png`,
  },
  {
    name: "HotMeal",
    logoUrl: `${BASE_PATH}/assets/logos/hotmeal-logo-white.png`,
  },
  {
    name: "Industry City",
    logoUrl: `${BASE_PATH}/assets/logos/ic-logo-block-white.png`,
    logoUrlAlt: `${BASE_PATH}/assets/logos/ic-logo-line.png`,
  },
];

// ---- ARTISTS ----

const placeholderBio = (name: string) =>
  `${name} is a force in the global hard techno scene, known for relentless energy and commanding performances. [Placeholder — awaiting EPK]`;

export const ARTISTS: Artist[] = [
  // DAY 1 — OUTDOOR (Hot Meal)
  {
    name: "Ollie Lishman",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: placeholderBio("Ollie Lishman"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/ollie-lishman/press-kit/Hot%20Meal%20Records1126.jpg`,
  },
  {
    name: "FUMI",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: placeholderBio("FUMI"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/fumi/press-kit/retouch_fumi_07.jpg`,
  },
  {
    name: "Mischluft",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: placeholderBio("Mischluft"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/mischluft/press-kit/Mischluft_59.jpg`,
  },
  {
    name: "Bad Boombox",
    day: 1,
    stage: "outdoor",
    stageHost: "Hot Meal",
    bio: placeholderBio("Bad Boombox"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/bad-boombox/press-kit/_DSC8435.jpeg`,
  },

  // DAY 1 — INDOOR (Face 2 Face)
  {
    name: "Cloudy",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Cloudy"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/cloudy/press-kit/PressShotNEW.jpeg`,
  },
  {
    name: "Serafina",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Serafina"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/serafina/press-kit/f59238bc-5a52-43c2-8488-6d4049a019e1.JPG`,
    note: "F2F",
  },
  {
    name: "Adrian Mills",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Adrian Mills"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/adrian-mills/press-kit/Adri%C3%A1n_Mills-191.jpg`,
  },
  {
    name: "Hector Oaks",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Hector Oaks"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/hector-oaks/press-kit/PRESS%20H%C3%89CTOR%208.jpg`,
    note: "F2F",
  },
  {
    name: "Odymel",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Odymel"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/odymel/press-kit/Highres_Odymel_ByMayliSterkendries--7.jpg`,
  },
  {
    name: "Emilija",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Emilija"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/emilija/press-kit/EMILIJA_6.jpeg`,
    note: "F2F",
  },
  {
    name: "Fenrick",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Fenrick"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/fenrick/press-kit/FENRICK-PRESSKIT.RAPHAEL.CHENE-18%20(1).jpg`,
  },
  {
    name: "Supergloss",
    day: 1,
    stage: "indoor",
    stageHost: "Face 2 Face",
    bio: placeholderBio("Supergloss"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/supergloss/press-kit/Supergloss10%20(1).jpg`,
    note: "F2F",
  },

  // DAY 2 — OUTDOOR (44)
  {
    name: "Aiden",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Aiden"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/aiden/press-kit/aiden-headshot.jpeg`,
    videoUrl: `${BASE_PATH}/assets/artists/aiden/press-kit/aiden-video.mp4`,
    note: "B2B",
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Kobosil"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-clip.mp4`,
  },
  {
    name: "David Löhlein",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("David Löhlein"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/david-lohlein/placeholder/david-lohlein.jpg`,
  },
  {
    name: "Future.666",
    day: 2,
    stage: "outdoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Future.666"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/future666/press-kit/future666-headshot.jpg`,
    videoUrl: `${BASE_PATH}/assets/artists/future666/press-kit/future666-video.mp4`,
  },

  // DAY 2 — INDOOR (44)
  {
    name: "Clara Cuve",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Clara Cuve"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/clara-cuve/press-kit/claracuve-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/clara-cuve/press-kit/Clara_Closing_01.mp4`,
  },
  {
    name: "Kobosil",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Kobosil"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/kobosil/press-kit/kobosil-clip.mp4`,
  },
  {
    name: "Somewhen",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Somewhen"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/somewhen/press-kit/somewhen-headshot.JPG`,
    videoUrl: `${BASE_PATH}/assets/artists/somewhen/press-kit/somewhen-video.mp4`,
  },
  {
    name: "Ueberrest",
    day: 2,
    stage: "indoor",
    stageHost: "44 Label Group",
    bio: placeholderBio("Ueberrest"),
    isPlaceholderBio: true,
    imageUrl: `${BASE_PATH}/assets/artists/ueberrest/press-kit/ueberrest-headshot.png`,
    videoUrl: `${BASE_PATH}/assets/artists/ueberrest/press-kit/ueberrest-video.mp4`,
  },
];

// ---- HELPER: Group artists by stage ----

export function getStages(): StageInfo[] {
  return [
    {
      day: 1,
      dayLabel: "Day 1 — Saturday",
      stage: "outdoor",
      host: "Hot Meal",
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
      host: "44 Label Group",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "outdoor"),
    },
    {
      day: 2,
      dayLabel: "Day 2 — Sunday",
      stage: "indoor",
      host: "44 Label Group",
      artists: ARTISTS.filter((a) => a.day === 2 && a.stage === "indoor"),
    },
  ];
}

// ---- STAGE HOST LOGOS (for navbar swap) ----

export const STAGE_LOGOS: Record<string, string> = {
  "Hot Meal": `${BASE_PATH}/assets/logos/hotmeal-logo-white.png`,
  "Face 2 Face": `${BASE_PATH}/assets/logos/f2f-logo-white.png`,
  "44 Label Group": `${BASE_PATH}/assets/logos/44-logo-white.png`,
};

// ---- PHOTOS ----

export const PHOTOS = [
  `${BASE_PATH}/assets/photos/web/1D3A9267.jpg`,
  `${BASE_PATH}/assets/photos/web/1D3A9488.jpeg`,
  `${BASE_PATH}/assets/photos/web/1D3A9620-2.jpeg`,
  `${BASE_PATH}/assets/photos/web/3BF199AD.jpg`,
  `${BASE_PATH}/assets/photos/web/AGAPE_D7.jpeg`,
  `${BASE_PATH}/assets/photos/web/AGAPE_F5.jpeg`,
  `${BASE_PATH}/assets/photos/web/DSC05585.jpeg`,
  `${BASE_PATH}/assets/photos/web/DSC05632.jpeg`,
  `${BASE_PATH}/assets/photos/AGAPE_D38.jpg`,
  `${BASE_PATH}/assets/photos/AGAPE_D14.jpg`,
  `${BASE_PATH}/assets/photos/AGAPE_F14.jpg`,
];

// ---- VIDEOS ----

export const VIDEOS = {
  davidLohlein: {
    mp4: `${BASE_PATH}/assets/videos/david_lohlein_4x5.mp4`,
    webm: `${BASE_PATH}/assets/videos/david_lohlein_4x5.webm`,
  },
  flyerAnimated: {
    mp4: `${BASE_PATH}/assets/videos/flyer-animated.mp4`,
    webm: `${BASE_PATH}/assets/videos/flyer-animated.webm`,
  },
  skullCorridor: {
    mp4: `${BASE_PATH}/assets/videos/skull-corridor.mp4`,
  },
  redStrobes: {
    mp4: `${BASE_PATH}/assets/videos/red-strobes.mp4`,
  },
};

// ---- LOGOS ----

export const LOGOS = {
  festivalBlack: `${BASE_PATH}/assets/logos/AGAPE_FESTIVAL.PNG`,
  festivalWhite: `${BASE_PATH}/assets/logos/AGAPE_FESTIVALWHITE.PNG`,
  festivalWhiteTransparent: `${BASE_PATH}/assets/logos/aFestWhite.png`,
  festivalBlackTransparent: `${BASE_PATH}/assets/logos/aFestBlack.png`,
  agapeWhite: `${BASE_PATH}/assets/logos/agape_logo_white.png`,
  agapeWhiteSm: `${BASE_PATH}/assets/logos/agape_logo_white_sm.png`,
  agapeIcon: `${BASE_PATH}/assets/logos/agape_icon.png`,
  agapeTxt: `${BASE_PATH}/assets/logos/agape_txtLogo.png`,
  flyer2d: `${BASE_PATH}/assets/flyer-2d.png`,
};
