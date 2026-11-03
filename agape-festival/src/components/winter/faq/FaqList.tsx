"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, Button } from "@/components/winter/ui";

export interface FaqEntry {
  id: string;
  q: string;
  paras: string[];
  link?: { label: string; href: string; kind: "external" | "mail" | "page" };
}

/**
 * The questions and their answers: the September accordion, one hairline row per question. Each answer
 * opens beneath its own question (its height eases open; faq.css), any number at a time. Accordion
 * semantics (APG): a real button per question, inside a heading, with aria-expanded and aria-controls;
 * the answer follows it in reading order and is hidden from the accessibility tree while shut. ↑/↓/Home/End
 * move between questions. No role="region": fifteen panels that can all be open would flood the landmarks.
 */
export function FaqList({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<readonly boolean[]>(() => items.map(() => false));

  const toggle = (i: number) => setOpen((o) => o.map((v, k) => (k === i ? !v : v)));

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = items.length;
    const keys: Record<string, number> = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    document.getElementById(`faq-q-${items[to].id}`)?.focus();
  };

  return (
    <div className="fq-list" data-reveal="">
      {items.map((it, i) => (
        <div key={it.id} className="fq-item" data-open={open[i] || undefined}>
          <h3 className="fq-h">
            <button
              type="button"
              id={`faq-q-${it.id}`}
              className="fq-btn"
              aria-expanded={open[i]}
              aria-controls={`faq-a-${it.id}`}
              onClick={() => toggle(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="fq-q">{it.q}</span>
              <span className="fq-plus" aria-hidden="true" />
            </button>
          </h3>
          <div id={`faq-a-${it.id}`} className="fq-a">
            <div className="fq-a__clip">
              <div className="fq-a__body">
                {it.paras.map((p, k) => (
                  <p key={k} className="fq-a__p">
                    {p}
                  </p>
                ))}
                {it.link && <AnswerLink link={it.link} />}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnswerLink({ link }: { link: NonNullable<FaqEntry["link"]> }) {
  const external = link.kind === "external";
  const icon = external ? <ArrowUpRight className="w-btn__icon" /> : link.kind === "page" ? <ArrowRight className="w-btn__icon" /> : undefined;
  return (
    <Button variant="link" href={link.href} external={external} icon={icon} className="fq-a__link">
      {link.label}
      {external && <span className="w-sr-only"> (opens in a new tab)</span>}
    </Button>
  );
}
