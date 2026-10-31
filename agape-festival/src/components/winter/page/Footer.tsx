import { Cell, Fill, LinkCell, Row, SectionGrid } from "@/components/winter/grid";
import { barLinks, sentenceCase } from "@/components/winter/nav/sections";
import { COPY } from "@/data/festival";
import { FOOTER, WINTER } from "@/data/winter";
import "@/styles/sections/footer.css";

/** "© 2027 ÄGAPĒ FESTIVAL. ALL RIGHTS RESERVED." → "© 2027 ÄGAPĒ Festival. All rights reserved." (the name keeps its caps). */
const legal = (s: string) => s.replace(/ÄGAPĒ FESTIVAL\. ALL RIGHTS RESERVED\./, "ÄGAPĒ Festival. All rights reserved.");
/** The first sentence of the newsletter blurb (the second is filler). */
const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0];

/**
 * The footer, Intercell-style (the grid system's example section): a newsletter row (the heading and
 * one line beside the sign-up cell), a row of section link cells, a row of contact cells, then the legal
 * row. Server-rendered, no client JS. The sign-up cell keeps the client's colour-changing effect as a
 * red fill that wipes across the rectangle on hover/focus.
 */
export function Footer({ links }: { links: { label: string; href: string }[] }) {
  const n = WINTER.newsletter;
  const sections = barLinks(links);
  const contact = [
    ...FOOTER.socials.map((s) => ({ href: s.url, label: s.platform, value: s.handle, external: true })),
    { href: `mailto:${FOOTER.contactEmail}`, label: "Bookings, press and partnerships", value: FOOTER.contactEmail, external: false },
  ];
  const spanOf = (count: number) => (12 % count === 0 ? 12 / count : 4);
  const used = sections.length * 2;

  return (
    <SectionGrid as="footer" id="footer" labelledBy="footer-title" className="wft">
      <Row>
        <Cell span={8} h={4} y="end" className="wft__join">
          <h2 id="footer-title" className="w-display">
            {sentenceCase(n.title)}
          </h2>
          <p className="w-lead">{firstSentence(n.body)}</p>
        </Cell>
        <LinkCell span={4} h={4} href={WINTER.laylo.url} external fx="wipe" size="title" label="Newsletter on Laylo" className="wft__signup">
          {sentenceCase(n.cta)}
        </LinkCell>
      </Row>

      <nav aria-label="Footer">
        <Row as="ul">
          {sections.map((l) => (
            <LinkCell key={l.href} listItem href={l.href} span={2} spanSm={2} h={1} y="center">
              {l.label}
            </LinkCell>
          ))}
          <Fill as="li" md={(12 - (used % 12)) % 12} sm={(4 - (used % 4)) % 4} />
        </Row>
      </nav>

      <Row as="ul">
        {contact.map((c) => (
          <LinkCell key={c.href} listItem href={c.href} external={c.external} span={spanOf(contact.length)} h={2} label={c.label}>
            {c.value}
          </LinkCell>
        ))}
      </Row>

      <Row close h={1} className="wft__base">
        <Cell span={6} y="center">
          <p className="w-small">{legal(FOOTER.copyright)}</p>
        </Cell>
        <Cell span={3} spanSm={2} y="center">
          <p className="w-small">{COPY.origin}</p>
        </Cell>
        <LinkCell span={3} spanSm={2} href={FOOTER.credit.url} external y="center" className="wft__credit">
          Site design by Meka
        </LinkCell>
      </Row>
    </SectionGrid>
  );
}
