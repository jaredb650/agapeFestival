import { LOCKERS } from "@/data/winter";
import { Icon } from "./Icon";
import { sentence } from "./text";

/** One line between the FAQ and Getting Here. */
export function Lockers() {
  return (
    <section id="lockers" className="fr-lockers" aria-labelledby="lockers-title">
      <div className="fr-wrap fr-split fr-lockers__row">
        <h2 id="lockers-title" className="fr-lockers__title">
          Lockers
        </h2>
        <p className="fr-lockers__body">
          <span>{sentence(LOCKERS.note)}</span>
          <a className="fr-link" href={LOCKERS.url} target="_blank" rel="noopener noreferrer">
            {sentence(LOCKERS.cta)}
            <Icon name="arrow-up-right" size={14} />
          </a>
        </p>
      </div>
    </section>
  );
}
