"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { Cell, LinkCell, Row } from "@/components/winter/grid";
import { MerchCard } from "@/components/winter/page/MerchCard";
import { Preview } from "./Preview";
import type { Plate, Product, Side } from "./types";

const PREVIEW_ID = "merch-preview";
const SIDES: { side: Side; label: string }[] = [
  { side: "front", label: "Front" },
  { side: "back", label: "Back" },
];

/**
 * The merch board (one Row) and the shop row. From 768px: the preview on columns 1–6 with Front | Back
 * under it, the products two per line on columns 7–12. On phones: the preview, Front | Back, the products
 * two to a line, then the shop. Selecting a product puts it in the preview and on the shop link; the red
 * mark shows which product and which side are showing.
 */
export function MerchViewer({ items }: { items: Product[] }) {
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

  const n = items.length;
  const lines = Math.ceil(n / 2);
  const board = { "--mx-span": lines * 2 - 1, "--mx-seg-row": lines * 2 } as CSSProperties;
  const item = items[sel];

  return (
    <>
      <Row className="mx-board" style={board}>
        <Cell span={6} start={1} pad="none" className="mx-stage-cell">
          <Preview id={PREVIEW_ID} items={items} plates={plates} side={side} onFlip={flip} onSettled={settle} />
          <p className="w-sr-only" aria-live="polite">
            {touched ? `${item.name}, ${side}` : ""}
          </p>
        </Cell>
        {SIDES.map((s, k) => (
          <Cell key={s.side} span={3} spanSm={2} start={1 + k * 3} pad="none" className="mx-seg" data-side={s.side}>
            <button
              type="button"
              className="mx-seg__btn"
              aria-pressed={side === s.side}
              aria-controls={PREVIEW_ID}
              onClick={() => {
                setSide(s.side);
                setTouched(true);
              }}
            >
              {s.label}
            </button>
          </Cell>
        ))}
        {items.map((it, i) => (
          <MerchCard key={it.href} item={it} i={i} selected={i === sel} controls={PREVIEW_ID} onSelect={select} />
        ))}
        {n % 2 === 1 && (
          <Cell span={3} spanSm={2} start={10} className="mx-tile" style={{ "--mx-row": lines * 2 - 1 } as CSSProperties} aria-hidden="true" />
        )}
      </Row>
      <Row>
        <LinkCell href={item.href} external fx="wipe" size="title" h={2} y="center" className="mx-shop">
          Shop the {item.name}
        </LinkCell>
      </Row>
    </>
  );
}
