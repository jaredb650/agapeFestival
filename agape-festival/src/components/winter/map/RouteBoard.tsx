"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { observeInView } from "@/components/winter/perf";
import { Bullets, type SubwayLine } from "./Bullets";
import type { RouteMode } from "./geo";

export interface Route {
  mode: RouteMode;
  /** The mode's short label ("Subway"). */
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
 * The Getting here board: a panel with the map and the address, and beside it the ways in as hairline
 * rows, then the directions links. Every route's text is always shown; picking a row (a radio: arrow keys
 * move and pick, as the old tabs did) sets data-mode on the map, and CSS draws that route's line and shows
 * its pins. The only client state is the picked mode.
 *
 * The picked route's line also draws once when the map first comes into view: on mount the map is armed
 * (lines held at zero length), and an IntersectionObserver releases it. Without JavaScript, or with
 * reduced motion, the line is simply there.
 */
export function RouteBoard({ routes, place, map, mapLabel, actions }: RouteBoardProps) {
  const [mode, setMode] = useState<RouteMode>(routes[0].mode);
  const mapRef = useRef<HTMLDivElement>(null);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Arrow keys move the pick along the rows (automatic activation); Home / End jump to the ends.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = routes.length;
    const i = routes.findIndex((r) => r.mode === mode);
    const next = e.key === "ArrowDown" || e.key === "ArrowRight";
    const prev = e.key === "ArrowUp" || e.key === "ArrowLeft";
    const k = next ? i + 1 : prev ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (k === null) return;
    e.preventDefault();
    const j = (k + n) % n;
    setMode(routes[j].mode);
    radioRefs.current[j]?.focus();
  };

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
        <div role="radiogroup" aria-label="Show a route on the map" className="gh-routes" onKeyDown={onKeyDown}>
          {routes.map((r, i) => {
            const on = r.mode === mode;
            return (
              <div key={r.mode} className="gh-route" data-on={on || undefined}>
                <button
                  ref={(el) => {
                    radioRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-controls="gh-map"
                  aria-describedby={`gh-route-${r.mode}`}
                  tabIndex={on ? 0 : -1}
                  className="gh-route__pick"
                  onClick={() => setMode(r.mode)}
                >
                  <span className="k-label gh-route__mode">{r.tab}</span>
                  <span className="gh-route__title">
                    {r.title}
                    {r.lines?.length ? <Bullets lines={r.lines} /> : null}
                  </span>
                  <span className="gh-route__key" aria-hidden="true" />
                </button>
                <p id={`gh-route-${r.mode}`} className="gh-route__body">
                  {r.body}
                </p>
              </div>
            );
          })}
        </div>
        {actions}
      </div>
    </div>
  );
}
