"use client";

import { memo } from "react";
import { ProductImage, warmPreview } from "@/components/winter/merch/ProductImage";
import type { Product } from "@/components/winter/merch/types";

// A quarter of the column from 768px (two cards beside the preview; 308px once the column is 1280),
// half of it on phones.
const SIZES = "(min-width: 1376px) 308px, (min-width: 768px) 24vw, 46vw";

interface MerchCardProps {
  item: Product;
  i: number;
  selected: boolean;
  /** id of the preview this product loads into. */
  controls: string;
  onSelect: (i: number) => void;
}

/**
 * One product card, the roster's card in colour: the back print on its black ground over a dark name
 * plate. Pressing it puts the product in the preview. Selected = a lit edge and the red mark along its
 * foot (merch.css).
 */
export const MerchCard = memo(function MerchCard({ item, i, selected, controls, onSelect }: MerchCardProps) {
  // Intent (hover, press, focus) starts fetching this product's preview photographs.
  const warm = () => warmPreview(item.back, item.front);
  return (
    <button
      type="button"
      className="mx-card"
      aria-pressed={selected}
      aria-controls={controls}
      onPointerEnter={warm}
      onPointerDown={warm}
      onFocus={warm}
      onClick={() => onSelect(i)}
    >
      <span className="mx-card__media">
        <ProductImage src={item.back} sizes={SIZES} alt="" />
      </span>
      <span className="mx-card__plate">
        <span className="k-name mx-card__name">{item.name}</span>
      </span>
    </button>
  );
});
