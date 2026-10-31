// Small shared bits for the top bar and the menu.

/** Sections the bar tracks that aren't nav links (labels for completeness; nothing renders them as readouts). */
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
