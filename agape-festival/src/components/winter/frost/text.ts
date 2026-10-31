// Small copy helpers. The data file stores the flyer's all-caps strings; the
// page sets them in sentence case and keeps real acronyms intact.
const KEEP = new Set(["FAQ", "DICE", "NYC", "NY", "MEKA"]);

/** "GETTING HERE" → "Getting here", "FAQ" stays "FAQ". Drops trailing arrows. */
export function sentence(s: string): string {
  const clean = s.replace(/[\s→↗︎▸]+$/u, "").trim();
  const words = clean.split(/\s+/);
  return words
    .map((w, i) => {
      if (KEEP.has(w.replace(/[^A-Z]/g, ""))) return w;
      const lower = w.toLowerCase();
      return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

/** Artist names as people write them: "BEN KLOCK" → "Ben Klock", "AZZEL 447" → "Azzel 447". */
export function properName(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
