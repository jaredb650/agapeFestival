import { COPY } from "@/data/festival";
import { FOOTER, WINTER } from "@/data/winter";
import { sentence } from "./text";

/** Newsletter, contact, socials, the venue, and the small print. */
export function Footer() {
  const n = WINTER.newsletter;
  return (
    <footer id="footer" className="fr-footer" aria-labelledby="footer-title">
      <div className="fr-wrap fr-split">
        <div className="fr-footer__join">
          <h2 id="footer-title" className="fr-h2 fr-h2--sm">
            {sentence(n.title)}
          </h2>
          <span className="fr-rule" aria-hidden="true" />
          <p className="fr-dek">{n.body}</p>
          <a className="fr-btn fr-btn--ghost" href={WINTER.laylo.url} target="_blank" rel="noopener noreferrer">
            {sentence(n.cta)}
          </a>
        </div>
        <div className="fr-footer__cols">
          <div>
            <h3 className="fr-footer__k">Contact</h3>
            <p>
              <a className="fr-link" href={`mailto:${FOOTER.contactEmail}`}>
                {FOOTER.contactEmail}
              </a>
            </p>
            <p className="fr-note">{FOOTER.contactBlurb}</p>
          </div>
          <div>
            <h3 className="fr-footer__k">Follow</h3>
            {FOOTER.socials.map((s) => (
              <p key={s.url}>
                <a className="fr-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle}
                </a>
              </p>
            ))}
          </div>
          <div>
            <h3 className="fr-footer__k">Venue</h3>
            <p>{WINTER.venue.name}</p>
            <p className="fr-note">{WINTER.venue.addressFull}</p>
          </div>
        </div>
      </div>
      <div className="fr-wrap fr-footer__base">
        <p>
          © {WINTER.year} ÄGAPĒ Festival. All rights reserved. {COPY.origin}
        </p>
        <p>
          <a className="fr-link fr-link--quiet" href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer">
            Site design by MEKA
          </a>
        </p>
      </div>
    </footer>
  );
}
