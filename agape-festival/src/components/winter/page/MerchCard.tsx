"use client";

import { memo, type CSSProperties } from "react";
import { toClipPath, toSvgPoints } from "@/components/winter/artist-select/geometry";
import { MerchImg } from "@/components/winter/merch/MerchImg";
import { pad2, SLOT_SHAPES, type Gear, type Side } from "@/components/winter/merch/loadout";

interface MerchCardProps {
  gear: Gear;
  side: Side;
  /** Entrance stagger order. */
  order: number;
  selected: boolean;
  tabbable: boolean;
  /** id of the inspect window this slot loads. */
  controls: string;
  /** Stable (index, element) ref registrar from the armory (keeps this memo effective). */
  registerSlot: (i: number, el: HTMLButtonElement | null) => void;
  onHover: (i: number) => void;
  onLeave: () => void;
  onFocusSlot: (i: number) => void;
  onPress: (i: number) => void;
}

/**
 * One equipment slot in the armory: a chrome-edged shard (the artist select's
 * tile shape) showing the back print, with lock-on brackets on hover, an
 * EQUIPPED tag when it's on the inspect bench, and a wire that docks into the
 * inspect window. Two outlines are drawn (wide desktop slot, phone rail tile);
 * CSS shows the one for the layout.
 */
export const MerchCard = memo(function MerchCard({ gear, side, order, selected, tabbable, controls, registerSlot, onHover, onLeave, onFocusSlot, onPress }: MerchCardProps) {
  const i = gear.n - 1;
  const desk = SLOT_SHAPES.desk[side];
  const rail = SLOT_SHAPES.rail[side];
  const style = { "--clip-d": toClipPath(desk), "--clip-m": toClipPath(rail), "--o": order } as CSSProperties;

  return (
    <div className="wmx-slot" style={style} data-side={side} data-selected={selected || undefined} data-merch-slot={i}>
      <button
        ref={(el) => registerSlot(i, el)}
        type="button"
        className="wmx-slot__btn"
        tabIndex={tabbable ? 0 : -1}
        aria-pressed={selected}
        aria-controls={controls}
        aria-label={`${gear.item.name}, ${gear.cls === "APPAREL" ? "apparel" : gear.cls.toLowerCase()}: inspect`}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover(i)}
        onPointerLeave={onLeave}
        onFocus={() => onFocusSlot(i)}
        onClick={() => onPress(i)}
      >
        <span className="wmx-slot__media" aria-hidden="true">
          <MerchImg src={gear.item.backImage} alt="" />
        </span>
        <span className="wmx-slot__shade" aria-hidden="true" />
        <span className="wmx-slot__idx" aria-hidden="true">
          {pad2(gear.n)}
        </span>
        <span className="wmx-slot__cls" aria-hidden="true">
          {gear.cls}
        </span>
        <span className="wmx-slot__name" aria-hidden="true">
          {gear.item.name}
        </span>
        <svg className="wmx-slot__edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <g className="wmx-slot__g" data-for="desk">
            <polygon className="wmx-slot__line" points={toSvgPoints(desk)} />
            <polygon className="wmx-slot__ring" points={toSvgPoints(desk)} />
          </g>
          <g className="wmx-slot__g" data-for="rail">
            <polygon className="wmx-slot__line" points={toSvgPoints(rail)} />
            <polygon className="wmx-slot__ring" points={toSvgPoints(rail)} />
          </g>
        </svg>
      </button>
      <span className="wmx-slot__lock" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="wmx-slot__tag" aria-hidden="true">
        {selected ? "Equipped" : "Lock on"}
      </span>
      <span className="wmx-slot__wire" aria-hidden="true">
        <b />
      </span>
    </div>
  );
});
