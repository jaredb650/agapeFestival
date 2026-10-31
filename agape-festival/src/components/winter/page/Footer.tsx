import { FOOTER, WINTER } from "@/data/winter";
import { FooterHud } from "./FooterHud";
import { FLYER, HERO } from "./media";

/**
 * The footer as a game's END CREDITS / SYSTEM SHUTDOWN panel. Server wrapper:
 * resolves data + media to plain props for the client HUD.
 */
export function Footer({ links }: { links: { label: string; href: string }[] }) {
  const n = WINTER.newsletter;
  return (
    <FooterHud
      links={links}
      newsletter={{ eyebrow: n.eyebrow, title: n.title, body: n.body, cta: n.cta, url: WINTER.laylo.url }}
      socials={FOOTER.socials.map(({ url, handle }) => ({ url, handle }))}
      contactEmail={FOOTER.contactEmail}
      credit={{ label: FOOTER.credit.label, url: FOOTER.credit.url, icon: FOOTER.credit.icon }}
      copyright={FOOTER.copyright}
      origin={HERO.credit ? `Hero photo ${HERO.credit.replace(/^Photo:\s*/, "")} · ${FOOTER.origin}` : FOOTER.origin}
      venue={{ name: WINTER.venue.name, city: WINTER.venue.city, addressFull: WINTER.venue.addressFull }}
      dates={{ display: WINTER.dates.display, short: WINTER.dates.shortWithYear }}
      edition={WINTER.edition}
      brand={WINTER.brand}
      dateScrawl={{ src: FLYER.date.src, width: FLYER.date.width, height: FLYER.date.height, alt: `${FOOTER.dateLine}, ${WINTER.venue.name}` }}
    />
  );
}
