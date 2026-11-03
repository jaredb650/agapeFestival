import { Button } from "@/components/winter/classic";
import { barLinks } from "@/components/winter/nav/sections";
import { FLYER } from "@/components/winter/page/media";
import { COPY } from "@/data/festival";
import { FOOTER, WINTER } from "@/data/winter";
import "@/styles/sections/footer.css";

/** "© 2027 ÄGAPĒ FESTIVAL. ALL RIGHTS RESERVED." → "© 2027 ÄGAPĒ Festival. All rights reserved." (the name keeps its caps). */
const legal = (s: string) => s.replace(/ÄGAPĒ FESTIVAL\. ALL RIGHTS RESERVED\./, "ÄGAPĒ Festival. All rights reserved.");
/** "For bookings, press, and partnership inquiries." → "For bookings, press and partnership inquiries." (the site drops the serial comma). */
const blurb = FOOTER.contactBlurb.replace(", and ", " and ");

const NewTab = () => <span className="w-sr-only"> (opens in a new tab)</span>;

/**
 * The footer, quiet, after the September one: the mark and the dates; the sections in Orbitron caps
 * (the kit's ghost buttons); the Instagram handles, the newsletter and the contact email (the kit's
 * Archivo links). A fading hairline on top and a legal line
 * at the foot. The section links come through barLinks like the top bar's, so both follow the same order.
 * Server-rendered, no client JS.
 */
export function Footer({ links }: { links: { label: string; href: string }[] }) {
  const sections = barLinks(links);

  return (
    <footer id="footer" className="ft" aria-labelledby="footer-title">
      <div className="k-wrap">
        <div className="ft-top">
          <div className="ft-brand">
            <a href="#hero" className="ft-mark" aria-label="ÄGAPĒ Winter Festival, back to top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FLYER.mark.src} width={FLYER.mark.width} height={FLYER.mark.height} alt="" className="ft-mark__img" loading="lazy" decoding="async" />
              <span className="ft-mark__word" aria-hidden="true">
                ÄGAPĒ
              </span>
            </a>
            <p className="ft-line">
              <time dateTime={WINTER.dates.startIso}>{FOOTER.dateLine}</time>
              <br />
              {FOOTER.venueLine}
            </p>
          </div>

          <nav className="ft-col ft-col--nav" aria-labelledby="footer-nav">
            <h2 id="footer-nav" className="k-label">
              Navigate
            </h2>
            <ul className="ft-list ft-list--nav">
              {sections.map((l) => (
                <li key={l.href}>
                  <Button variant="ghost" size="sm" href={l.href} className="ft-nav">
                    {l.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ft-col">
            <h2 className="k-label">Follow</h2>
            <ul className="ft-list">
              {FOOTER.socials.map((s) => (
                <li key={s.url}>
                  <Button variant="link" href={s.url} external className="ft-link">
                    <span className="w-sr-only">{s.platform} </span>
                    {s.handle}
                  </Button>
                </li>
              ))}
              <li>
                <Button variant="link" href={WINTER.laylo.url} external className="ft-link">
                  Newsletter
                </Button>
              </li>
            </ul>
          </div>

          <div className="ft-col">
            <h2 id="footer-title" className="k-label">
              Contact
            </h2>
            <ul className="ft-list">
              <li>
                <Button variant="link" href={`mailto:${FOOTER.contactEmail}`} className="ft-link">
                  {FOOTER.contactEmail}
                </Button>
              </li>
            </ul>
            <p className="ft-line">{blurb}</p>
          </div>
        </div>

        <div className="ft-base">
          <p>{legal(FOOTER.copyright)}</p>
          <p>{COPY.origin}</p>
          <a href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer" className="ft-credit">
            Site design by Meka
            <NewTab />
          </a>
        </div>
      </div>
    </footer>
  );
}
