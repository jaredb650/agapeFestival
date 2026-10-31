// Small shared bits for the HUD bar and the menu.

/** Festival-local clock text (New York), "18:42:07". */
const fmt =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    : null;
export const nycTime = (d = new Date()) => (fmt ? fmt.format(d) : d.toTimeString().slice(0, 8));

/** "2027-02-19" + "2027-02-20" → "02.19–20.27". */
export function dateCode(startIso: string, endIso: string) {
  const [y, m, d] = startIso.split("-");
  const [, m2, d2] = endIso.split("-");
  const end = m2 === m ? d2 : `${m2}.${d2}`;
  return `${m}.${d}–${end}.${y.slice(2)}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Sections the HUD tracks that aren't nav links (labels for the LCD readout). */
export const EXTRA_LABELS: Record<string, string> = {
  hero: "TOP",
  flyer: "FLYER",
  lockers: "LOCKERS",
  footer: "CONTACT",
};

export interface HudSection {
  id: string;
  label: string;
}

/** Page sections in DOM order: every top-level <section id> in <main>, plus the footer. */
export function findSections(links: { label: string; href: string }[]): HudSection[] {
  const byId = new Map(links.map((l) => [l.href.slice(1), l.label]));
  const els = document.querySelectorAll<HTMLElement>("main > section[id], footer[id]");
  return [...els].map((el) => ({
    id: el.id,
    label: byId.get(el.id) ?? EXTRA_LABELS[el.id] ?? el.id.replace(/-/g, " ").toUpperCase(),
  }));
}

/**
 * The sector readout, numbered like the menu: "04/07" is the 4th of 7 nav links.
 * Sections outside the nav (flyer, footer…) read "--/07" with their own label.
 */
export function sectorCode(sections: HudSection[], active: number, links: { href: string }[]) {
  const here = sections[active];
  if (!here) return null;
  const i = links.findIndex((l) => l.href === `#${here.id}`);
  return { index: `${i >= 0 ? pad2(i + 1) : "--"}/${pad2(links.length)}`, label: here.label };
}
