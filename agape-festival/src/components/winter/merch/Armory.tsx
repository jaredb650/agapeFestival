"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Button } from "@/components/winter/ui";
import { toClipPath } from "@/components/winter/artist-select/geometry";
import { useReducedMotion } from "@/components/winter/artist-select/hooks";
import { MerchCard } from "@/components/winter/page/MerchCard";
import { LIVE_MARGIN } from "@/components/winter/page/hudFx";
import { Inspect } from "./Inspect";
import { MerchBezel } from "./MerchBezel";
import { Orb } from "./Orb";
import { pad2, splitWings, WEDGE, wingArt, type Gear, type Side, type View } from "./loadout";
import "@/styles/sections/merch.css";

export interface ArmoryProps {
  headingId: string;
  title: string;
  body: string;
  gear: Gear[];
  shopUrl: string;
  /** e.g. "HEAVYWEIGHT", taken from the section copy; null hides the readout row. */
  blank: string | null;
}

const HOVER_INTENT = 80;
const AUTO_FLIP_MS = 5200;
const QUIET_AFTER_INPUT = 9000;
const GLYPHS = "ÄĒ#%&*+/<>=?@[]_\\|01:";

/**
 * "THE UNIFORM" as a mech-game ARMORY / LOADOUT screen: equipment slots in two
 * mirrored wings (desktop) or one chevron rail (phones), all wired into a
 * central inspect bench. Hover/tap a slot to equip it on the bench; flip
 * front/back from the VIEW key or by clicking the garment. Assembles with a
 * glitch-in the first time it scrolls into view; reduced motion = static.
 */
export function Armory({ headingId, title, body, gear, shopUrl, blank }: ArmoryProps) {
  const wings = splitWings(gear);
  const arts = new Set(gear.map((g) => g.art)).size;
  const windowId = `${headingId}-bench`;
  const shopHost = hostOf(shopUrl);

  const [sel, setSel] = useState(0);
  const [swap, setSwap] = useState(0);
  const [view, setView] = useState<View>("back");
  const [flips, setFlips] = useState(0);
  const [armed, setArmed] = useState(false);
  const [on, setOn] = useState(false);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const slotEls = useRef<(HTMLButtonElement | null)[]>([]);
  const selRef = useRef(0);
  const viewRef = useRef<View>("back");
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastInput = useRef(0);
  const pointerIn = useRef(false);

  const reduced = useReducedMotion();
  // Loops + the auto-flip run only while the armory is actually on screen (no pre-roll margin:
  // paused CSS loops resume where they stopped, so nothing visibly restarts).
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setInView(entries[entries.length - 1].isIntersecting), { rootMargin: LIVE_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const live = inView && !reduced;

  // ---- Arrival: arm the hidden state, assemble once ~a quarter is on screen ----
  // Reduced motion / no IO: never armed, so the static layout simply shows.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setArmed(true);
        if (e.intersectionRatio >= 0.24) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.24] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Title decodes as the screen assembles (textContent only; React keeps the real string).
  useEffect(() => {
    const el = titleRef.current;
    if (!on || !armed || !el) return;
    const text = title;
    let raf = 0;
    const start = performance.now() + 180;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / 700));
      const settled = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) out += i < settled || text[i] === " " ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [on, armed, title]);

  // ---- Equip ------------------------------------------------------------------
  const say = useCallback((g: Gear, v: View) => setAnnounce(`${g.item.name} on the inspect bench, ${v === "back" ? "back print" : "front"}.`), []);

  const select = useCallback(
    (i: number, { speak = false } = {}) => {
      lastInput.current = performance.now();
      if (selRef.current !== i) {
        selRef.current = i;
        setSel(i);
        setSwap((s) => s + 1);
      }
      if (speak) say(gear[i], viewRef.current);
    },
    [gear, say],
  );

  const onHover = useCallback(
    (i: number) => {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => select(i), HOVER_INTENT);
    },
    [select],
  );
  const onLeave = useCallback(() => clearTimeout(hoverTimer.current), []);
  const onFocusSlot = useCallback((i: number) => select(i), [select]);
  const onPress = useCallback(
    (i: number) => {
      clearTimeout(hoverTimer.current);
      select(i, { speak: true });
    },
    [select],
  );

  const flip = useCallback(
    (auto = false) => {
      if (!auto) lastInput.current = performance.now();
      const next: View = viewRef.current === "back" ? "front" : "back";
      viewRef.current = next;
      setView(next);
      setFlips((f) => f + 1);
      if (!auto) say(gear[selRef.current], next);
    },
    [gear, say],
  );
  const onFlip = useCallback(() => flip(), [flip]);

  const onStep = useCallback(
    (dir: -1 | 1) => {
      const i = (selRef.current + dir + gear.length) % gear.length;
      select(i, { speak: true });
    },
    [gear.length, select],
  );

  // Idle turntable: flips itself every ~5s while on screen, quiet after any input or while the mouse is over it.
  useEffect(() => {
    if (!on || !live) return;
    const t = setInterval(() => {
      if (pointerIn.current || document.visibilityState !== "visible") return;
      if (performance.now() - lastInput.current < QUIET_AFTER_INPUT) return;
      flip(true);
    }, AUTO_FLIP_MS);
    return () => clearInterval(t);
  }, [on, live, flip]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // ---- Keyboard ---------------------------------------------------------------
  const onSlotsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next: number | undefined;
    if (step) next = (selRef.current + step + gear.length) % gear.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = gear.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    slotEls.current[next]?.focus({ preventScroll: true });
  };
  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      flip();
    }
  };

  const cur = gear[sel];
  // One stable registrar: a fresh ref closure per slot per render broke MerchCard's memo,
  // so every auto-flip re-rendered all the slots.
  const registerSlot = useCallback((i: number, el: HTMLButtonElement | null) => {
    slotEls.current[i] = el;
  }, []);

  return (
    <div
      ref={rootRef}
      className="wmx"
      data-arm={armed || undefined}
      data-on={on || undefined}
      data-live={live || undefined}
      data-view={view}
      data-flips={flips > 0 || undefined}
      onKeyDown={onRootKey}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") pointerIn.current = true;
      }}
      onPointerLeave={() => {
        pointerIn.current = false;
      }}
    >
      <div className="wmx-stage">
        <MerchBezel label=":: Armory / Loadout ::" />

        <header className="wmx-head">
          <p className="wmx-kicker wmx-in" style={{ "--d": 60 } as CSSProperties}>
            <span className="wmx-kicker__chip">Loadout</span> Apparel <i>::</i> {pad2(gear.length)} slots
          </p>
          <h2 id={headingId} className="wmx-title wmx-in" style={{ "--d": 140 } as CSSProperties} aria-label={title}>
            <span ref={titleRef} aria-hidden="true">
              {title}
            </span>
          </h2>
          <p className="wmx-body wmx-in" style={{ "--d": 260 } as CSSProperties}>
            {body}
          </p>
        </header>

        <div className="wmx-tally wmx-in" style={{ "--d": 320 } as CSSProperties} aria-hidden="true">
          <span className="wmx-tally__orbs">
            {gear.map((g, i) => (
              <Orb key={g.item.handle} lit={i === sel} size="md" />
            ))}
          </span>
          <span className="wmx-tally__line">
            {pad2(gear.length)} items <i>/</i> {pad2(arts)} artworks
          </span>
          <span className="wmx-tally__line wmx-tally__line--dim">Print: front + back</span>
        </div>

        <div className="wmx-slots" role="group" aria-label="Merch items" onKeyDown={onSlotsKey}>
          {wings.map((wing, w) => {
            const side = (w + 1) as Side;
            const art = wingArt(wing);
            return (
              <Fragment key={side}>
                {w === 1 && (
                  <span className="wmx-wedge" aria-hidden="true">
                    <span className="wmx-wedge__body" style={{ clipPath: toClipPath(WEDGE) }}>
                      <Orb lit size="md" />
                    </span>
                  </span>
                )}
                <div className="wmx-wing" data-side={side}>
                  <p className="wmx-wing__head wmx-in" style={{ "--d": 360 + w * 80 } as CSSProperties} aria-hidden="true">
                    <span className="wmx-wing__art">{art ? `Art :: ${art}` : `Rack ${pad2(side)}`}</span>
                    <span className="wmx-wing__rule" />
                    <span className="wmx-wing__count">{pad2(wing.length)}</span>
                  </p>
                  <div className="wmx-wing__list">
                    {wing.map((g, k) => (
                      <MerchCard
                        key={g.item.handle}
                        gear={g}
                        side={side}
                        order={w * 2 + k}
                        selected={g.n - 1 === sel}
                        tabbable={g.n - 1 === sel}
                        controls={windowId}
                        registerSlot={registerSlot}
                        onHover={onHover}
                        onLeave={onLeave}
                        onFocusSlot={onFocusSlot}
                        onPress={onPress}
                      />
                    ))}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <Inspect
          id={windowId}
          gear={gear}
          sel={sel}
          swap={swap}
          flips={flips}
          view={view}
          fronts={flips > 0 || (on && !reduced)}
          reduced={reduced}
          blank={blank}
          shopUrl={shopUrl}
          shopHost={shopHost}
          onFlip={onFlip}
          onStep={onStep}
        />

        <div className="wmx-cta wmx-in" style={{ "--d": 640 } as CSSProperties}>
          <Button variant="secondary" size="md" href={cur.href} className="wmx-cta__view">
            View item
          </Button>
          <Button variant="link" href={shopUrl} className="wmx-cta__shop">
            Shop all
          </Button>
        </div>

        <p className="wmx-keys wmx-in" style={{ "--d": 700 } as CSSProperties} aria-hidden="true">
          <kbd>←</kbd>
          <kbd>→</kbd> Equip <i>::</i> <kbd>F</kbd> Flip
        </p>
      </div>
      <p className="w-sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).host.toUpperCase();
  } catch {
    return "SHOP";
  }
}
