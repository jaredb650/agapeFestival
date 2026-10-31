import type { ReactNode } from "react";

/** Serif heading, the thin red rule under it (the old landing's divider), an optional short dek. */
export function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <header className="fr-head">
      <h2 id={id} className="fr-h2">
        {title}
      </h2>
      <span className="fr-rule" aria-hidden="true" />
      {children && <div className="fr-dek">{children}</div>}
    </header>
  );
}
