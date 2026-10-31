import { SectionGrid, SectionHeader } from "@/components/winter/grid";
import { MerchViewer } from "@/components/winter/merch/MerchViewer";
import type { Product } from "@/components/winter/merch/types";
import { sentenceCase } from "@/components/winter/nav/sections";
import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import "@/styles/sections/merch.css";

/**
 * Merch: a preview of the shop's four pieces. Pick a product, turn it front to back, follow it to its
 * page in the shop. No prices or stock (the shop is the point of sale and the data has neither).
 */
export function Merch() {
  const items: Product[] = MERCH.items.map((it) => ({
    name: sentenceCase(it.name),
    href: `${SHOP_URL}/products/${it.handle}${SHOP_LINK_PARAMS}`,
    back: it.backImage,
    front: it.frontImage,
  }));
  return (
    <SectionGrid id="merch" labelledBy="merch-title" className="mx">
      <SectionHeader id="merch-title" title="Merch" aside={MERCH.body} />
      <MerchViewer items={items} />
    </SectionGrid>
  );
}
