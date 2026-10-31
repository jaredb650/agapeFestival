// Media for the winter page, read from the media pipeline's manifest
// (public/assets/winter/manifest.json) so paths and sizes are never hard-coded.
// Import this from server components only and pass plain props down, so the
// manifest never ships in a client bundle.
import manifest from "../../../../public/assets/winter/manifest.json";
import type { FramePack } from "../load/framePacks";
import type { VideoSet } from "../load/videoSource";

export interface Still {
  src: string;
  width: number;
  height: number;
}

export interface HeroVideo {
  /** H.264 MP4, muted, no audio track, faststart. */
  src: string;
  /** Optional portrait encode for phones (H.264). */
  srcMobile?: string;
  /** AV1 / HEVC / H.264 of `src`, best first: pick with load/videoSource's pickVideoSource. */
  set?: VideoSet;
  /** The same for `srcMobile`. */
  setMobile?: VideoSet;
}

type ManifestVideo = { src: string; type: string; width: number; height: number; bitrate: number };
/** Manifest sources (best first, H.264 last) → a VideoSet. */
const videoSet = (sources: ManifestVideo[], fps: number): VideoSet => {
  const h264 = sources[sources.length - 1];
  return { sources: sources.map(({ src, type }) => ({ src, type })), width: h264.width, height: h264.height, fps, bitrate: h264.bitrate };
};

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

/**
 * The Kobosil/FRONTROW clip "for now" (Jared, Oct 30). Credit unknown, so none is shown.
 * Portrait screens get a 864x1080 crop of the poster and clip (x 236 of 1440): with
 * objectPositionMobile 41% it shows exactly the pixels the full frame shows there, for
 * about a third of the bytes.
 */
export const HERO_VIDEO: HeroMedia = {
  desktop: { src: hv.posterWebp.src, width: hv.posterWebp.width, height: hv.posterWebp.height, objectPosition: hv.objectPosition },
  mobile: { src: hv.posterMobile.src, width: hv.posterMobile.width, height: hv.posterMobile.height, objectPosition: hv.objectPositionMobile },
  alt: hv.alt,
  credit: hv.credit,
  video: {
    src: hv.src,
    srcMobile: hv.mobile.sources[hv.mobile.sources.length - 1].src,
    set: videoSet(hv.sources, hv.fps),
    setMobile: videoSet(hv.mobile.sources, hv.fps),
  },
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
  video: {
    /** H.264 (the fallback). */
    src: string;
    width: number;
    height: number;
    fps: number;
    /** AV1 / HEVC / H.264, best first, all with the same GOP. */
    sources?: VideoSet["sources"];
    /** H.264 average bits per second (for MediaCapabilities). */
    bitrate: number;
  };
  /** Seconds between keyframes in the desktop encode (seeks there decode one frame). */
  keyframeStep: number;
  frames: {
    dir: string;
    count: number;
    width: number;
    height: number;
    /** seconds per frame */
    step: number;
    /** The playable frames' files concatenated into a few requests (load/framePacks.ts). */
    packs?: FramePack[];
  };
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

const bgVideo = videoSet(bg.desktop.sources, bg.desktop.fps);

export const BG: BgMedia = {
  duration: bg.duration,
  video: {
    src: bg.desktop.src,
    width: bg.desktop.width,
    height: bg.desktop.height,
    fps: bg.desktop.fps,
    sources: bgVideo.sources,
    bitrate: bgVideo.bitrate,
  },
  keyframeStep: bg.desktop.gop / bg.desktop.fps,
  frames: {
    dir: bg.frames.dir,
    count: bg.frames.count,
    width: bg.frames.width,
    height: bg.frames.height,
    step: bg.frames.sourceFrameStep / bg.desktop.fps,
    packs: bg.frames.packs.map(({ src, bytes, frames }) => ({ src, bytes, frames })),
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
  /** 0.5x / 0.75x / 1x `w` candidates of `src` (P3), when the manifest has them. */
  srcSet?: string;
}

const fl = manifest.flyer;
const layer = (id: keyof typeof fl.layers): FlyerLayer => {
  const l = fl.layers[id];
  const variants = "variants" in l ? l.variants : [];
  const srcSet = variants.length
    ? [...variants.map((v) => `${v.src} ${v.width}w`), `${l.src} ${l.width}w`].join(", ")
    : undefined;
  return { id, src: l.src, x: l.x, y: l.y, width: l.width, height: l.height, srcSet };
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
  /** The Ä mark for the nav, where it shows 20 CSS px wide (64 px file instead of 170 px). */
  mark: { src: fl.navMark.src, width: fl.navMark.width, height: fl.navMark.height },
  logos: layer("logos"),
  story: { src: fl.storyFlyer.src, width: fl.storyFlyer.width, height: fl.storyFlyer.height },
};

export const OG_IMAGE = manifest.og.image;

// ---- Artists -----------------------------------------------------------------

/** The artist-select "no signal" preview behind artists without footage. */
export const NO_SIGNAL_STILL = BG.posterMobile;
