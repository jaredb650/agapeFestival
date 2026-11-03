"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TabRail, panelId, tabId } from "@/components/winter/classic";
import { observeInView } from "@/components/winter/perf";
import { BikeIcon, CarFrontIcon, CarIcon, TrainIcon } from "@/components/winter/ui";
import { Bullets, type SubwayLine } from "./Bullets";
import type { RouteMode } from "./geo";

/** Each way in has its glyph on its tab: the tabs read as choices before a word is read. */
const MODE_ICON: Record<RouteMode, ReactNode> = {
  subway: <TrainIcon size={20} />,
  drive: <CarIcon size={20} />,
  ride: <CarFrontIcon size={20} />,
  bike: <BikeIcon size={20} />,
};
const ID = "gh-route";

export interface Route {
  mode: RouteMode;
  /** The mode's short label ("Subway"): its tab. One or two short words: four share a phone's width. */
  tab: string;
  title: string;
  body: string;
  lines?: SubwayLine[];
}

interface RouteBoardProps {
  routes: Route[];
  /** The address and entrance (server-rendered), after the picked route. */
  place: ReactNode;
  /** The map's contents (RouteMap, server-rendered). */
  map: ReactNode;
  /** Text alternative for the map. */
  mapLabel: string;
  /** The directions links (server-rendered), last. */
  actions: ReactNode;
}

/**
 * The Getting here board: one panel of the ways in as tabs docked on top of the map (classic/TabRail,
 * attached), sized so the tabs and the whole map fit in one view under the bar: tapping a tab changes the
 * map right there and never scrolls. The picked tab lifts, its glyph turns red and a 3px red bar runs along
 * the map's top edge under it: the colour and weight of the route it draws. Under the panel (beside it from
 * 1024), the picked route's title, train bullets and directions (every panel is in the page; the others are
 * hidden, and the stack keeps the tallest one's height so nothing below jumps), the address, the map links.
 * Picking sets data-mode on the map and CSS draws that route's line and shows its pins. Tabs semantics:
 * ←/→/↑/↓ move and pick, Home / End jump.
 *
 * The picked route's line also draws once when the map first comes into view: on mount the map is armed
 * (lines held at zero length), and an IntersectionObserver releases it. Without JavaScript, or with
 * reduced motion, the line is simply there. A second observer marks the map data-live while it is on
 * screen: the venue's ping and the route's runner loop only then, and never with reduced motion.
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
    // The map's loops (the venue's ping, the route's runner) run only while it is on screen.
    const stopLive = observeInView(el, (inView) => el.toggleAttribute("data-live", inView));
    return () => {
      stop();
      stopLive();
    };
  }, []);

  const items = routes.map((r) => ({ id: r.mode, label: r.tab, icon: MODE_ICON[r.mode] }));

  return (
    <div className="gh-board" data-reveal="">
      <div className="k-panel gh-stage">
        <TabRail label="Ways to get here" items={items} value={mode} onChange={setMode} idBase={ID} controls="gh-map" attached className="gh-tabs" />
        <div className="gh-mapbox">
          <div ref={mapRef} id="gh-map" className="gh-map" data-mode={mode} role="img" aria-label={mapLabel}>
            {map}
          </div>
        </div>
      </div>

      <div className="gh-ways">
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
        {place}
        {actions}
      </div>
    </div>
  );
}
