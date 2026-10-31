import { Armory } from "@/components/winter/merch/Armory";
import { toGear } from "@/components/winter/merch/loadout";
import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";

/**
 * "THE UNIFORM": the merch armory. Shop preview only: no prices and no stock
 * claims (the shop is the point of sale), so every action reads VIEW / SHOP.
 */
export function Merch() {
  const gear = toGear(MERCH.items, (handle) => `${SHOP_URL}/products/${handle}${SHOP_LINK_PARAMS}`);
  // The readout's BLANK row repeats the section copy ("Heavyweight blanks…"), nothing more.
  const blank = /\bheavyweight\b/i.test(MERCH.body) ? "HEAVYWEIGHT" : null;
  return (
    <section id="merch" className="wmx-section" aria-labelledby="merch-title">
      <Armory headingId="merch-title" title={MERCH.heading} body={MERCH.body} gear={gear} shopUrl={MERCH.shopUrl} blank={blank} />
    </section>
  );
}
