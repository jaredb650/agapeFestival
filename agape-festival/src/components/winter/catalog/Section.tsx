import type { ReactNode } from "react";
import type { SectionId } from "@/data/winter";
import { section } from "./data";

/**
 * One catalog section: the catalog number, the title and the short crimson
 * rule from the old landing page, centred, then the content in a narrow column.
 */
export function Section({
  id,
  intro,
  children,
}: {
  id: SectionId;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const m = section(id);
  return (
    <section id={id} className="cat-sec" aria-labelledby={`${id}-title`} data-reveal="">
      <header className="cat-head">
        <p className="cat-no">{m.cat}</p>
        <h2 id={`${id}-title`} className="cat-title">
          {m.label}
        </h2>
        <span className="cat-rule" aria-hidden="true" />
        {intro && <p className="cat-intro">{intro}</p>}
      </header>
      {children}
    </section>
  );
}
