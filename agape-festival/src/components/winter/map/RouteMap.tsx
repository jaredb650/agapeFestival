import type { CSSProperties, ReactNode } from "react";
import { Bullets, type SubwayLine } from "./Bullets";
import {
  AVE_ANGLE,
  AVENUES_D,
  BIKE_A,
  BIKE_B,
  CEMETERY_D,
  DROP,
  I278_D,
  LOTS,
  PARK_D,
  PIERS_D,
  ROUTE_LINES,
  STATION,
  STREETS_D,
  SUBWAY_AVE,
  VENUE_BOX,
  VENUE_D,
  WATER_D,
  WORLD,
  at,
  aveW,
  seg,
  stU,
  type Pt,
  type RouteMode,
} from "./geo";
import { GRID_PER_M, VENUE_LL } from "./land";

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

/** The scale bar's length: 200 real metres as a fraction of the world box's width. */
const SCALE_M = 200;
const SCALE_K = Math.round(((SCALE_M * GRID_PER_M) / WORLD.w) * 10000) / 10000;
const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

/**
 * The street map: one static SVG (the bay and the piers, Green-Wood, the streets where they run, I-278
 * over 3rd Ave, the venue in red) inside a box sized to cover the map's box in its panel
 * (getting-here.css), and HTML on top for what must stay crisp or move: labels, pins, the venue's ping and
 * each mode's route line with its runner. A route line is a rotated rectangle that grows along its own
 * axis (scale), and the runner rides it by transform, so nothing that moves ever repaints the SVG. Over the
 * map, fixed to its box, a quiet HUD: corner ticks, north, Manhattan's direction, the venue's coordinates,
 * a 200 m scale bar and the map data credit. The selected mode comes from data-mode on the parent
 * (RouteBoard); the loops run only while it marks the map data-live (on screen, motion allowed).
 * Server-rendered: it ships no JavaScript.
 */
export function RouteMap({ lines }: { lines: SubwayLine[] }) {
  return (
    <>
      <div className="gh-world" aria-hidden="true">
        <svg className="gh-svg" viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`} focusable="false">
          <path className="gh-water" d={WATER_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-piers" d={PIERS_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-green" d={CEMETERY_D + PARK_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-streets" d={STREETS_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-aves" d={AVENUES_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-i278" d={I278_D} vectorEffect="non-scaling-stroke" />
          <path className="gh-venue" d={VENUE_D} />
        </svg>

        {/* The venue's slow ping: its own outline, growing and fading (transform + opacity). */}
        <span className="gh-ping" style={{ ...at([0, 0]), ...VENUE_BOX, "--rot": `${AVE_ANGLE}deg` } as CSSProperties} />

        {/* Subway: the D, N and R under 4th Ave, toward Manhattan; under the labels, so 4th Ave's plate
            interrupts it like the streets. */}
        <span className="gh-rail" data-route="subway" style={seg(...SUBWAY_AVE) as CSSProperties} />

        {/* Static labels paint before the route lines: anything painted above an animating line gets
            its own compositor layer for the draw, which can seam a label's plate. */}
        <Tag p={[865, 34]} className="gh-tag--area gh-tag--bay gh-tag--bare">
          Upper
          <br />
          New York Bay
        </Tag>
        <Tag p={[-640, 400]} rotate className="gh-tag--area gh-tag--far gh-tag--bare">
          Green-Wood
        </Tag>
        <Tag p={[-480, -330]} className="gh-tag--area gh-tag--far">
          Sunset Park
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
        {/* Each route's runner: a square that travels its line, start to end, while the map is on screen. */}
        {MODES.map((m) => (
          <span key={m} className="gh-run" data-route={m} style={seg(...ROUTE_LINES[m]) as CSSProperties}>
            <i />
          </span>
        ))}

        {/* The walk starts at the station: its pin sits on top of the line. */}
        <Pin p={STATION} className="gh-pin--stop" />
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

      <div className="gh-hud" aria-hidden="true">
        <span className="gh-hud__north">N</span>
        <span className="gh-hud__to">Manhattan</span>
        <span className="gh-hud__foot">
          <span className="gh-hud__ll">{coord(VENUE_LL.lat, "N", "S")}</span>
          <span className="gh-hud__ll">{coord(VENUE_LL.lon, "E", "W")}</span>
          <span className="gh-hud__src">© OpenStreetMap</span>
        </span>
        <span className="gh-hud__scale" style={{ "--k": SCALE_K } as CSSProperties}>
          {SCALE_M} m
        </span>
      </div>
    </>
  );
}
