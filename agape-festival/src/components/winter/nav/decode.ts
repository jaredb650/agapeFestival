// HUD text decode: characters cycle through pixel glyphs and resolve left to
// right. Writes textContent directly (no React renders per frame). One shared
// rAF loop drives every running decode, so a menu booting 20 labels at once is
// still a single frame callback.

const GLYPHS = "#%&*+/<>=?@[]_\\|01:ΛΞ";

interface Job {
  el: HTMLElement;
  text: string;
  start: number;
  ms: number;
}

const jobs = new Set<Job>();
let raf = 0;

function frame(now: number) {
  jobs.forEach((job) => {
    if (now < job.start) return;
    const t = Math.min(1, (now - job.start) / job.ms);
    const settled = Math.floor(t * job.text.length);
    let out = "";
    for (let i = 0; i < job.text.length; i++) {
      const ch = job.text[i];
      out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    job.el.textContent = out;
    if (t >= 1) jobs.delete(job);
  });
  raf = jobs.size ? requestAnimationFrame(frame) : 0;
}

/**
 * Decode `text` into `el` after `delay` ms over `ms` ms (the element keeps its
 * current content until then). Returns a cancel that snaps to the final text.
 */
export function decode(el: HTMLElement, text: string, { ms = 420, delay = 0, pre = false } = {}): () => void {
  jobs.forEach((j) => j.el === el && jobs.delete(j));
  // `pre`: show noise right away, so the final text never flashes before the decode starts.
  if (pre) el.textContent = text.replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
  const job: Job = { el, text, start: performance.now() + delay, ms };
  jobs.add(job);
  if (!raf) raf = requestAnimationFrame(frame);
  return () => {
    if (jobs.delete(job)) el.textContent = text;
  };
}

/** Stop every decode inside `root` and snap them to their final text. */
export function settleAll(root: HTMLElement) {
  jobs.forEach((j) => {
    if (root.contains(j.el)) {
      j.el.textContent = j.text;
      jobs.delete(j);
    }
  });
}
