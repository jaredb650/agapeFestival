import { Section } from "@/components/winter/classic";
import { LockIcon } from "@/components/winter/merch/LockMark";
import { MERCH } from "@/data/winter";
import "@/styles/sections/merch.css";

/**
 * Merch, collapsed (Jared, Nov 3): just the section title and a red lock over "Coming soon". No pieces,
 * no silhouettes, no shop link. The locked board (merch/MerchViewer.tsx, MERCH_SILHOUETTES) is kept,
 * unused, for when the line is ready to tease.
 */
export function Merch() {
  return (
    <Section id="merch" title="Merch" align="center" className="mx mx--soon">
      <p className="mx-soon">
        <LockIcon className="mx-soon__icon" />
        <span className="k-label">{MERCH.status}</span>
      </p>
    </Section>
  );
}
