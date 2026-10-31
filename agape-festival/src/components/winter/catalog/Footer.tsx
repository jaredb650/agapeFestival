import { FOOTER, WINTER } from "@/data/winter";
import { ARROW, NAV_ITEMS } from "./data";

/** The back cover: the newsletter, then the small print in three short columns. */
export function Footer() {
  return (
    <footer id="footer" className="cat-foot" aria-labelledby="footer-title">
      <div className="cat-foot__join" data-reveal="">
        <h2 id="footer-title" className="cat-title">
          Join the movement
        </h2>
        <span className="cat-rule" aria-hidden="true" />
        <p className="cat-intro">Lineup drops, set times and early access to tickets, sent to your phone.</p>
        <p className="cat-actions">
          <a className="cat-btn cat-btn--line" href={WINTER.laylo.url} target="_blank" rel="noopener noreferrer">
            Sign up for updates
          </a>
        </p>
      </div>

      <div className="cat-foot__print">
        <div>
          <p className="cat-foot__h">ÄGAPĒ Festival</p>
          <p>
            {WINTER.edition}, {WINTER.dates.display}
          </p>
          <p>{WINTER.venue.addressFull}</p>
        </div>
        <nav aria-label="Footer">
          <p className="cat-foot__h">Sections</p>
          <ul>
            {NAV_ITEMS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="cat-foot__h">Contact</p>
          <p>
            <a className="cat-link" href={`mailto:${FOOTER.contactEmail}`}>
              {FOOTER.contactEmail}
            </a>
          </p>
          <p>{FOOTER.contactBlurb.replace(/\.$/, "")}</p>
          <ul>
            {FOOTER.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  Instagram {s.handle} {ARROW}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="cat-foot__base">
        <p>© {WINTER.year} ÄGAPĒ Festival. All rights reserved.</p>
        <p>Brooklyn, New York</p>
        <p>
          <a href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer">
            Site design by Meka
          </a>
        </p>
      </div>
    </footer>
  );
}
