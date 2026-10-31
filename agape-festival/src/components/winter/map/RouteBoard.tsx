"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Cell, Row } from "@/components/winter/grid";
import { observeInView } from "@/components/winter/perf";
import { Bullets, type SubwayLine } from "./Bullets";
import type { RouteMode } from "./geo";

export interface Route {
  mode: RouteMode;
  /** Tab label. */
  tab: string;
  title: string;
  body: string;
  lines?: SubwayLine[];
}

interface RouteBoardProps {
  routes: Route[];
  /** The address and entrance cells (server-rendered). */
  info: ReactNode;
  /** The map's contents (RouteMap, server-rendered). */
  map: ReactNode;
  /** Text alternative for the map. */
  mapLabel: string;
  /** The directions cells (server-rendered). */
  actions: ReactNode;
}

/**
 * The Getting here board: one Row holding the address, the map, the route tabs, the selected route's
 * instructions and the directions links. Picking a route sets data-mode on the map, and CSS draws that
 * route's line and shows its pins. The only client state is the selected mode.
 *
 * The selected route's line also draws once when the map first comes into view: on mount the map is
 * armed (lines held at zero length), and an IntersectionObserver releases it. Without JavaScript, or
 * with reduced motion, the line is simply there.
 */
export function RouteBoard({ routes, info, map, mapLabel, actions }: RouteBoardProps) {
  const [mode, setMode] = useState<RouteMode>(routes[0].mode);
  const mapRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Arrow keys move the selection along the tabs (automatic activation); Home / End jump to the ends.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = routes.length;
    const i = routes.findIndex((r) => r.mode === mode);
    const k = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (k === null) return;
    e.preventDefault();
    const j = (k + n) % n;
    setMode(routes[j].mode);
    tabRefs.current[j]?.focus();
  };

  return (
    <Row className="gh-board">
      {info}
      <Cell pad="none" className="gh-map-cell">
        <div ref={mapRef} className="gh-map" data-mode={mode} role="img" aria-label={mapLabel}>
          {map}
        </div>
      </Cell>
      <div role="tablist" aria-label="How to get here" className="gh-tabs" onKeyDown={onKeyDown}>
        {routes.map((r, i) => {
          const on = r.mode === mode;
          return (
            <button
              key={r.mode}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`gh-tab-${r.mode}`}
              aria-selected={on}
              aria-controls={`gh-panel-${r.mode}`}
              tabIndex={on ? 0 : -1}
              className="g-cell gh-tab"
              onClick={() => setMode(r.mode)}
            >
              {r.tab}
            </button>
          );
        })}
      </div>
      <Cell className="gh-panels">
        {routes.map((r) => {
          const on = r.mode === mode;
          return (
            <div
              key={r.mode}
              role="tabpanel"
              id={`gh-panel-${r.mode}`}
              aria-labelledby={`gh-tab-${r.mode}`}
              tabIndex={on ? 0 : -1}
              className="gh-panel"
              data-on={on || undefined}
            >
              <h3 className="w-title gh-panel__title">
                {r.title}
                {r.lines?.length ? <Bullets lines={r.lines} /> : null}
              </h3>
              <p className="w-body">{r.body}</p>
            </div>
          );
        })}
      </Cell>
      {actions}
    </Row>
  );
}
