import { Section } from "@/components/winter/classic";
import { MerchViewer } from "@/components/winter/merch/MerchViewer";
import type { Product } from "@/components/winter/merch/types";
import { sentenceCase } from "@/components/winter/nav/sections";
import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import "@/styles/sections/merch.css";

/**
 * Merch, as the September site's "The uniform": a centred header, the preview beside the product cards
 * (photo over a name plate, as on the roster), then the shop links, the red one to the whole shop. Pick a
 * product, turn it front to back, follow it to its page in the shop. No prices or stock (the shop is the
 * point of sale and the data has neither).
 */
export function Merch() {
  const items: Product[] = MERCH.items.map((it) => ({
    name: sentenceCase(it.name),
    href: `${SHOP_URL}/products/${it.handle}${SHOP_LINK_PARAMS}`,
    back: it.backImage,
    front: it.frontImage,
  }));
  return (
    <Section id="merch" title="Merch" intro={MERCH.body} align="center" className="mx">
      <MerchViewer items={items} shopUrl={MERCH.shopUrl} />
    </Section>
  );
}
