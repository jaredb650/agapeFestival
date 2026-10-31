import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import { ArrowIcon } from "./icons";
import { sentence } from "./labels";

/** Shop preview: the real product shots (back print, front on hover). No prices or stock claims. */
export function Merch() {
  return (
    <section id="merch" className="s-sec s-merch" aria-labelledby="merch-title">
      <header className="s-head" data-reveal="">
        <h2 id="merch-title" className="s-title">
          Merch
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">{MERCH.body}</p>
      </header>

      <ul className="s-merch__grid" data-reveal="">
        {MERCH.items.map((item) => {
          const name = sentence(item.name);
          return (
            <li key={item.handle}>
              <a className="s-product" href={`${SHOP_URL}/products/${item.handle}${SHOP_LINK_PARAMS}`} target="_blank" rel="noopener noreferrer">
                <span className="s-product__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.backImage} alt={`${name}, back print`} width={800} height={800} loading="lazy" decoding="async" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="s-product__front" src={item.frontImage} alt="" width={800} height={800} loading="lazy" decoding="async" />
                </span>
                <span className="s-product__name">{name}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="s-merch__more" data-reveal="">
        <a className="s-link" href={MERCH.shopUrl} target="_blank" rel="noopener noreferrer">
          Shop all merch
          <ArrowIcon />
        </a>
      </p>
    </section>
  );
}
