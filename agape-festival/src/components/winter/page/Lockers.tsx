import { LinkCell, Row, SectionGrid, SectionHeader } from "@/components/winter/grid";
import { sentenceCase } from "@/components/winter/nav/sections";
import { LOCKERS } from "@/data/winter";

/**
 * Lockers (rendered only when LOCKERS.enabled, page.tsx): the header row and one link cell to the
 * booking page. Sizes, prices and availability aren't in the data, so the section names none.
 * Built from the grid kit alone; server-rendered, no client JS.
 */
export function Lockers() {
  return (
    <SectionGrid id="lockers" labelledBy="lockers-title">
      <SectionHeader id="lockers-title" title="Lockers" aside="Book ahead on Elockers." />
      <Row>
        <LinkCell href={LOCKERS.url} external fx="wipe" size="title" h={2} y="center">
          {sentenceCase(LOCKERS.cta.replace(/\s*→\s*$/, ""))}
        </LinkCell>
      </Row>
    </SectionGrid>
  );
}
