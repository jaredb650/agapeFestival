import type { ReactNode } from "react";

/**
 * The signature: every section opens on a full-width hairline led by a short
 * red segment (the old site's divider), with the section's number under it,
 * then the heading set large.
 */
export function SectionHead({ index, id, title, meta, size = "lg" }: { index: string; id: string; title: ReactNode; meta?: ReactNode; size?: "lg" | "md" }) {
  return (
    <header className="pp-head" data-size={size}>
      <div className="pp-head__row">
        <span className="pp-head__idx" aria-hidden="true">
          {index}
        </span>
        {meta && <p className="pp-head__meta">{meta}</p>}
      </div>
      <h2 id={id} className="pp-head__title">
        {title}
      </h2>
    </header>
  );
}
