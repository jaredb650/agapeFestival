import type { ArtistEntry, DayNumber, NamedArtist } from "@/data/winter";
import { placeWing, ROW_CAP, type Box } from "./geometry";

export interface Slot {
  entry: ArtistEntry;
  day: DayNumber;
  /** 1-based index within its day (tile number, footer counter). */
  index: number;
  box: Box;
}

export interface Wing {
  day: DayNumber;
  slots: Slot[];
  named: number;
  locked: number;
}

export const isNamed = (e: ArtistEntry): e is NamedArtist => e.kind === "artist";

/**
 * Split the roster into the two mirrored wings: named acts in flyer order
 * fill the top row from the centre outward, then the bottom row; locked
 * slots go last, so the TBA acts share the bottom row (and stretch to the
 * wing's outline when that row is short).
 */
export function buildWings(artists: readonly ArtistEntry[]): Record<DayNumber, Wing> {
  const make = (day: DayNumber): Wing => {
    const named = artists.filter((a) => a.day === day && isNamed(a));
    const locked = artists.filter((a) => a.day === day && !isNamed(a));
    const ordered = [...named, ...locked];
    // Top row full (5), the rest below; a short bottom row stretches to the same outline.
    const topCount = Math.min(ROW_CAP[0], ordered.length);
    const rows: [number, number] = [topCount, ordered.length - topCount];
    const boxes = placeWing(day, rows);
    const slots = ordered.map((entry, i) => {
      const row = i < topCount ? 0 : 1;
      const k = row === 0 ? i : i - topCount;
      return { entry, day, index: i + 1, box: boxes[row][k] };
    });
    return { day, slots, named: named.length, locked: locked.length };
  };
  return { 1: make(1), 2: make(2) };
}

// ---- Presentation helpers -------------------------------------------------

/** Tower-footage frames (from the background scrub) with strong structure, one per act without footage. */
const FRAMES = [4, 12, 33, 38, 47, 55, 70, 85, 95, 99, 118, 124, 131, 137];
/** Ghost-negative frames: the "encrypted" look for locked acts. */
const LOCKED_FRAMES = [44, 113, 44];
/** The idle splash: one frame, mirrored across the seam. */
export const IDLE_FRAME = 124;

const pad3 = (n: number) => String(n).padStart(3, "0");
export const frameSrc = (dir: string, n: number) => `${dir}f-${pad3(n)}.webp`;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Stable per-act frame number, so each act's no-footage splash shows a different part of the tower. */
export function frameFor(entry: ArtistEntry, order: number): number {
  if (!isNamed(entry)) return LOCKED_FRAMES[(Number(entry.slug.slice(-1)) - 1) % LOCKED_FRAMES.length];
  return FRAMES[(order + (hash(entry.slug) % 3)) % FRAMES.length];
}

/** Two-letter monogram: initials for two-word names, first two letters otherwise. */
export function monogram(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2027-02-19" → "02.19.27" (LCD date). */
export function lcdDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${m}.${d}.${y.slice(2)}`;
}

/** Media the splash can show, best first. */
export function splashMedia(entry: ArtistEntry | null) {
  if (!entry || !isNamed(entry)) return null;
  if (entry.clip) return { kind: "video" as const, src: entry.clip, poster: entry.clipPoster ?? entry.headshotLarge, focus: entry.splashFocus };
  if (entry.headshotLarge || entry.headshot)
    return { kind: "still" as const, src: (entry.headshotLarge ?? entry.headshot)!, poster: null, focus: entry.splashFocus };
  return null;
}
