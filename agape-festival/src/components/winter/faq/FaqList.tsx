"use client";

import { Fragment, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, Cell, Row } from "@/components/winter/grid";
import { Button } from "@/components/winter/ui";

export interface FaqEntry {
  id: string;
  q: string;
  paras: string[];
  link?: { label: string; href: string; kind: "external" | "mail" | "page" };
}

/** Must match the 1024px breakpoint in faq.css, where the list gains its reading cell. */
const WIDE = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);

/**
 * The questions and their answers, one DOM for both layouts (faq.css places them):
 * - from 1024px, the questions are a column of cells and the selected answer sits in the reading cell
 *   beside them; one question is always selected;
 * - below, each answer opens beneath its own question, any number at a time.
 * Accordion semantics either way: a real button per question (aria-expanded, aria-controls) over its
 * answer, which follows it in reading order; ↑/↓/Home/End move between questions. No role="region":
 * fifteen panels that can all be open would flood the landmarks (APG accordion guidance).
 */
export function FaqList({ items }: { items: FaqEntry[] }) {
  const wide = useWide();
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState<readonly boolean[]>(() => items.map(() => false));

  const press = (i: number) => {
    if (wide) return setSel(i);
    const next = !open[i];
    setOpen((o) => o.map((v, k) => (k === i ? next : v)));
    // The last row opened becomes the selection, so a phone turned to landscape keeps its place.
    if (next) setSel(i);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = items.length;
    const keys: Record<string, number> = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    document.getElementById(`faq-q-${items[to].id}`)?.focus();
  };

  return (
    <Row className="fq-list" style={{ "--fq-n": items.length } as CSSProperties}>
      {/* The reading cell's hairlines (from 1024px). The answers lie over it, so switching never redraws a line. */}
      <Cell className="fq-frame" aria-hidden="true" />
      {items.map((it, i) => {
        const expanded = wide ? sel === i : open[i];
        const state = { "data-sel": sel === i || undefined, "data-open": open[i] || undefined };
        return (
          <Fragment key={it.id}>
            <Cell pad="none" className="fq-q" {...state}>
              <h3 className="fq-h">
                <button
                  type="button"
                  id={`faq-q-${it.id}`}
                  className="fq-btn"
                  aria-expanded={expanded}
                  aria-controls={`faq-a-${it.id}`}
                  onClick={() => press(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <span>{it.q}</span>
                  <span className="fq-plus" aria-hidden="true" />
                </button>
              </h3>
            </Cell>
            <Cell pad="none" id={`faq-a-${it.id}`} className="fq-a" {...state}>
              <div className="fq-a__clip">
                <div className="fq-a__body">
                  <p className="w-title fq-a__echo" aria-hidden="true">
                    {it.q}
                  </p>
                  {it.paras.map((p, k) => (
                    <p key={k} className="fq-a__p">
                      {p}
                    </p>
                  ))}
                  {it.link && <AnswerLink link={it.link} />}
                </div>
              </div>
            </Cell>
          </Fragment>
        );
      })}
    </Row>
  );
}

function AnswerLink({ link }: { link: NonNullable<FaqEntry["link"]> }) {
  const external = link.kind === "external";
  const icon = external ? <ArrowUpRight className="w-btn__icon" /> : link.kind === "page" ? <ArrowRight className="w-btn__icon" /> : undefined;
  return (
    <Button variant="secondary" href={link.href} external={external} icon={icon} className="fq-a__link">
      {link.label}
      {external && <span className="w-sr-only"> (opens in a new tab)</span>}
    </Button>
  );
}
