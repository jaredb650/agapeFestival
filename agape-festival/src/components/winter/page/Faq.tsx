import { FAQ, WINTER } from "@/data/winter";
import { FaqTerminal, type FaqEntry } from "./FaqTerminal";

/**
 * FAQ as a Floodgear-style news terminal. Server wrapper: maps the winter
 * data (TODO_CONFIRM items keep their safe "to be announced" wording) to
 * plain props, so winter.ts never ships in the client chunk.
 */
export function Faq() {
  const items: FaqEntry[] = FAQ.map((item) => ({
    id: item.id,
    q: item.q,
    paras: item.a.split("\n\n"),
    link: item.link ? { label: item.link.label, href: item.link.href, external: item.link.external } : undefined,
  }));
  return <FaqTerminal items={items} contactEmail={WINTER.contactEmail} />;
}
