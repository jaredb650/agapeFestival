import type { CSSProperties, ReactNode } from "react";
import { Bullets, type SubwayLine } from "./Bullets";
import {
  AVE_ANGLE,
  AVENUES_D,
  BIKE_A,
  BIKE_B,
  DROP,
  LOTS,
  ROUTE_LINES,
  SHORE_D,
  STATION,
  STREETS_D,
  VENUE_D,
  WORLD,
  at,
  aveW,
  seg,
  stU,
  type Pt,
  type RouteMode,
} from "./geo";

type Align = "c" | "l" | "r";

function Tag({ p, align = "c", rotate, route, className, children }: { p: Pt; align?: Align; rotate?: boolean; route?: RouteMode; className?: string; children: ReactNode }) {
  const style = { ...at(p), ...(rotate ? { "--rot": `${AVE_ANGLE}deg` } : {}) } as CSSProperties;
  return (
    <span className={className ? `gh-tag ${className}` : "gh-tag"} data-align={align} data-route={route} style={style}>
      {children}
    </span>
  );
}

const Pin = ({ p, route, className }: { p: Pt; route?: RouteMode; className?: string }) => (
  <span className={className ? `gh-pin ${className}` : "gh-pin"} data-route={route} style={at(p)} />
);

const MODES = Object.keys(ROUTE_LINES) as RouteMode[];

/**
 * The street map: one static SVG (streets, avenues, the shore, the venue in red) inside a box sized to
 * cover the map's box in its panel (getting-here.css), and HTML on top for what must stay crisp or move:
 * labels, pins and each mode's route line. A route line is a rotated rectangle that grows along its own axis (scale), so
 * drawing one never repaints the SVG. The selected mode comes from data-mode on the parent (RouteBoard).
 * Server-rendered: it ships no JavaScript.
 */
export function RouteMap({ lines }: { lines: SubwayLine[] }) {
  return (
    <div className="gh-world" aria-hidden="true">
      <svg className="gh-svg" viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`} focusable="false">
        <path className="gh-streets" d={STREETS_D} vectorEffect="non-scaling-stroke" />
        <path className="gh-aves" d={AVENUES_D} vectorEffect="non-scaling-stroke" />
        <path className="gh-shore" d={SHORE_D} vectorEffect="non-scaling-stroke" />
        <path className="gh-venue" d={VENUE_D} />
      </svg>

      {/* Static labels paint before the route lines: anything painted above an animating line gets
          its own compositor layer for the draw, which can seam a label's plate. */}
      <Tag p={[600, stU(36)]} className="gh-tag--bay">
        Upper New York Bay
      </Tag>
      <Tag p={[aveW(2), stU(30.5)]} rotate>
        2nd Ave
      </Tag>
      <Tag p={[aveW(3), stU(30.5)]} rotate className="gh-tag--3rd">
        3rd Ave
      </Tag>
      <Tag p={[aveW(4), stU(34.5)]} rotate>
        4th Ave
      </Tag>
      <Tag p={[aveW(2) + 30, stU(34.5)]} align="r" className="gh-tag--venue">
        Industry City
      </Tag>

      <Tag p={STATION} align="l" className="gh-tag--station">
        36th St
        <Bullets lines={lines} />
      </Tag>

      {MODES.map((m) => (
        <span key={m} className="gh-line" data-route={m} style={seg(...ROUTE_LINES[m]) as CSSProperties} />
      ))}

      {/* The walk starts at the station: its pin sits on top of the line. */}
      <Pin p={STATION} />
      <Tag p={[aveW(3), stU(30.5)]} rotate route="drive">
        I-278
      </Tag>
      <Pin p={LOTS} route="drive" />
      <Tag p={LOTS} align="r" route="drive">
        Lots B + C
      </Tag>

      <Pin p={DROP} route="ride" />
      <Tag p={DROP} align="r" route="ride">
        Drop-off
      </Tag>

      <Pin p={BIKE_A} route="bike" />
      <Tag p={BIKE_A} align="r" route="bike">
        Citi Bike
      </Tag>
      <Pin p={BIKE_B} route="bike" />
      <Tag p={BIKE_B} align="l" route="bike">
        Citi Bike
      </Tag>
    </div>
  );
}
