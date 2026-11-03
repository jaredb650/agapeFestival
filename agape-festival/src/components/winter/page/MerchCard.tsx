"use client";

import { memo } from "react";
import { LockMark } from "@/components/winter/merch/LockMark";
import { ProductImage, warmPreview } from "@/components/winter/merch/ProductImage";
import type { Product } from "@/components/winter/merch/types";

// A quarter of the column from 768px (two cards beside the preview; 308px once the column is 1280),
// half of it on phones.
const SIZES = "(min-width: 1376px) 308px, (min-width: 768px) 24vw, 46vw";

interface MerchCardProps {
  item: Product;
  i: number;
  selected: boolean;
  /** The lock's caption ("Coming soon"). */
  status: string;
  /** id of the preview this product loads into. */
  controls: string;
  onSelect: (i: number) => void;
}

/**
 * One locked piece, the roster's "to be revealed" card for merch: the garment's shadow (back view) under
 * a red lock and "Coming soon", over a dark name plate. Pressing it puts the piece in the preview; there
 * is nothing to buy. Selected = a lit edge and the red mark along its foot (merch.css). The card is plain
 * boxes; the press target is a transparent <button> laid over it at an explicit size, because iOS Safari
 * does not stretch a <button>'s children across it (a photo box inside the button came out 0 tall).
 * Same construction as the roster's tiles.
 */
export const MerchCard = memo(function MerchCard({ item, i, selected, status, controls, onSelect }: MerchCardProps) {
  // Intent (hover, press, focus) starts fetching this piece's preview images.
  const warm = () => warmPreview(item.back, item.front);
  return (
    <div className="mx-card" data-selected={selected || undefined}>
      <div className="mx-card__media">
        <ProductImage src={item.back} sizes={SIZES} alt="" />
        <LockMark label={status} />
      </div>
      <div className="mx-card__plate" aria-hidden="true">
        <span className="k-name mx-card__name">{item.name}</span>
      </div>
      <button
        type="button"
        className="mx-card__hit"
        aria-pressed={selected}
        aria-controls={controls}
        onPointerEnter={warm}
        onPointerDown={warm}
        onFocus={warm}
        onClick={() => onSelect(i)}
      >
        <span className="w-sr-only">
          {item.name}, {status.toLowerCase()}
        </span>
      </button>
    </div>
  );
});
