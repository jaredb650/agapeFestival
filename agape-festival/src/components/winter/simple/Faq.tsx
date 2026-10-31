import { FAQ, WINTER } from "@/data/winter";
import { ArrowIcon, PlusIcon } from "./icons";

/** Plain disclosures. TODO_CONFIRM items keep their safe "to be announced" wording from winter.ts. */
export function Faq() {
  return (
    <section id="faq" className="s-sec s-faq" aria-labelledby="faq-title">
      <header className="s-head" data-reveal="">
        <h2 id="faq-title" className="s-title">
          FAQ
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">
          Other questions: <a href={`mailto:${WINTER.contactEmail}`}>{WINTER.contactEmail}</a>
        </p>
      </header>

      <div className="s-faq__list" data-reveal="">
        {FAQ.map((item) => (
          <details key={item.id} className="s-qa">
            <summary>
              <span>{item.q}</span>
              <PlusIcon />
            </summary>
            <div className="s-qa__a">
              {item.a.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {item.link && (
                <p>
                  <a
                    className="s-link"
                    href={item.link.href}
                    {...(item.link.external && !item.link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.link.label}
                    {item.link.external && !item.link.href.startsWith("mailto:") && <ArrowIcon />}
                  </a>
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
