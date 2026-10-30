import { Button, HudLabel, SectionHeading } from "@/components/winter/ui";
import { FAQ, GETTING_HERE, LOCKERS, WINTER, type FaqItem } from "@/data/winter";

// ---------------------------------------------------------------- FAQ
// Native <details name="faq">: keyboard + screen-reader accordion for free,
// one open at a time where supported.

function Answer({ item }: { item: FaqItem }) {
  const paras = item.a.split("\n\n");
  return (
    <div className="wfaq__a">
      {paras.map((p, i) => (
        <p key={i} className="w-body">
          {p}
        </p>
      ))}
      {item.link && (
        <a
          className="wfaq__link"
          href={item.link.href}
          {...(item.link.external && !item.link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {item.link.label}
          <svg viewBox="0 0 22 10" fill="none" aria-hidden="true">
            <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </a>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="w-section wfaq" aria-labelledby="faq-title">
      <div className="w-container wfaq__wrap">
        <div className="wfaq__intro">
          <SectionHeading title="Frequently asked" id="faq-title">
            The essentials before you go.
          </SectionHeading>
          <p className="w-small wfaq__contact">
            Still stuck? <a href={`mailto:${WINTER.contactEmail}`}>{WINTER.contactEmail}</a>
          </p>
        </div>
        <div className="wfaq__list">
          {FAQ.map((item, i) => (
            <details key={item.id} name="faq" className="wfaq__item">
              <summary className="wfaq__q">
                <span className="wfaq__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="wfaq__qtext">{item.q}</span>
                <span className="wfaq__icon" aria-hidden="true" />
              </summary>
              <Answer item={item} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Lockers band

export function Lockers() {
  return (
    <section id="lockers" className="wlockers" aria-labelledby="lockers-title">
      <div className="w-container wlockers__inner">
        <h2 id="lockers-title" className="w-h2 wlockers__title">
          Lockers
        </h2>
        <p className="w-hud wlockers__note" data-tone="frost">
          {LOCKERS.note}
        </p>
        <Button variant="secondary" href={LOCKERS.url} external className="wlockers__cta">
          {LOCKERS.cta.replace(/\s*→$/, "")}
        </Button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Getting here

export function GettingHere() {
  const g = GETTING_HERE;
  return (
    <section id="getting-here" className="w-section wgh" aria-labelledby="gh-title">
      <div className="w-container">
        <SectionHeading title={g.heading} id="gh-title">
          {g.intro}
        </SectionHeading>

        <div className="wgh__grid">
          <div className="wgh__map">
            <iframe
              src={g.mapEmbedUrl}
              title={g.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="wgh__where">
            <HudLabel>Address</HudLabel>
            <address className="wgh__addr">
              <span className="w-h3">{g.address.line1}</span>
              <span className="w-body">{g.address.line2}</span>
            </address>
            <p className="w-hud wgh__entrance" data-tone="frost">
              {g.entrance ?? "Entrance details will be shared before the event"}
            </p>
            <Button variant="secondary" href={g.mapsDirectionsUrl} external>
              {g.mapsCta.replace(/\s*→$/, "")}
            </Button>
          </div>
        </div>

        <ul className="wgh__cards">
          {g.cards.map((c) => (
            <li key={c.id}>
              <div className="wgh__card">
                <HudLabel>{c.label}</HudLabel>
                {c.lines && (
                  <span className="wgh__lines">
                    {c.lines.map((l) => (
                      <span key={l.line} className="wgh__bullet" style={{ background: l.color, color: l.textColor }} role="img" aria-label={`${l.line} train`}>
                        {l.line}
                      </span>
                    ))}
                  </span>
                )}
                <h3 className="w-h3">{c.title}</h3>
                <p className="w-small">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="w-hud wgh__also">
          <span>Buses {g.secondary.buses.join(" · ")}</span>
          <span className="wgh__sep" aria-hidden="true">/</span>
          <span>Citi Bike {g.secondary.citiBike}</span>
        </p>
      </div>
    </section>
  );
}
