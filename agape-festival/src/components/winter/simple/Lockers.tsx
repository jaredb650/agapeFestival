import { LOCKERS } from "@/data/winter";
import { sentence } from "./labels";

/** One quiet line. Rendered only when LOCKERS.enabled (page.tsx). */
export function Lockers() {
  return (
    <section id="lockers" className="s-lockers" aria-labelledby="lockers-title">
      <div className="s-lockers__row" data-reveal="">
        <div>
          <h2 id="lockers-title" className="s-lockers__title">
            Lockers
          </h2>
          <p className="s-lockers__note">{sentence(LOCKERS.note)}</p>
        </div>
        <a className="s-btn s-btn--ghost" href={LOCKERS.url} target="_blank" rel="noopener noreferrer">
          {sentence(LOCKERS.cta.replace(/\s*→$/, ""))}
        </a>
      </div>
    </section>
  );
}
