import { FAQ, LOCKERS, MERCH, SHOP_LINK_PARAMS, SHOP_URL, TICKETS, WINTER, WINTER_DAYS } from "@/data/winter";
import { ACTS, ARROW, section } from "./data";
import { Section } from "./Section";

const pad3 = (n: number) => String(n).padStart(3, "0");
/** "INFERNO TEE" → "Inferno tee" */
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** The lineup as a tracklist: 001–017 in flyer order, one stage per day. */
export function Lineup() {
  return (
    <Section id="lineup" intro="One stage per day. Set times to be announced.">
      <table className="cat-table">
        <caption className="w-sr-only">Lineup in flyer order</caption>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Artist</th>
            <th scope="col">Day</th>
          </tr>
        </thead>
        <tbody>
          {ACTS.map((a, i) => (
            <tr key={a.no} data-tba={a.slug ? undefined : ""} data-newday={i > 0 && ACTS[i - 1].day !== a.day ? "" : undefined}>
              <td>{a.no}</td>
              <td>{a.name}</td>
              <td>{a.dayShort}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

/** A short spec table and the one button. Only published facts: no tiers or prices until confirmed. */
export function Tickets() {
  const [d1, d2] = WINTER_DAYS;
  const rows: [string, string][] = [
    ["Dates", `${d1.weekday}, February 19 and ${d2.weekday}, February 20, 2027`],
    ["Venue", WINTER.venue.full],
    ["Stages", "One per day"],
    ["Doors", "To be announced"],
    ["Options and prices", `Listed on ${WINTER.tickets.provider}`],
  ];
  return (
    <Section id="tickets" intro={TICKETS.body}>
      <dl className="cat-spec">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="cat-actions">
        <a className="cat-btn cat-btn--lg" href={TICKETS.url} target="_blank" rel="noopener noreferrer">
          Get tickets on {WINTER.tickets.provider}
        </a>
      </p>
    </Section>
  );
}

/** Four product shots (the back prints), numbered, linking to the shop. No prices or stock claims. */
export function Merch() {
  return (
    <Section id="merch" intro={MERCH.body}>
      <ul className="cat-merch">
        {MERCH.items.map((m, i) => (
          <li key={m.handle}>
            <a href={`${SHOP_URL}/products/${m.handle}${SHOP_LINK_PARAMS}`} target="_blank" rel="noopener noreferrer">
              <span className="cat-merch__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.backImage} width={800} height={800} alt={`${sentence(m.name)}, back print`} loading="lazy" decoding="async" />
              </span>
              <span className="cat-merch__cap">
                <span className="cat-no">{pad3(i + 1)}</span>
                <span>{sentence(m.name)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="cat-more">
        <a className="cat-link" href={MERCH.shopUrl} target="_blank" rel="noopener noreferrer">
          Shop all {ARROW}
        </a>
      </p>
    </Section>
  );
}

/** Plain numbered Q/A list on native disclosures (no JS). */
export function Faq() {
  return (
    <Section id="faq">
      <div className="cat-faq">
        {FAQ.map((f, i) => {
          const link = f.link;
          const label = link && !link.external && link.href.startsWith("#") ? section(link.href.slice(1) as "getting-here").label : link?.label;
          return (
            <details key={f.id}>
              <summary>
                <span className="cat-faq__no">{pad3(i + 1)}</span>
                <span className="cat-faq__q">{f.q}</span>
                <span className="cat-faq__sign" aria-hidden="true" />
              </summary>
              <div className="cat-faq__a">
                {f.a.split("\n\n").map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {link && (
                  <p>
                    <a
                      className="cat-link"
                      href={link.href}
                      {...(link.external && !link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {label} {ARROW}
                    </a>
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </Section>
  );
}

/** Lockers: one line and a quiet link button. Rendered only when LOCKERS.enabled (page.tsx). */
export function Lockers() {
  return (
    <Section id="lockers" intro={sentence(LOCKERS.note)}>
      <p className="cat-actions">
        <a className="cat-btn cat-btn--line" href={LOCKERS.url} target="_blank" rel="noopener noreferrer">
          Reserve a locker
        </a>
      </p>
    </Section>
  );
}
