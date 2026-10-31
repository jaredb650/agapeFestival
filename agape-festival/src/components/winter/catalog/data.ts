// Catalog numbering and plain-text labels for the catalog variant.
// Server-side only: components pass the results down as plain props.
import { ARTIST_BY_SLUG, LINEUP, SECTIONS, WINTER_DAYS, type DayNumber, type SectionId } from "@/data/winter";

/** The release code: ÄGAPĒ, Winter 2027. Sections are "AGP-W27 / 02", acts "001"–"017". */
export const CAT = "AGP-W27";

const LABELS: Partial<Record<SectionId, string>> = {
  artists: "The roster",
  lineup: "Lineup",
  tickets: "Tickets",
  merch: "Merch",
  faq: "FAQ",
  lockers: "Lockers",
  "getting-here": "Getting here",
};

/** Content sections in page order (hero, flyer and footer carry no number): the roster comes before the lineup. */
const PAGE_ORDER: SectionId[] = ["artists", "lineup", "tickets", "merch", "faq", "lockers", "getting-here"];
const NUMBERED = PAGE_ORDER.map((id) => SECTIONS.find((s) => s.id === id)!).filter((s) => s.enabled);

const pad = (n: number, w: number) => String(n).padStart(w, "0");

export interface SectionMeta {
  id: SectionId;
  href: string;
  label: string;
  /** "02" */
  no: string;
  /** "AGP-W27 / 02" */
  cat: string;
}

export const SECTION_META: SectionMeta[] = NUMBERED.map((s, i) => ({
  id: s.id,
  href: s.href,
  label: LABELS[s.id]!,
  no: pad(i + 1, 2),
  cat: `${CAT} / ${pad(i + 1, 2)}`,
}));

export function section(id: SectionId): SectionMeta {
  const meta = SECTION_META.find((s) => s.id === id);
  if (!meta) throw new Error(`Section ${id} is not enabled`);
  return meta;
}

/** Sections in the nav (enabled + inNav), with their numbers. */
export const NAV_ITEMS = SECTION_META.filter((m) => SECTIONS.find((s) => s.id === m.id)?.inNav);

export interface Act {
  /** "001" */
  no: string;
  day: DayNumber;
  /** "Fri 19" */
  dayShort: string;
  /** null for an unannounced slot */
  slug: string | null;
  /** Proper-case name, or "To be revealed". */
  name: string;
}

/** "FRI FEB 19" → "Fri 19" */
const dayShort = (date: string) => {
  const [wd, , d] = date.split(" ");
  return `${wd[0]}${wd.slice(1).toLowerCase()} ${d}`;
};

/** Every act in flyer reading order, numbered 001 → 017 across both days (TBA slots keep their place). */
export const ACTS: Act[] = (() => {
  let n = 0;
  return LINEUP.flatMap((day) =>
    day.acts.map((act) => {
      n += 1;
      const base = { no: pad(n, 3), day: day.day, dayShort: dayShort(day.date) };
      return act.kind === "artist"
        ? { ...base, slug: act.slug, name: ARTIST_BY_SLUG[act.slug].name }
        : { ...base, slug: null, name: "To be revealed" };
    }),
  );
})();

export const DAYS = WINTER_DAYS.map((d) => ({ day: d.day, short: dayShort(d.date), long: d.dateLong.replace(/, \d{4}$/, "") }));

/** Arrow glyph with the text-presentation selector, so iOS never draws it as an emoji. */
export const ARROW = "→︎";
