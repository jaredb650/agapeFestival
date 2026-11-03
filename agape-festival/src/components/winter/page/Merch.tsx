import { Section } from "@/components/winter/classic";
import { MerchViewer } from "@/components/winter/merch/MerchViewer";
import type { Product } from "@/components/winter/merch/types";
import { MERCH, MERCH_SILHOUETTES } from "@/data/winter";
import "@/styles/sections/merch.css";

/**
 * Merch, locked: the September site's "The uniform" board (a centred header, the preview beside the
 * product cards), with every piece shown as the dark shadow of its garment under a red lock and
 * "Coming soon". The new line is still being designed, so there is nothing to buy and no way out to a
 * shop: no product photographs, no prices, no links. Pick a piece, turn it front to back, as before.
 */
export function Merch() {
  const items: Product[] = MERCH.items.map((it) => ({
    id: it.id,
    name: it.name,
    back: MERCH_SILHOUETTES[it.garment].back,
    front: MERCH_SILHOUETTES[it.garment].front,
  }));
  return (
    <Section id="merch" title="Merch" intro={MERCH.body} align="center" className="mx">
      <MerchViewer items={items} status={MERCH.status} />
    </Section>
  );
}
