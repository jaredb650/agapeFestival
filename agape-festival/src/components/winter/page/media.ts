// Media for the winter page, read from the media pipeline's manifest
// (public/assets/winter/manifest.json) so paths and sizes are never hard-coded.
// Import this from server components only and pass plain props down, so the
// manifest never ships in a client bundle.
import manifest from "../../../../public/assets/winter/manifest.json";

export interface Still {
  src: string;
  width: number;
  height: number;
}

export interface HeroVideo {
  /** H.264 MP4, muted, no audio track, faststart. */
  src: string;
  /** Poster still shown until the video is actually playing (iOS Low Power Mode safe). */
  poster: string;
  /** Optional portrait encode for phones. */
  srcMobile?: string;
  posterMobile?: string;
}

export interface HeroMedia {
  desktop: Still & { objectPosition: string };
  mobile: Still & { objectPosition: string };
  alt: string;
  credit: string;
  /**
   * Swap the hero photo for a video by setting this one line, e.g.
   *   video: { src: "/assets/winter/hero/hero.mp4", poster: "/assets/winter/hero/hero-poster.webp" },
   * The photo stays underneath as the poster/fallback.
   */
  video: HeroVideo | null;
}

const h = manifest.hero;

export const HERO: HeroMedia = {
  desktop: { src: h.desktop.src, width: h.desktop.width, height: h.desktop.height, objectPosition: h.desktop.objectPosition },
  // 1080x1920 q70 re-export (J4) of the same crop as hero-1200: ~75 KB lighter on the mobile LCP path.
  mobile: { src: h.mobileLight.src, width: h.mobileLight.width, height: h.mobileLight.height, objectPosition: h.mobileLight.objectPosition },
  alt: h.desktop.alt,
  credit: h.credit,
  video: null,
};

/** Portrait screens get the 9:16 crop. Keep the hero <picture> and its preloads on the same query. */
export const HERO_PORTRAIT_QUERY = "(max-aspect-ratio: 3/4)";

// ---- Scroll-scrubbed background ------------------------------------------

const bg = manifest.background;

export interface BgRange {
  start: number;
  end: number;
  peakLuma: number;
}

export interface BgMedia {
  duration: number;
  video: { src: string; width: number; height: number };
  frames: { dir: string; count: number; width: number; height: number; /** seconds per frame */ step: number };
  posterDesktop: Still;
  posterMobile: Still;
  /** Time shown by the posters. */
  posterTime: number;
  brightRanges: BgRange[];
  /** Start times of the glitch shots (inverted flashes, whiteout). Crossing one fires a burst on the flyer layers. */
  glitchCuts: number[];
}

export const BG: BgMedia = {
  duration: bg.duration,
  video: { src: bg.desktop.src, width: bg.desktop.width, height: bg.desktop.height },
  frames: {
    dir: bg.frames.dir,
    count: bg.frames.count,
    width: bg.frames.width,
    height: bg.frames.height,
    step: bg.frames.sourceFrameStep / bg.desktop.fps,
  },
  posterDesktop: { src: bg.posterDesktop.src, width: bg.posterDesktop.width, height: bg.posterDesktop.height },
  posterMobile: { src: bg.posterMobile.src, width: bg.posterMobile.width, height: bg.posterMobile.height },
  posterTime: bg.posterDesktop.time,
  brightRanges: bg.brightRanges.map(({ start, end, peakLuma }) => ({ start, end, peakLuma })),
  glitchCuts: bg.shots.filter((s) => "glitch" in s && s.glitch).map((s) => s.start),
};

/**
 * Where the scrub lands at each scroll anchor (seconds into PLAIN V1).
 * The page puts `data-bg-at` on the element whose top reaching the viewport
 * top should show that time; between anchors time is linear in scroll.
 */
export const BG_TIMES = {
  /** Page top: the platform underside, lights already on. As the photo dissolves the
   *  footage hits its first glitch burst (inverted mast, 2.97–3.7 s): a white-flash cut. */
  top: 2.0,
  /** Hero fully gone: into the antenna mast drift (the posters show 4.2 s too). */
  heroGone: 4.2,
  /** Flyer reassembled: the exact still the v3 flyer is built on. */
  flyer: manifest.flyer.backgroundStill.animationTime,
  /** Sticky flyer releases. */
  flyerRelease: 13.6,
  /** Section after the lineup: the ghost-negative cut has just played (14.63–15.17). */
  afterLineup: 15.167,
  /** Page bottom: the inverted mast fading to near-black. */
  end: 19.9,
} as const;

// ---- Flyer layers ----------------------------------------------------------

export interface FlyerLayer extends Still {
  id: string;
  x: number;
  y: number;
}

const fl = manifest.flyer;
const layer = (id: keyof typeof fl.layers): FlyerLayer => {
  const l = fl.layers[id];
  return { id, src: l.src, x: l.x, y: l.y, width: l.width, height: l.height };
};

export const FLYER = {
  space: { width: fl.coordinateSpace.width, height: fl.coordinateSpace.height },
  /** 540x960 copy of the soft scrim (same look, ~1/7 the bytes). */
  scrim: { src: fl.scrimSmall.src, width: fl.scrimSmall.width, height: fl.scrimSmall.height },
  /** Reading order: they float up and lock in roughly in this order. */
  layers: [
    layer("logo-mark"),
    layer("logo-festival"),
    layer("title"),
    layer("day1-label"),
    layer("day1-names"),
    layer("day2-label"),
    layer("day2-names"),
    layer("date"),
  ],
  dayLabels: { 1: layer("day1-label"), 2: layer("day2-label") },
  date: layer("date"),
  /** 640px copy of the date scrawl for the hero (J4). */
  dateSmall: { src: fl.dateSmall.src, width: fl.dateSmall.width, height: fl.dateSmall.height },
  mark: layer("logo-mark"),
  logos: layer("logos"),
  story: { src: fl.storyFlyer.src, width: fl.storyFlyer.width, height: fl.storyFlyer.height },
};

export const OG_IMAGE = manifest.og.image;

// ---- Artists -----------------------------------------------------------------

/** The artist-select "no signal" preview behind artists without footage. */
export const NO_SIGNAL_STILL = BG.posterMobile;
