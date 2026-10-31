"use client";

import { useEffect, useRef, useState } from "react";
import { useScramble } from "@/components/winter/artist-select/hooks";
import { MerchImg } from "./MerchImg";
import { Orb } from "./Orb";
import { pad2, type Gear, type View } from "./loadout";

interface InspectProps {
  id: string;
  gear: Gear[];
  sel: number;
  /** Bumps on every item change: replays the swap FX. */
  swap: number;
  /** Bumps on every front/back flip: replays the flip FX. */
  flips: number;
  view: View;
  /** Front images requested (latched): until then only back prints load. */
  fronts: boolean;
  reduced: boolean;
  /** "HEAVYWEIGHT" when the section copy says so; null hides the row. */
  blank: string | null;
  shopUrl: string;
  shopHost: string;
  onFlip: () => void;
  onStep: (dir: -1 | 1) => void;
}

interface Layer {
  key: number;
  i: number;
}

const OUT_MS = 560;

/**
 * The inspect bench: a Xefirotarch-style window (`ITEM: …` / `VIEW` header,
 * `01/04 < > SHOP` footer) around a black turntable stage. The garment sways
 * on an idle turntable, tilts toward the mouse, flips front/back with a CRT
 * glitch, and swaps items behind iris shutters. A HUD glass (grid, pedestal
 * rings, viewfinder, labels) sits over it. Transform/opacity only; the tilt
 * writes transforms straight to the DOM (no React renders per frame).
 */
export function Inspect({ id, gear, sel, swap, flips, view, fronts, reduced, blank, shopUrl, shopHost, onFlip, onStep }: InspectProps) {
  const g = gear[sel];
  const total = gear.length;

  // Layer stack: the newest is current, the previous one plays its exit and is dropped.
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, i: sel }]);
  const [prev, setPrev] = useState(sel);
  if (sel !== prev) {
    setPrev(sel);
    setLayers((ls) => [...ls.slice(-1), { key: swap, i: sel }]);
  }
  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setLayers((ls) => ls.slice(-1)), reduced ? 0 : OUT_MS);
    return () => clearTimeout(t);
  }, [layers, reduced]);

  const viewWord = view === "back" ? "BACK" : "FRONT";
  const viewLong = view === "back" ? "BACK PRINT" : "FRONT";
  const off = { disabled: reduced };
  const titleRef = useScramble<HTMLSpanElement>(g.item.name, off);
  const viewBtnRef = useScramble<HTMLSpanElement>(viewWord, { ...off, ms: 260 });
  const lcdName = useScramble<HTMLSpanElement>(g.item.name, { ...off, ms: 480 });
  const lcdCls = useScramble<HTMLSpanElement>(g.cls === "APPAREL" ? "APPAREL" : `APPAREL / ${g.cls}`, { ...off, ms: 380 });
  const lcdArt = useScramble<HTMLSpanElement>(g.art, { ...off, ms: 420 });
  const lcdView = useScramble<HTMLSpanElement>(viewLong, { ...off, ms: 300 });
  const hudView = useScramble<HTMLSpanElement>(viewLong, { ...off, ms: 300 });

  // ---- Mouse tilt (fine pointers, motion OK) ----------------------------------
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    const pad = padRef.current;
    if (!stage || !tilt || !pad || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let rect: DOMRect | null = null;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const step = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      tilt.style.transform = `perspective(1100px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg) translate3d(${(x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 0)`;
      pad.style.transform = `translate3d(${(-x * 14).toFixed(1)}px, ${(-y * 4).toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") rect = stage.getBoundingClientRect();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rect ??= stage.getBoundingClientRect();
      tx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      ty = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
      kick();
    };
    const leave = () => {
      rect = null;
      tx = 0;
      ty = 0;
      kick();
    };
    stage.addEventListener("pointerenter", enter);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerenter", enter);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", leave);
      tilt.style.transform = "";
      pad.style.transform = "";
    };
  }, [reduced]);

  return (
    <div className="wmx-win" id={id} data-merch-window role="group" aria-label={`Inspecting ${g.item.name}, ${view === "back" ? "back print" : "front"}`}>
      <div className="wmx-win__bar">
        <span className="wmx-win__led" aria-hidden="true" />
        <span className="wmx-win__title">
          <span className="wmx-win__key">Item:</span> <span ref={titleRef}>{g.item.name}</span>
        </span>
        <button
          type="button"
          className="wmx-win__view"
          data-merch-flip
          onClick={onFlip}
          aria-label={view === "back" ? `Showing the back print. Show the front of the ${g.item.name}` : `Showing the front. Show the back print of the ${g.item.name}`}
        >
          <span className="wmx-win__key">View</span>
          <i aria-hidden="true">▸</i>
          <span ref={viewBtnRef} aria-hidden="true">
            {viewWord}
          </span>
          <svg className="wmx-win__flip" viewBox="0 0 16 12" aria-hidden="true" focusable="false">
            <path d="M2 4.5h10.5L10 2M14 7.5H3.5L6 10" />
          </svg>
        </button>
        <span className="wmx-win__controls" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="wmx-view" ref={stageRef} data-merch-stage onClick={onFlip}>
        <div className="wmx-turn wmx-loop">
          <div className="wmx-tilt" ref={tiltRef}>
            <div className="wmx-flipper">
              {layers.map((l, k) => {
                const it = gear[l.i].item;
                const current = k === layers.length - 1;
                return (
                  <div key={l.key} className="wmx-plate" data-current={current || undefined} data-enter={(layers.length > 1 && current && !reduced) || undefined}>
                    <MerchImg className="wmx-face wmx-face--back" src={it.backImage} alt={current && view === "back" ? `${it.name}, ÄGAPĒ Festival merch, back print` : ""} />
                    {fronts && <MerchImg className="wmx-face wmx-face--front" src={it.frontImage} alt={current && view === "front" ? `${it.name}, ÄGAPĒ Festival merch, front` : ""} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="wmx-hud" aria-hidden="true">
          <span className="wmx-hud__grid" />
          <span className="wmx-hud__pad" ref={padRef}>
            <span className="wmx-hud__disc">
              <svg className="wmx-hud__rings wmx-loop" viewBox="0 0 200 200" focusable="false">
                <circle cx="100" cy="100" r="96" className="wmx-hud__ring" />
                <circle cx="100" cy="100" r="84" className="wmx-hud__ring wmx-hud__ring--dash" />
                <circle cx="100" cy="100" r="70" className="wmx-hud__ring wmx-hud__ring--fine" />
                <path d="M100 0v10M100 190v10M0 100h10M190 100h10" className="wmx-hud__tick" />
              </svg>
            </span>
          </span>
          <svg className="wmx-hud__cross" viewBox="0 0 200 200" preserveAspectRatio="none" focusable="false">
            <path d="M100 0v7M100 193v7M0 100h4M196 100h4" />
          </svg>
          <span className="wmx-hud__vf">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="wmx-hud__ruler" />
          <span className="wmx-hud__label wmx-hud__label--tl">Cam 01 :: Inspect</span>
          <span className="wmx-hud__label wmx-hud__label--tr">
            <i className="wmx-hud__rec wmx-loop" /> Slot {pad2(g.n)}
          </span>
          <span className="wmx-hud__label wmx-hud__label--bl">
            <span className="wmx-hud__fine">Click to flip</span>
            <span className="wmx-hud__touch">Tap to flip</span>
          </span>
          <span className="wmx-hud__label wmx-hud__label--br">
            View: <span ref={hudView}>{viewLong}</span>
          </span>
        </div>
        <span className="wmx-scan wmx-loop" aria-hidden="true" />
        {swap > 0 && !reduced && <SwapFx key={`s${swap}`} />}
        {flips > 0 && !reduced && <FlipFx key={`f${flips}`} />}
      </div>

      <div className="wmx-lcd" role="group" aria-label="Item readout">
        <span className="wmx-lcd__row">
          <b>Item:</b> <span ref={lcdName}>{g.item.name}</span>
        </span>
        <span className="wmx-lcd__row">
          <b>Slot:</b> {pad2(g.n)}/{pad2(total)}
        </span>
        <span className="wmx-lcd__row">
          <b>Class:</b> <span ref={lcdCls}>{g.cls === "APPAREL" ? "APPAREL" : `APPAREL / ${g.cls}`}</span>
        </span>
        <span className="wmx-lcd__row">
          <b>Art:</b> <span ref={lcdArt}>{g.art}</span>
        </span>
        <span className="wmx-lcd__row">
          <b>Print:</b> FRONT + BACK
        </span>
        <span className="wmx-lcd__row">
          <b>View:</b> <span ref={lcdView}>{viewLong}</span>
        </span>
        {blank && (
          <span className="wmx-lcd__row wmx-lcd__row--x">
            <b>Blank:</b> {blank}
          </span>
        )}
        <span className="wmx-lcd__row wmx-lcd__row--x">
          <b>Link:</b> {shopHost}
        </span>
      </div>

      <div className="wmx-win__status">
        <span className="wmx-win__orbs" aria-hidden="true">
          {gear.map((x, i) => (
            <Orb key={x.item.handle} lit={i === sel} />
          ))}
        </span>
        <span className="wmx-win__count" aria-hidden="true">
          {pad2(sel + 1)}/{pad2(total)}
        </span>
        <span className="wmx-win__nav">
          <button type="button" className="wmx-win__btn" onClick={() => onStep(-1)} aria-label="Previous item">
            &lt;
          </button>
          <button type="button" className="wmx-win__btn" onClick={() => onStep(1)} aria-label="Next item">
            &gt;
          </button>
        </span>
        <a className="wmx-win__shop" href={shopUrl}>
          Shop <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}

/** Iris shutters + scan band + slice bars + flash, mounted once per item swap (CSS keyframes, transform/opacity only). */
function SwapFx() {
  return (
    <div className="wmx-fx" aria-hidden="true">
      <span className="wmx-fx__shutter wmx-fx__shutter--a" />
      <span className="wmx-fx__shutter wmx-fx__shutter--b" />
      <span className="wmx-fx__band" />
      <span className="wmx-fx__slice wmx-fx__slice--1" />
      <span className="wmx-fx__slice wmx-fx__slice--2" />
      <span className="wmx-fx__slice wmx-fx__slice--3" />
      <span className="wmx-fx__flash" />
      <span className="wmx-fx__lock">
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

/** CRT sweep + flash over a front/back flip. */
function FlipFx() {
  return (
    <div className="wmx-fx wmx-fx--flip" aria-hidden="true">
      <span className="wmx-fx__band" />
      <span className="wmx-fx__slice wmx-fx__slice--1" />
      <span className="wmx-fx__slice wmx-fx__slice--3" />
      <span className="wmx-fx__flash" />
    </div>
  );
}
