import { FAQ, WINTER } from "@/data/winter";
import { ArrowUpRight, Plus } from "./icons";
import { SectionHead } from "./SectionHead";

/**
 * Plain accordion on native <details> (one open at a time via `name`).
 * TODO_CONFIRM items keep their safe "to be announced" wording from winter.ts.
 */
export function Faq({ index }: { index: string }) {
  return (
    <section id="faq" className="pp-sec" aria-labelledby="faq-title" data-reveal>
      <SectionHead index={index} id="faq-title" title="FAQ" />
      <div className="pp-grid pp-faq">
        <p className="pp-faq__aside">
          Anything else? Write to{" "}
          <a className="pp-link" href={`mailto:${WINTER.contactEmail}`}>
            {WINTER.contactEmail}
          </a>
        </p>
        <div className="pp-faq__list">
          {FAQ.map((item) => (
            <details key={item.id} name="faq" className="pp-faq__item">
              <summary>
                <span>{item.q}</span>
                <Plus />
              </summary>
              <div className="pp-faq__a">
                {item.a.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {item.link && (
                  <p>
                    <a
                      className="pp-link"
                      href={item.link.href}
                      {...(item.link.external && !item.link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {item.link.label}
                      {item.link.external && !item.link.href.startsWith("mailto:") && <ArrowUpRight />}
                    </a>
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
