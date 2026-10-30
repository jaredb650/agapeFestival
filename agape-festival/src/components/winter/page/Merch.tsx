import { Button, SectionHeading } from "@/components/winter/ui";
import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import { MerchCard } from "./MerchCard";

/** "THE UNIFORM": shop preview, no prices (the shop is the point of sale). */
export function Merch() {
  return (
    <section id="merch" className="w-section wmerch" aria-labelledby="merch-title">
      <div className="w-container">
        <div className="wmerch__head">
          <SectionHeading title={MERCH.heading} id="merch-title">
            {MERCH.body}
          </SectionHeading>
          <Button variant="secondary" href={MERCH.shopUrl} className="wmerch__all">
            {MERCH.cta.replace(/\s*→$/, "")}
          </Button>
        </div>
        <ul className="wmerch__grid">
          {MERCH.items.map((item) => (
            <li key={item.handle}>
              <MerchCard item={item} href={`${SHOP_URL}/products/${item.handle}${SHOP_LINK_PARAMS}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
