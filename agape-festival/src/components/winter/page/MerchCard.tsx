"use client";

import { memo, type CSSProperties } from "react";
import { Cell } from "@/components/winter/grid";
import { ProductImage, warmPreview } from "@/components/winter/merch/ProductImage";
import type { Product } from "@/components/winter/merch/types";

// Three of twelve columns from 768px, two of four on phones.
const SIZES = "(min-width: 768px) 25vw, 50vw";

interface MerchCardProps {
  item: Product;
  i: number;
  selected: boolean;
  /** id of the preview this product loads into. */
  controls: string;
  onSelect: (i: number) => void;
}

/**
 * One product: its back print on the black ground, its name beneath. From 768px the cell spans an image
 * line and a caption line of the board (columns 7–12, two per line). Selected = the red mark on its
 * bottom edge (merch.css).
 */
export const MerchCard = memo(function MerchCard({ item, i, selected, controls, onSelect }: MerchCardProps) {
  // Intent (hover, press, focus) starts fetching this product's preview photographs.
  const warm = () => warmPreview(item.back, item.front);
  return (
    <Cell span={3} spanSm={2} start={7 + (i % 2) * 3} pad="none" className="mx-tile" style={{ "--mx-row": 1 + Math.floor(i / 2) * 2 } as CSSProperties}>
      <button
        type="button"
        className="mx-tile__btn"
        aria-pressed={selected}
        aria-controls={controls}
        onPointerEnter={warm}
        onPointerDown={warm}
        onFocus={warm}
        onClick={() => onSelect(i)}
      >
        <span className="mx-tile__media">
          <ProductImage src={item.back} sizes={SIZES} alt="" />
        </span>
        <span className="mx-tile__name">{item.name}</span>
      </button>
    </Cell>
  );
});
