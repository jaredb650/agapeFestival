import { Section } from "@/components/winter/classic";
import { FaqList, type FaqEntry } from "@/components/winter/faq/FaqList";
import { sentenceCase } from "@/components/winter/nav/sections";
import { FAQ, WINTER } from "@/data/winter";
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
 * FAQ, as the September site set it: the heading on the left (from 1024px it holds its column while the
 * list scrolls past), then an accordion of hairline rows, questions in Orbitron, answers in Archivo.
 * Server wrapper: maps the data (unconfirmed items already carry safe "to be announced" wording) to plain
 * props, so winter.ts never ships in the client chunk. The open state is the one client island.
 */
export function Faq() {
  const items: FaqEntry[] = FAQ.map((item) => ({ id: item.id, q: item.q, paras: item.a.split("\n\n"), link: linkOf(item.link) }));
  const email = WINTER.contactEmail;
  return (
    <Section
      id="faq"
      title="FAQ"
      className="fq"
      intro={
        <p className="k-lead fq-lead">
          Still have questions? Email{" "}
          <a className="fq-lead__link" href={`mailto:${email}`}>
            {email}
          </a>
        </p>
      }
    >
      <FaqList items={items} />
    </Section>
  );
}
