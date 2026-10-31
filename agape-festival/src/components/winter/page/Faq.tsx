import { SectionGrid, SectionHeader } from "@/components/winter/grid";
import { FaqList, type FaqEntry } from "@/components/winter/faq/FaqList";
import { sentenceCase } from "@/components/winter/nav/sections";
import { FAQ } from "@/data/winter";
import "@/styles/sections/faq.css";

/** A link's kind decides its icon and target: DICE leaves the site, mail opens the mail app, #… stays on the page. */
function linkOf(link: (typeof FAQ)[number]["link"]): FaqEntry["link"] {
  if (!link) return undefined;
  if (link.href.startsWith("mailto:")) return { label: link.label, href: link.href, kind: "mail" };
  // Section names are sentence case on the page ("Getting Here" → "Getting here").
  if (link.href.startsWith("#")) return { label: sentenceCase(link.label), href: link.href, kind: "page" };
  return { label: link.label, href: link.href, kind: link.external ? "external" : "page" };
}

/**
 * FAQ, on the grid: the header row, then one row holding the questions and their answers. Server
 * wrapper: maps the data (unconfirmed items already carry safe "to be announced" wording) to plain
 * props, so winter.ts never ships in the client chunk. The open state is the one client island.
 */
export function Faq() {
  const items: FaqEntry[] = FAQ.map((item) => ({ id: item.id, q: item.q, paras: item.a.split("\n\n"), link: linkOf(item.link) }));
  return (
    <SectionGrid id="faq" labelledBy="faq-title" className="fq">
      <SectionHeader id="faq-title" title="FAQ" />
      <FaqList items={items} />
    </SectionGrid>
  );
}
