"use client";

import { useCallback, useRef, useState } from "react";
import { MerchCard } from "@/components/winter/page/MerchCard";
import { ArrowUpRight, Button } from "@/components/winter/ui";
import { Preview } from "./Preview";
import type { Plate, Product, Side } from "./types";

const PREVIEW_ID = "merch-preview";
const SIDES: { side: Side; label: string }[] = [
  { side: "front", label: "Front" },
  { side: "back", label: "Back" },
];

/**
 * The merch board and its shop links. From 768px the preview (with its plate: the product's name and
 * Front | Back) sits beside the product cards, two by two, and stretches to their height; on phones the
 * preview comes first, the cards two to a line under it. Selecting a product puts it in the preview and
 * on the "Shop the …" link; the red marks show which product and which side are showing. Below, centred:
 * that product's page, and the whole shop in red.
 */
export function MerchViewer({ items, shopUrl }: { items: Product[]; shopUrl: string }) {
  const [sel, setSel] = useState(0);
  const [side, setSide] = useState<Side>("back");
  const [plates, setPlates] = useState<Plate[]>([{ key: 0, i: 0 }]);
  const [touched, setTouched] = useState(false);
  const selRef = useRef(0);
  const seq = useRef(0);

  const select = useCallback((i: number) => {
    if (i === selRef.current) return;
    selRef.current = i;
    const plate: Plate = { key: ++seq.current, i, enter: true };
    setSel(i);
    setTouched(true);
    // At most two plates stay under the incoming one (a fast run of clicks); they drop once it lands.
    setPlates((ps) => [...ps.slice(-2), plate]);
  }, []);
  const settle = useCallback((key: number) => setPlates((ps) => ps.filter((p) => p.key >= key)), []);
  const flip = useCallback(() => {
    setSide((s) => (s === "back" ? "front" : "back"));
    setTouched(true);
  }, []);

  const item = items[sel];
  // An odd count: the first card takes both columns, so the set still closes square.
  const wideFirst = items.length % 2 === 1;

  return (
    <>
      <div className="mx-board">
        <div className="mx-view">
          <div className="mx-view__stage">
            <Preview id={PREVIEW_ID} items={items} plates={plates} side={side} onFlip={flip} onSettled={settle} />
          </div>
          <div className="mx-view__plate">
            <p className="k-name mx-view__name">{item.name}</p>
            <div className="mx-sides" role="group" aria-label="Side shown">
              {SIDES.map((s) => (
                <button
                  key={s.side}
                  type="button"
                  className="mx-sides__btn"
                  data-side={s.side}
                  aria-pressed={side === s.side}
                  aria-controls={PREVIEW_ID}
                  onClick={() => {
                    setSide(s.side);
                    setTouched(true);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <p className="w-sr-only" aria-live="polite">
            {touched ? `${item.name}, ${side}` : ""}
          </p>
        </div>
        <ul className="mx-cards" aria-label="Products">
          {items.map((it, i) => (
            <li key={it.href} className="mx-cell" data-wide={(wideFirst && i === 0) || undefined}>
              <MerchCard item={it} i={i} selected={i === sel} controls={PREVIEW_ID} onSelect={select} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-actions">
        <Button variant="secondary" href={item.href} external icon={<ArrowUpRight className="w-btn__icon" />}>
          Shop the {item.name}
          <span className="w-sr-only"> (opens in a new tab)</span>
        </Button>
        <Button variant="primary" href={shopUrl} external icon={<ArrowUpRight className="w-btn__icon" />}>
          View all
          <span className="w-sr-only"> merch in the shop (opens in a new tab)</span>
        </Button>
      </div>
    </>
  );
}
