"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../ui/cx";

export interface TabRailItem<T extends string> {
  id: T;
  /** Orbitron caps, 3 words at most ("Subway", "Bus and bike"). */
  label: string;
  /** A 20px glyph (ui/icons). It turns red with the selection. */
  icon?: ReactNode;
}

export interface TabRailProps<T extends string> {
  /** What the rail chooses ("Ways to get here"). */
  label: string;
  items: readonly TabRailItem<T>[];
  value: T;
  /** `via` tells a pointer pick from a keyboard one. */
  onChange: (id: T, via: "pointer" | "keyboard") => void;
  /** Prefix for the tab and panel ids: see tabId() / panelId(). */
  idBase: string;
  /** Extra ids each tab also drives (a map), added to its aria-controls after its panel. */
  controls?: string;
  /**
   * Attached: one row of compact tabs (icon over label on phones, beside it from 768) sitting on top of
   * the panel they drive, inside its frame (no box of their own). The chosen tab's red bar runs along the
   * panel's top edge. Default: tiles (2 across, set --kt-cols) in their own hairline box.
   */
  attached?: boolean;
  className?: string;
}

export const tabId = (base: string, id: string) => `${base}-tab-${id}`;
export const panelId = (base: string, id: string) => `${base}-panel-${id}`;

/**
 * The tab rail (styles/kit/buttons.css, `.k-tabs`): options that each show their own panel, as tiles of
 * an icon over an Orbitron label, between hairlines. Every option is visible at once (no hidden overflow),
 * each tile is a plate with an edge so it reads as pressable without hover, and the chosen one lifts: a
 * lighter plate, a white label, its icon in red and a red bar along its foot (set --kt-mark to match a
 * line it drives, e.g. a 3px route on a map).
 *
 * `attached` docks the rail on top of what it drives (Getting here's map): every tab in one row, short,
 * so the tabs and the panel fit in one view and a pick never needs a scroll.
 *
 * Tabs semantics (APG): role=tablist / tab, one tab in the Tab order, ←/→/↑/↓ move and select at once
 * (automatic activation), Home / End jump to the ends. The caller renders the panels with
 * id={panelId(idBase, id)} role="tabpanel" aria-labelledby={tabId(idBase, id)}.
 */
export function TabRail<T extends string>({ label, items, value, onChange, idBase, controls, attached, className }: TabRailProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = items.length;
    const i = items.findIndex((t) => t.id === value);
    const k =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (k === null) return;
    e.preventDefault();
    const j = (k + n) % n;
    onChange(items[j].id, "keyboard");
    refs.current[j]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx("k-tabs", className)}
      data-attached={attached || undefined}
      style={{ "--kt-n": items.length } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      {items.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idBase, t.id)}
            className="k-tab"
            aria-selected={on}
            aria-controls={controls ? `${panelId(idBase, t.id)} ${controls}` : panelId(idBase, t.id)}
            tabIndex={on ? 0 : -1}
            // Enter / Space on a focused tab click with detail 0: a keyboard pick.
            onClick={(e) => onChange(t.id, e.detail === 0 ? "keyboard" : "pointer")}
          >
            {t.icon && <span className="k-tab__icon">{t.icon}</span>}
            <span className="k-tab__label">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
