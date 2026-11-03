"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TabRail, panelId, tabId } from "@/components/winter/classic";
import { observeInView } from "@/components/winter/perf";
import { BikeIcon, CarFrontIcon, CarIcon, TrainIcon } from "@/components/winter/ui";
import { Bullets, type SubwayLine } from "./Bullets";
import type { RouteMode } from "./geo";

/** Each way in has its glyph on its tab: the tiles read as choices before a word is read. */
const MODE_ICON: Record<RouteMode, ReactNode> = {
  subway: <TrainIcon size={20} />,
  drive: <CarIcon size={20} />,
  ride: <CarFrontIcon size={20} />,
  bike: <BikeIcon size={20} />,
};
const ID = "gh-route";

export interface Route {
  mode: RouteMode;
  /** The mode's short label ("Subway"): its tab. */
  tab: string;
  title: string;
  body: string;
  lines?: SubwayLine[];
}

interface RouteBoardProps {
  routes: Route[];
  /** The address and entrance (server-rendered), under the map in its panel. */
  place: ReactNode;
  /** The map's contents (RouteMap, server-rendered). */
  map: ReactNode;
  /** Text alternative for the map. */
  mapLabel: string;
  /** The directions links (server-rendered), after the routes. */
  actions: ReactNode;
}

/**
 * The Getting here board: a panel with the map and the address, and beside it (under it on phones) the
 * ways in as a tab rail (classic/TabRail): a tile per mode with its glyph, all four always in view, a
 * count over them ("4 ways in") and a line saying what picking does. The picked tile lifts, its glyph
 * turns red and a 3px red bar runs along its foot: the colour and weight of the route it draws on the map.
 * Under the rail, the picked route's title, train bullets and directions (every panel is in the page; the
 * others are hidden, and the stack keeps the tallest one's height so nothing below jumps). Picking sets
 * data-mode on the map and CSS draws that route's line and shows its pins. Tabs semantics: ←/→/↑/↓ move
 * and pick, Home / End jump.
 *
 * The picked route's line also draws once when the map first comes into view: on mount the map is armed
 * (lines held at zero length), and an IntersectionObserver releases it. Without JavaScript, or with
 * reduced motion, the line is simply there.
 */
export function RouteBoard({ routes, place, map, mapLabel, actions }: RouteBoardProps) {
  const [mode, setMode] = useState<RouteMode>(routes[0].mode);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.setAttribute("data-armed", "");
    let done = false;
    let stop = () => {};
    stop = observeInView(
      el,
      (inView) => {
        if (!inView || done) return;
        done = true;
        el.setAttribute("data-in", "");
        stop();
      },
      { threshold: 0.3 },
    );
    if (done) stop();
    return () => stop();
  }, []);

  // On phones the map sits above the rail, so a tap could draw its route off screen. A pointer pick brings
  // the map back into view, only when less than half of it shows below the bar. Keyboard picks (arrows,
  // Enter / Space) leave the scroll alone so focus stays in view.
  const pick = (next: RouteMode, via: "pointer" | "keyboard") => {
    setMode(next);
    const el = mapRef.current;
    if (!el || via !== "pointer") return;
    const r = el.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const shown = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, top);
    if (shown >= r.height / 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  const items = routes.map((r) => ({ id: r.mode, label: r.tab, icon: MODE_ICON[r.mode] }));

  return (
    <div className="gh-board" data-reveal="">
      <div className="k-panel gh-panel">
        <div className="gh-mapbox">
          <div ref={mapRef} id="gh-map" className="gh-map" data-mode={mode} role="img" aria-label={mapLabel}>
            {map}
          </div>
        </div>
        {place}
      </div>

      <div className="gh-ways">
        <div className="gh-modes">
          <p className="k-label">{routes.length} ways in</p>
          <p className="gh-modes__hint">Pick one to see it on the map</p>
        </div>
        <TabRail label="Ways to get here" items={items} value={mode} onChange={pick} idBase={ID} controls="gh-map" className="gh-tabs" />
        <div className="gh-details">
          {routes.map((r) => {
            const on = r.mode === mode;
            return (
              <div
                key={r.mode}
                id={panelId(ID, r.mode)}
                role="tabpanel"
                aria-labelledby={tabId(ID, r.mode)}
                tabIndex={on ? 0 : -1}
                className="gh-detail"
                data-on={on || undefined}
              >
                <h3 className="gh-detail__title">
                  {r.title}
                  {r.lines?.length ? <Bullets lines={r.lines} /> : null}
                </h3>
                <p className="gh-detail__body">{r.body}</p>
              </div>
            );
          })}
        </div>
        {actions}
      </div>
    </div>
  );
}
