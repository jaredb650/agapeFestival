// Codec choice for the decorative videos. Every clip ships as AV1 and HEVC
// (small) plus H.264 (the universal fallback, always last). The rule favours
// the decoder over the download: a source is used only if the device decodes
// it in hardware (MediaCapabilities `powerEfficient`), because a software
// AV1/HEVC decode costs far more CPU and battery than hardware H.264 on the
// laptops and phones this site has to stay smooth on. So an M3/A17 gets AV1,
// most Apple devices and recent Android/Windows get HEVC, everything else H.264.

export interface VideoSource {
  src: string;
  /** Full MIME type with codecs, e.g. `video/mp4; codecs="av01.0.12M.10"`. */
  type: string;
}

export interface VideoSet {
  /** Best first; the last entry must be H.264. */
  sources: VideoSource[];
  width: number;
  height: number;
  fps: number;
  /** Average bits per second of the H.264 file (an upper bound for the others). */
  bitrate: number;
}

/**
 * The hero clip's URL for this screen: the portrait crop on portrait screens, then the
 * best codec of that set. Drop-in for `portrait && video.srcMobile ? video.srcMobile : video.src`.
 */
export function pickHeroVideo(
  video: { src: string; srcMobile?: string; set?: VideoSet; setMobile?: VideoSet },
  portrait: boolean,
): Promise<string> {
  const set = portrait && video.srcMobile ? video.setMobile : video.set;
  const plain = portrait && video.srcMobile ? video.srcMobile : video.src;
  return set ? pickVideoSource(set) : Promise.resolve(plain);
}

const cache = new Map<string, Promise<string>>();

/** Resolves to the URL to play. Never rejects; falls back to the last (H.264) source. */
export function pickVideoSource(set: VideoSet): Promise<string> {
  const fallback = set.sources[set.sources.length - 1].src;
  const key = set.sources.map((s) => s.src).join("|");
  const hit = cache.get(key);
  if (hit) return hit;
  const mc = typeof navigator !== "undefined" ? navigator.mediaCapabilities : undefined;
  const p = (async () => {
    if (!mc?.decodingInfo) return fallback;
    for (const s of set.sources.slice(0, -1)) {
      try {
        const info = await mc.decodingInfo({
          type: "file",
          video: { contentType: s.type, width: set.width, height: set.height, bitrate: set.bitrate, framerate: set.fps },
        });
        if (info.supported && info.powerEfficient) return s.src;
      } catch {
        // Unknown codec string in this browser: try the next one.
      }
    }
    return fallback;
  })();
  cache.set(key, p);
  return p;
}
