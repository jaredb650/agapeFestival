// Small shared bits for the top bar and the menu.

export interface NavSection {
  id: string;
}

export interface NavLink {
  label: string;
  href: string;
}

/** Page sections in DOM order: every <section id> directly in <main> (or in the hero/flyer wrapper), plus the footer. */
export function findSections(): NavSection[] {
  const els = document.querySelectorAll<HTMLElement>("main > section[id], main > div > section[id], footer[id]");
  return [...els].map((el) => ({ id: el.id }));
}

/** The data's labels are set in caps ("GETTING HERE"); the bar is sentence case. Acronyms stay. */
const KEEP = new Set(["FAQ", "DJ", "NYC"]);
export function sentenceCase(label: string): string {
  const words = label.trim().split(/\s+/);
  return words
    .map((w, i) => (KEEP.has(w.toUpperCase()) ? w.toUpperCase() : i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
}

/** The bar's links: every nav link except Top (the wordmark goes to the top), in sentence case. */
export function barLinks(links: NavLink[]): NavLink[] {
  return links.filter((l) => l.href !== "#hero").map((l) => ({ href: l.href, label: sentenceCase(l.label) }));
}
