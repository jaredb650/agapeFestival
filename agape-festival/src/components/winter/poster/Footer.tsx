import { FOOTER, WINTER } from "@/data/winter";
import { HERO_LOGO } from "@/components/winter/page/media";
import { ArrowUpRight } from "./icons";

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Newsletter sign-up, then the contact / follow / pages / venue blocks, then the logo and the legal line. */
export function Footer({ links }: { links: { label: string; href: string }[] }) {
  const n = WINTER.newsletter;
  return (
    <footer id="footer" className="pp-foot" aria-labelledby="footer-title">
      <div className="pp-grid pp-foot__join" data-reveal>
        <div>
          <p className="pp-foot__eyebrow">{sentence(n.eyebrow)}</p>
          <h2 id="footer-title" className="pp-foot__title">
            {sentence(n.title)}
          </h2>
        </div>
        <div className="pp-foot__join-body">
          <p className="pp-lead">{n.body}</p>
          <a className="pp-btn pp-btn--ghost" href={WINTER.laylo.url} target="_blank" rel="noopener noreferrer">
            {sentence(n.cta)}
            <ArrowUpRight />
          </a>
        </div>
      </div>

      <div className="pp-foot__cols">
        <div>
          <h3 className="pp-foot__h">Contact</h3>
          <p className="pp-foot__p">{FOOTER.contactBlurb}</p>
          <a className="pp-link" href={`mailto:${FOOTER.contactEmail}`}>
            {FOOTER.contactEmail}
          </a>
        </div>
        <div>
          <h3 className="pp-foot__h">Follow</h3>
          <ul className="pp-foot__list">
            {FOOTER.socials.map((s) => (
              <li key={s.url}>
                <a className="pp-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <h3 className="pp-foot__h">Festival</h3>
          <ul className="pp-foot__list">
            {links.map((l) => (
              <li key={l.href}>
                <a className="pp-link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="pp-foot__h">Venue</h3>
          <p className="pp-foot__p">
            {WINTER.venue.name}
            <br />
            {WINTER.venue.addressFull}
          </p>
        </div>
      </div>

      <div className="pp-foot__base">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-foot__logo" src="/assets/winter/hero/logo-festival-680.webp" width={680} height={Math.round((680 * HERO_LOGO.height) / HERO_LOGO.width)} alt={WINTER.brand} loading="lazy" decoding="async" />
        <p className="pp-foot__legal">
          <span>© {WINTER.year} ÄGAPĒ Festival. All rights reserved.</span>
          <span>{WINTER.venue.city}, New York</span>
          <a href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer">
            Site design by Meka
          </a>
        </p>
      </div>
    </footer>
  );
}
