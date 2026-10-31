import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import { ArrowUpRight } from "./icons";
import { SectionHead } from "./SectionHead";

/** "INFERNO TEE" → "Inferno Tee" (product names read as names, not labels). */
const titleCase = (s: string) => s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Shop preview: the real product shots (back print, front on hover), no prices or stock claims. */
export function Merch({ index }: { index: string }) {
  return (
    <section id="merch" className="pp-sec" aria-labelledby="merch-title" data-reveal>
      <SectionHead index={index} id="merch-title" title={sentence(MERCH.heading)} />
      <div className="pp-grid pp-merch__intro">
        <p className="pp-lead">{MERCH.body}</p>
        <a className="pp-link pp-merch__all" href={MERCH.shopUrl} target="_blank" rel="noopener noreferrer">
          Shop all merch <ArrowUpRight />
        </a>
      </div>
      <ul className="pp-merch">
        {MERCH.items.map((item) => {
          const name = titleCase(item.name);
          return (
            <li key={item.handle}>
              <a className="pp-merch__card" href={`${SHOP_URL}/products/${item.handle}${SHOP_LINK_PARAMS}`} target="_blank" rel="noopener noreferrer">
                <span className="pp-merch__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.backImage} alt={`${name}, back print`} width={800} height={800} loading="lazy" decoding="async" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="pp-merch__front" src={item.frontImage} alt="" width={800} height={800} loading="lazy" decoding="async" />
                </span>
                <span className="pp-merch__name">
                  {name} <ArrowUpRight />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
