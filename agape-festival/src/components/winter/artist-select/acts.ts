import type { ArtistEntry, DayNumber, NamedArtist, WinterDay } from "@/data/winter";

export const isNamed = (e: ArtistEntry): e is NamedArtist => e.kind === "artist";

/** One announced act and where it sits in its day (the panel's "3 of 9"). */
export interface Act {
  artist: NamedArtist;
  day: DayNumber;
  /** 1-based position within its day, in flyer order. */
  index: number;
  /** Announced acts that day. */
  total: number;
}

export interface RosterDay {
  day: DayNumber;
  /** "Day 1" */
  label: string;
  /** "Friday, February 19" */
  date: string;
  acts: Act[];
  /** The day still has unannounced acts (the flyer's redaction blobs). */
  more: boolean;
}

export interface Roster {
  days: [RosterDay, RosterDay];
  /** Every announced act, Day 1 then Day 2: the panel's previous / next order. */
  order: Act[];
  bySlug: Map<string, Act>;
  /** The act shown first: the first one with footage or a photo, so the feature is never bare. */
  first: string;
}

/** "Friday, February 19, 2027" → "Friday, February 19" (the year is on every other line of the page). */
const withoutYear = (s: string) => s.replace(/,\s*\d{4}$/, "");

export function buildRoster(artists: readonly ArtistEntry[], days: readonly [WinterDay, WinterDay]): Roster {
  const make = (d: WinterDay): RosterDay => {
    const named = artists.filter((a): a is NamedArtist => isNamed(a) && a.day === d.day);
    return {
      day: d.day,
      label: `Day ${d.day}`,
      date: withoutYear(d.dateLong),
      acts: named.map((artist, i) => ({ artist, day: d.day, index: i + 1, total: named.length })),
      more: artists.some((a) => !isNamed(a) && a.day === d.day),
    };
  };
  const pair: [RosterDay, RosterDay] = [make(days[0]), make(days[1])];
  const order = [...pair[0].acts, ...pair[1].acts];
  const lead = order.find((a) => a.artist.clip || a.artist.headshot) ?? order[0];
  return { days: pair, order, bySlug: new Map(order.map((a) => [a.artist.slug, a])), first: lead.artist.slug };
}

/**
 * A tile's name as words. The two words longer than the narrowest tile (phones, 14px) carry a soft
 * hyphen at their seam; each word is set as its own inline block, so a name wraps between words first
 * and only a word that is wider than the tile on its own breaks at its hyphen.
 */
const BREAKS: Record<string, string> = { Heggemann: "Hegge­mann", Onlynumbers: "Only­numbers" };
export const tileWords = (name: string) => name.split(/\s+/).map((w) => BREAKS[w] ?? w);

/** Media the feature can show, best first: the clip (with its poster), else the photo. */
export function featureMedia(a: NamedArtist) {
  if (a.clip) return { kind: "video" as const, src: a.clip, poster: a.clipPoster ?? a.headshotLarge, focus: a.splashFocus ?? "50% 45%" };
  if (a.headshotLarge || a.headshot) return { kind: "image" as const, src: (a.headshotLarge ?? a.headshot)!, poster: null, focus: a.splashFocus ?? "50% 30%" };
  return null;
}

/** A photo as a srcset (600 / 1200 wide WebP). */
export function photoSet(a: NamedArtist) {
  if (!a.headshot && !a.headshotLarge) return null;
  const parts = [a.headshot && `${a.headshot} 600w`, a.headshotLarge && `${a.headshotLarge} 1200w`].filter(Boolean);
  return { src: (a.headshot ?? a.headshotLarge)!, srcSet: parts.join(", ") };
}
