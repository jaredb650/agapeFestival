import { FOOTER, WINTER } from "@/data/winter";
import { ArrowIcon } from "./icons";
import { sentence } from "./labels";

const LOGO = {
  src: "/assets/winter/logos/agape-festival-logo-400.webp",
  width: 400,
  height: 209,
};

/** The closing card: the logo, the newsletter, socials and contact, then the small print. */
export function Footer() {
  const n = WINTER.newsletter;
  return (
    <footer id="footer" className="s-foot">
      <div className="s-foot__card" data-reveal="">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="s-foot__logo" src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="ÄGAPĒ Festival" loading="lazy" decoding="async" />
        <p className="s-foot__when">
          <span className="s-mono">
            {WINTER.dates.shortWithYear} · {WINTER.venue.name}, {WINTER.venue.city}
          </span>
        </p>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-foot__news">{n.body}</p>
        <a className="s-btn s-btn--ghost" href={WINTER.laylo.url} target="_blank" rel="noopener noreferrer">
          {sentence(n.cta)}
          <ArrowIcon />
        </a>
      </div>

      <div className="s-foot__links">
        <ul>
          {FOOTER.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.handle}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${FOOTER.contactEmail}`}>{FOOTER.contactEmail}</a>
          </li>
        </ul>
        <p className="s-foot__blurb">{FOOTER.contactBlurb.replace(/\.$/, "")}</p>
      </div>

      <div className="s-foot__base">
        <span>© {WINTER.year} ÄGAPĒ Festival. All rights reserved.</span>
        <span>{sentence(FOOTER.origin).replace("new york", "New York")}</span>
        <a href={FOOTER.credit.url} target="_blank" rel="noopener noreferrer">
          Site design by Meka
        </a>
      </div>
    </footer>
  );
}
