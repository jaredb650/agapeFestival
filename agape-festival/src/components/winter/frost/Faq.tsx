import { FAQ } from "@/data/winter";
import { Icon } from "./Icon";
import { SectionHead } from "./SectionHead";

/** A plain accordion on native <details>: works without JS, keyboard and screen readers for free. */
export function Faq() {
  return (
    <section id="faq" className="fr-section" aria-labelledby="faq-title" data-reveal="">
      <div className="fr-wrap fr-split">
        <SectionHead id="faq-title" title="FAQ" />
        <div className="fr-faq">
          {FAQ.map((item) => (
            <details key={item.id} className="fr-faq__item">
              <summary>
                <span>{item.q}</span>
                <Icon name="plus" size={18} className="fr-faq__icon" />
              </summary>
              <div className="fr-faq__a">
                {item.a.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {item.link && (
                  <p>
                    <a
                      className="fr-link"
                      href={item.link.href}
                      {...(item.link.external && !item.link.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {item.link.label}
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
