import { Button, HudLabel } from "@/components/winter/ui";
import { FOOTER, WINTER } from "@/data/winter";
import { FLYER, HERO } from "./media";

export function Footer({ links }: { links: { label: string; href: string }[] }) {
  const n = WINTER.newsletter;
  return (
    <footer id="footer" className="wfoot" aria-labelledby="footer-title">
      <div className="w-container">
        <div className="wfoot__news">
          <div className="wfoot__news-copy">
            <h2 id="footer-title" className="w-h1">
              {n.title}
            </h2>
            <p className="w-lead">{n.body}</p>
          </div>
          <Button variant="secondary" href={WINTER.laylo.url} external size="lg">
            {n.cta}
          </Button>
        </div>

        {/* Sign-off: the flyer's own logos and hand-scrawled date. */}
        <div className="wfoot__sign">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wfoot__logos" src={FLYER.logos.src} width={FLYER.logos.width} height={FLYER.logos.height} alt="ÄGAPĒ Festival" loading="lazy" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wfoot__date" src={FLYER.date.src} width={FLYER.date.width} height={FLYER.date.height} alt={`${FOOTER.dateLine}, ${WINTER.venue.name}`} loading="lazy" decoding="async" />
          <p className="w-hud">{WINTER.venue.addressFull}</p>
        </div>

        <div className="wfoot__grid">
          <nav className="wfoot__col" aria-label="Footer">
            <HudLabel as="p">Navigate</HudLabel>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="wfoot__col">
            <HudLabel as="p">Follow</HudLabel>
            <ul>
              {FOOTER.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.handle}
                  </a>
                </li>
              ))}
              <li>
                <a href={WINTER.laylo.url} target="_blank" rel="noopener noreferrer">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
          <div className="wfoot__col wfoot__col--contact">
            <HudLabel as="p">Contact</HudLabel>
            <ul>
              <li>
                <a href={`mailto:${FOOTER.contactEmail}`}>{FOOTER.contactEmail}</a>
              </li>
            </ul>
            <p className="w-small">{FOOTER.contactBlurb}</p>
          </div>
        </div>

        <div className="wfoot__base">
          <p className="w-hud" data-tone="fog">{FOOTER.copyright}</p>
          <p className="w-hud" data-tone="fog">
            Hero photo {HERO.credit.replace(/^Photo:\s*/, "")} · {FOOTER.origin}
          </p>
          <a className="wfoot__meka" href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer">
            <span className="w-hud" data-tone="fog">{FOOTER.credit.label}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOOTER.credit.icon} width={400} height={380} alt="MEKA design studio logo" loading="lazy" decoding="async" />
          </a>
        </div>
      </div>
    </footer>
  );
}
