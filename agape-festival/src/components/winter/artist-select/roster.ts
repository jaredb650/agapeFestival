import type { ArtistEntry, DayNumber, NamedArtist } from "@/data/winter";
import { placeWing, pyramidCap, pyramidCells, pyramidRows, ROW_CAP, type Box } from "./geometry";

export interface Slot {
  entry: ArtistEntry;
  day: DayNumber;
  /** 1-based index within its day (tile backdrop crop, splash frame choice). */
  index: number;
  /** Desktop shard. */
  box: Box;
  /** Mobile pyramid cell, square steps. */
  cell: { x: number; y: number };
}

export interface Wing {
  day: DayNumber;
  slots: Slot[];
  named: number;
  locked: number;
}

export interface Roster {
  wings: Record<DayNumber, Wing>;
  /** Mobile pyramid: shared by both days so switching never jumps. */
  pyramid: { cols: number; rows: number };
}

export const isNamed = (e: ArtistEntry): e is NamedArtist => e.kind === "artist";

/**
 * Split the roster into the two mirrored wings: named acts in flyer order
 * fill the top row from the centre outward, then the bottom row; locked
 * slots go last, so the TBA acts share the bottom row (and stretch to the
 * wing's outline when that row is short). Mobile reuses the same order in a
 * centred inverted pyramid.
 */
export function buildRoster(artists: readonly ArtistEntry[]): Roster {
  const ordered = (day: DayNumber) => {
    const named = artists.filter((a) => a.day === day && isNamed(a));
    const locked = artists.filter((a) => a.day === day && !isNamed(a));
    return { list: [...named, ...locked], named: named.length, locked: locked.length };
  };
  const per = { 1: ordered(1), 2: ordered(2) };
  const most = Math.max(per[1].list.length, per[2].list.length);
  const cols = pyramidCap(most);
  const rows = pyramidRows(most, cols).length;

  const make = (day: DayNumber): Wing => {
    const { list, named, locked } = per[day];
    // Top row full (5), the rest below; a short bottom row stretches to the same outline.
    const topCount = Math.min(ROW_CAP[0], list.length);
    const boxes = placeWing(day, [topCount, list.length - topCount]);
    const cells = pyramidCells(list.length, cols);
    const slots = list.map((entry, i) => {
      const row = i < topCount ? 0 : 1;
      const box = boxes[row][row === 0 ? i : i - topCount];
      return { entry, day, index: i + 1, box, cell: cells[i] };
    });
    return { day, slots, named, locked };
  };
  return { wings: { 1: make(1), 2: make(2) }, pyramid: { cols, rows } };
}

// ---- Presentation helpers -------------------------------------------------

/** Tower-footage frames (from the background scrub) with strong structure, one per act without footage. */
const FRAMES = [4, 12, 33, 38, 47, 55, 70, 85, 95, 99, 118, 124, 131, 137];
/** Ghost-negative frames: the backdrop for unannounced acts. */
const LOCKED_FRAMES = [44, 113, 44];
/** The quiet backdrop frame behind footage / photo splashes. */
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

/** Longest word of a name, in characters: the type size fits it. */
export const longestWord = (s: string) => Math.max(...s.split(/\s+/).map((w) => w.length));

/** Media the splash can show, best first. */
export function splashMedia(entry: ArtistEntry | null) {
  if (!entry || !isNamed(entry)) return null;
  if (entry.clip) return { kind: "video" as const, src: entry.clip, poster: entry.clipPoster ?? entry.headshotLarge, focus: entry.splashFocus };
  if (entry.headshotLarge || entry.headshot)
    return { kind: "still" as const, src: (entry.headshotLarge ?? entry.headshot)!, poster: null, focus: entry.splashFocus };
  return null;
}
