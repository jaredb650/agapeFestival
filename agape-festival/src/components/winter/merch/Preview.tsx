"use client";

import { memo, useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { PREVIEW_SIZES, ProductImage } from "./ProductImage";
import { useHolo } from "./useHolo";
import type { Plate, Product, Side } from "./types";

interface PreviewProps {
  id: string;
  items: Product[];
  plates: Plate[];
  side: Side;
  onFlip: () => void;
  onSettled: (key: number) => void;
}

/**
 * The large preview: the selected garment on its black ground. Each plate holds both photographs, the
 * back laid over the front; merch.css turns the garment by wiping the back's clip open or shut while
 * both photographs slide a step the same way (one transition, so a second click reverses it mid-way).
 * A newly selected product wipes down over the last one once its photograph has loaded. Clicking the
 * photograph flips it.
 */
export const Preview = memo(function Preview({ id, items, plates, side, onFlip, onSettled }: PreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLSpanElement>(null);
  useHolo(stageRef, holoRef);
  const top = plates[plates.length - 1].key;

  return (
    <div ref={stageRef} id={id} className="mx-stage" data-side={side} onClick={onFlip}>
      {plates.map((p) => (
        <PlateView key={p.key} plate={p} item={items[p.i]} side={side} current={p.key === top} onSettled={onSettled} />
      ))}
      <span ref={holoRef} className="mx-holo" aria-hidden="true">
        <span className="mx-holo__band" />
        <span className="mx-holo__glare" />
      </span>
    </div>
  );
});

// Longest a new product waits for its photograph before wiping in anyway.
const LOAD_WAIT_MS = 700;

function PlateView({ plate, item, side, current, onSettled }: { plate: Plate; item: Product; side: Side; current: boolean; onSettled: (key: number) => void }) {
  // An entering plate holds closed until the side it opens on has loaded and decoded, so the wipe
  // never uncovers an empty frame. The first plate (server-rendered) is ready from the start.
  const [ready, setReady] = useState(!plate.enter);
  const [openSide] = useState(side);
  const markReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (!plate.enter || ready) return;
    const t = setTimeout(markReady, LOAD_WAIT_MS);
    return () => clearTimeout(t);
  }, [plate.enter, ready, markReady]);
  // Reduced motion: no wipe, so no animationend; the plate is in place as soon as it is ready.
  useEffect(() => {
    if (plate.enter && ready && window.matchMedia("(prefers-reduced-motion: reduce)").matches) onSettled(plate.key);
  }, [plate.enter, plate.key, ready, onSettled]);
  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.decode().then(markReady, markReady);
  };
  const loaded = (s: Side) => (plate.enter && !ready && s === openSide ? onLoad : undefined);

  return (
    <div
      className="mx-plate"
      data-enter={plate.enter ? (ready ? "go" : "wait") : undefined}
      aria-hidden={current ? undefined : true}
      onAnimationEnd={plate.enter ? (e) => e.target === e.currentTarget && onSettled(plate.key) : undefined}
    >
      <div className="mx-side mx-side--front">
        <ProductImage src={item.front} sizes={PREVIEW_SIZES} alt={current && side === "front" ? `${item.name}, front` : ""} onLoad={loaded("front")} />
      </div>
      <div className="mx-side mx-side--back">
        <ProductImage src={item.back} sizes={PREVIEW_SIZES} alt={current && side === "back" ? `${item.name}, back` : ""} onLoad={loaded("back")} />
      </div>
    </div>
  );
}
