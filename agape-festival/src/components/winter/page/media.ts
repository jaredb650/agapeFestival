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
  /** Optional portrait encode for phones. */
  srcMobile?: string;
}

export interface HeroMedia {
  /** The still under the video (or the hero itself when there's no video). The LCP element. */
  desktop: Still & { objectPosition: string };
  mobile: Still & { objectPosition: string };
  alt: string;
  /** On-screen credit; null when the source isn't known. */
  credit: string | null;
  /** Video over the still: it fades in only once actually playing (iOS Low Power Mode safe). */
  video: HeroVideo | null;
}

const h = manifest.hero;
const hv = manifest.heroVideo;

/** The Sept DJ photo by @EMILYGUZZ (the first winter hero). */
export const HERO_PHOTO: HeroMedia = {
  desktop: { src: h.desktop.src, width: h.desktop.width, height: h.desktop.height, objectPosition: h.desktop.objectPosition },
  // 1080x1920 q70 re-export (J4) of the same crop as hero-1200: ~75 KB lighter on the mobile LCP path.
  mobile: { src: h.mobileLight.src, width: h.mobileLight.width, height: h.mobileLight.height, objectPosition: h.mobileLight.objectPosition },
  alt: h.desktop.alt,
  credit: h.credit,
  video: null,
};

/** The Kobosil/FRONTROW clip "for now" (Jared, Oct 30). Credit unknown, so none is shown. */
export const HERO_VIDEO: HeroMedia = {
  desktop: { src: hv.poster.src, width: hv.poster.width, height: hv.poster.height, objectPosition: hv.objectPosition },
  mobile: { src: hv.poster.src, width: hv.poster.width, height: hv.poster.height, objectPosition: hv.objectPositionMobile },
  alt: hv.alt,
  credit: hv.credit,
  video: { src: hv.src },
};

/** The live hero. Switch back to the photo with `HERO = HERO_PHOTO`. */
export const HERO: HeroMedia = HERO_VIDEO;

/**
 * The ÄGAPĒ Festival logo for the hero, from the clean 1233x682 white master
 * (~/Downloads/AgapeFestival_Logo, Oct 30); the old 586px PNG looked soft at
 * the new centred size. Near-lossless WebP keeps the fine ring lines crisp.
 * The 1233 file doubles as the desktop WebGL glitch texture (already cached).
 */
export const HERO_LOGO = {
  src: "/assets/winter/hero/logo-festival-1233.webp",
  srcSet: "/assets/winter/hero/logo-festival-680.webp 680w, /assets/winter/hero/logo-festival-1233.webp 1233w",
  width: 1233,
  height: 682,
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
  video: { src: string; width: number; height: number; fps: number };
  /** Seconds between keyframes in the desktop encode (seeks there decode one frame). */
  keyframeStep: number;
  frames: { dir: string; count: number; width: number; height: number; /** seconds per frame */ step: number };
  posterDesktop: Still;
  posterMobile: Still;
  /** Time shown by the posters. */
  posterTime: number;
  brightRanges: BgRange[];
  /** Start times of the glitch shots (inverted flashes, whiteout). Crossing one fires a burst on the flyer layers. */
  glitchCuts: number[];
  /** The playable footage, [start, end] in seconds. The scrub never shows time outside these (dark or black frames). */
  segments: [number, number][];
  /** ~0.5 KB inline still under everything, so the background is never plain black. */
  placeholder: string;
}

export const BG: BgMedia = {
  duration: bg.duration,
  video: { src: bg.desktop.src, width: bg.desktop.width, height: bg.desktop.height, fps: bg.desktop.fps },
  keyframeStep: bg.desktop.gop / bg.desktop.fps,
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
  segments: bg.segments.map(([a, b]) => [a, b] as [number, number]),
  placeholder: bg.placeholder.dataUri,
};

/**
 * Where the scrub lands at each scroll anchor (seconds into PLAIN V1).
 * The page puts `data-bg-at` on the element whose top reaching the viewport
 * top should show that time; between anchors the scrub runs linearly through
 * the playable `segments` only (dark stretches are skipped as cuts).
 */
export const BG_TIMES = {
  /** Page top, under the hero: the antenna mast, lit (the dark platform underside before 3.67 s is skipped). */
  top: 3.7,
  /** Hero fully gone: mid mast drift. */
  heroGone: 4.6,
  /** Flyer reassembled: the exact still the v3 flyer is built on. */
  flyer: manifest.flyer.backgroundStill.animationTime,
  /** Sticky flyer releases. */
  flyerRelease: 13.6,
  /** Section after the lineup: the ghost-negative cut has just played (14.63–15.17). */
  afterLineup: 15.167,
  /** Page bottom: the inverted mast, before the footage fades to black at ~19 s. */
  end: 18.6,
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
