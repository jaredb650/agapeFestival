// Frame packs: the background scrub's WebP frames concatenated into a few
// files (see context/winter-redesign/media-scripts/p3_frame_packs.py). Each
// frame is a self-delimiting RIFF chunk, so a pack splits back into the exact
// original files while it streams in: one request per ~11 frames, the same
// bytes and pixels, and still one small decode per frame (unlike a sprite
// sheet, which has to decode all of its frames at once).

export interface FramePack {
  src: string;
  bytes: number;
  /** Frame indices, in the order their files sit in the pack. */
  frames: number[];
}

const RIFF = 0x46464952; // "RIFF" little-endian
const WEBP = 0x50424557; // "WEBP"

/**
 * Fetch `pack` and call `onFrame` with each frame's WebP Blob the moment its
 * last byte has arrived. Resolves with the number of frames delivered; rejects
 * on a network error or malformed data (frames delivered before that stand).
 */
export async function streamFramePack(
  pack: FramePack,
  onFrame: (index: number, blob: Blob) => void,
  signal?: AbortSignal,
): Promise<number> {
  const res = await fetch(pack.src, { signal });
  if (!res.ok) throw new Error(`pack ${res.status}`);

  let buf = new Uint8Array(Math.max(16, pack.bytes));
  let view = new DataView(buf.buffer);
  let filled = 0;
  let pos = 0;
  let k = 0;

  const drain = () => {
    while (k < pack.frames.length && filled - pos >= 12) {
      if (view.getUint32(pos, true) !== RIFF || view.getUint32(pos + 8, true) !== WEBP) throw new Error("pack: not a WebP");
      const len = view.getUint32(pos + 4, true) + 8;
      if (filled - pos < len) return;
      onFrame(pack.frames[k++], new Blob([buf.subarray(pos, pos + len)], { type: "image/webp" }));
      pos += len;
    }
  };
  const append = (chunk: Uint8Array) => {
    if (filled + chunk.length > buf.length) {
      const grown = new Uint8Array(Math.max(buf.length * 2, filled + chunk.length));
      grown.set(buf.subarray(0, filled));
      buf = grown;
      view = new DataView(buf.buffer);
    }
    buf.set(chunk, filled);
    filled += chunk.length;
    drain();
  };

  const reader = res.body?.getReader?.();
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) append(value);
    }
  } else {
    append(new Uint8Array(await res.arrayBuffer()));
  }
  if (k < pack.frames.length) throw new Error("pack: truncated");
  return k;
}
