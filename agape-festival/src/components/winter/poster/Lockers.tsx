import { LOCKERS } from "@/data/winter";
import { ArrowUpRight } from "./icons";
import { SectionHead } from "./SectionHead";

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** A short band: lockers, book ahead, one link out. Rendered only when LOCKERS.enabled (page.tsx). */
export function Lockers({ index }: { index: string }) {
  return (
    <section id="lockers" className="pp-sec pp-sec--short" aria-labelledby="lockers-title" data-reveal>
      <SectionHead index={index} id="lockers-title" title="Lockers" size="md" />
      <div className="pp-grid pp-lockers">
        <p className="pp-lead">{sentence(LOCKERS.note)}</p>
        <a className="pp-btn pp-btn--ghost" href={LOCKERS.url} target="_blank" rel="noopener noreferrer">
          {sentence(LOCKERS.cta.replace(/\s*→$/, ""))}
          <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
