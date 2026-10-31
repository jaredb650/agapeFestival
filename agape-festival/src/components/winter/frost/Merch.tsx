import { MERCH, SHOP_LINK_PARAMS, SHOP_URL } from "@/data/winter";
import { Icon } from "./Icon";
import { SectionHead } from "./SectionHead";
import { sentence } from "./text";

/** Shop preview: the back prints as plain product photographs with a caption. No prices, no stock claims. */
export function Merch() {
  return (
    <section id="merch" className="fr-section" aria-labelledby="merch-title" data-reveal="">
      <div className="fr-wrap fr-split">
        <SectionHead id="merch-title" title={sentence(MERCH.heading)}>
          <p>{MERCH.body}</p>
          <p>
            <a className="fr-link" href={MERCH.shopUrl} target="_blank" rel="noopener noreferrer">
              View all in the shop
              <Icon name="arrow-up-right" size={14} />
            </a>
          </p>
        </SectionHead>
        <ul className="fr-merch">
          {MERCH.items.map((item) => (
            <li key={item.handle}>
              <a className="fr-merch__item" href={`${SHOP_URL}/products/${item.handle}${SHOP_LINK_PARAMS}`} target="_blank" rel="noopener noreferrer">
                <span className="fr-merch__photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.backImage} alt={`${sentence(item.name)}, back print`} width={800} height={800} loading="lazy" decoding="async" />
                </span>
                <span className="fr-caption fr-merch__caption">
                  <span>{sentence(item.name)}</span>
                  <span className="fr-merch__view">
                    View
                    <Icon name="arrow-up-right" size={14} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
