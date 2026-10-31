"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  AVE_ANGLE,
  AVENUES,
  BIKE_A,
  BIKE_B,
  BLOCKS,
  DROP,
  DROP_CURB,
  I278_A,
  I278_B,
  LOTS,
  PIERS,
  RINGS,
  SHORELINE,
  STATION,
  STREETS,
  ST_ANGLE,
  SUBWAY_D,
  SUBWAY_NR,
  VENUE,
  VENUE_BUILDINGS,
  VENUE_ZONE,
  WALK,
  WALK_TBA,
  WATER,
  WORLD,
  at,
  aveW,
  fmtLat,
  fmtLon,
  latLonAt,
  stU,
} from "./geo";

export type RouteMode = "subway" | "drive" | "ride" | "bike";

export interface MapLine {
  line: string;
  color: string;
  textColor: string;
}

interface HudMapProps {
  mode: RouteMode;
  onPick: (mode: RouteMode) => void;
  lines: MapLine[];
}

// Street / avenue name plates (rotated along their line).
const AVE_LABELS: [number, number, string][] = [
  [aveW(1), 330, "1 AV"],
  [aveW(2), 420, "2 AV"],
  [aveW(3), 520, "3 AV"],
  [aveW(4), -420, "4 AV"],
  [aveW(5), -330, "5 AV"],
  [aveW(6), -240, "6 AV"],
];
const ST_LABELS: [number, number, string][] = [
  ...[29, 31, 33, 39, 41, 43].map((k) => [aveW(1) - 110, stU(k) + 14, `${k} ST`] as [number, number, string]),
  ...[30, 32, 34, 36, 38, 40].map((k) => [aveW(4) - 110, stU(k) + 14, `${k} ST`] as [number, number, string]),
];

const pos = (p: [number, number]) => at(p[0], p[1]);
/** Ring label position: on the ring, up-right at 45°. */
const ringAt = (r: number) => ({
  left: `${(((r * Math.SQRT1_2 - WORLD.x) / WORLD.w) * 100).toFixed(2)}%`,
  top: `${(((-r * Math.SQRT1_2 - WORLD.y) / WORLD.h) * 100).toFixed(2)}%`,
});

/**
 * Tactical HUD map: a stylised true-north blueprint (inline SVG, geometry only)
 * in a "world" box sized like object-fit: cover and centred on the venue, with
 * HTML overlays for every label so type stays crisp at any scale. The
 * targeting reticle, radar and crosshair are separate composited layers;
 * the SVG only animates once (streets drawing in, rings opening).
 */
export function HudMap({ mode, onPick, lines }: HudMapProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // Edge rulers: real lat/lon at fixed points of the viewport, recomputed on resize.
  useEffect(() => {
    const view = viewRef.current;
    const world = worldRef.current;
    if (!view || !world || typeof ResizeObserver === "undefined") return;
    const lonEls = view.querySelectorAll<HTMLElement>("[data-lon]");
    const latEls = view.querySelectorAll<HTMLElement>("[data-lat]");
    const update = () => {
      const v = view.getBoundingClientRect();
      const w = world.getBoundingClientRect();
      if (!w.width) return;
      lonEls.forEach((el) => {
        const f = Number(el.dataset.lon);
        el.textContent = fmtLon(latLonAt((v.left + v.width * f - w.left) / w.width, 0.5).lon, 3);
      });
      latEls.forEach((el) => {
        const f = Number(el.dataset.lat);
        el.textContent = fmtLat(latLonAt(0.5, (v.top + v.height * f - w.top) / w.height).lat, 3);
      });
    };
    const ro = new ResizeObserver(update);
    ro.observe(view);
    return () => ro.disconnect();
  }, []);

  // Pointer crosshair (fine pointers): transform-only, one rAF per move, readout via textContent.
  useEffect(() => {
    const view = viewRef.current;
    const world = worldRef.current;
    if (!view || !world || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const h = view.querySelector<HTMLElement>(".wgh-ptr__h");
    const v = view.querySelector<HTMLElement>(".wgh-ptr__v");
    const tag = view.querySelector<HTMLElement>(".wgh-ptr__tag");
    const lat = view.querySelector<HTMLElement>(".wgh-ptr__lat");
    const lon = view.querySelector<HTMLElement>(".wgh-ptr__lon");
    const dist = view.querySelector<HTMLElement>(".wgh-ptr__dist");
    if (!h || !v || !tag || !lat || !lon || !dist) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    let vr = view.getBoundingClientRect();
    let wr = world.getBoundingClientRect();
    const paint = () => {
      raf = 0;
      const x = px - vr.left;
      const y = py - vr.top;
      h.style.transform = `translate3d(0, ${y}px, 0)`;
      v.style.transform = `translate3d(${x}px, 0, 0)`;
      const flip = x > vr.width - 190;
      tag.style.transform = `translate3d(${flip ? x - 14 : x + 14}px, ${y + 14}px, 0)${flip ? " translateX(-100%)" : ""}`;
      const p = latLonAt((px - wr.left) / wr.width, (py - wr.top) / wr.height);
      lat.textContent = fmtLat(p.lat);
      lon.textContent = fmtLon(p.lon);
      dist.textContent = `${(p.dist / 1000).toFixed(2)} KM`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      vr = view.getBoundingClientRect();
      wr = world.getBoundingClientRect();
      view.setAttribute("data-ptr", "");
      onMove(e);
    };
    const onLeave = () => view.removeAttribute("data-ptr");
    view.addEventListener("pointerenter", onEnter);
    view.addEventListener("pointermove", onMove, { passive: true });
    view.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      view.removeEventListener("pointerenter", onEnter);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={viewRef} className="wgh-view" data-mode={mode}>
      <div className="wgh-grid" aria-hidden="true" />

      <div ref={worldRef} className="wgh-world" aria-hidden="true">
        <svg className="wgh-svg" viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`} focusable="false">
          <defs>
            <pattern id="wgh-hatch" width="15" height="15" patternUnits="userSpaceOnUse" patternTransform={`rotate(${ST_ANGLE})`}>
              <path className="wgh-svg__hatch" d="M0 0V15" />
            </pattern>
          </defs>
          <g className="wgh-l wgh-l--water">
            <path className="wgh-water-tint" d={WATER} />
            <path className="wgh-water" d={WATER} fill="url(#wgh-hatch)" />
            <path className="wgh-piers" d={PIERS} />
            <path className="wgh-shore" d={SHORELINE} pathLength={1} />
          </g>
          <path className="wgh-l wgh-blocks" d={BLOCKS} />
          <g className="wgh-l wgh-streets">
            {STREETS.map((s, i) => (
              <path key={s.id} d={s.d} pathLength={1} data-major={s.major || undefined} style={{ "--i": i } as CSSProperties} />
            ))}
          </g>
          <g className="wgh-l wgh-aves">
            {AVENUES.map((s, i) => (
              <path key={s.id} d={s.d} pathLength={1} data-major={s.major || undefined} style={{ "--i": i } as CSSProperties} />
            ))}
          </g>
          <g className="wgh-l wgh-zone">
            <path className="wgh-zone__fill" d={VENUE_ZONE} />
            <path className="wgh-zone__bldg" d={VENUE_BUILDINGS} />
            <path className="wgh-zone__edge" d={VENUE_ZONE} pathLength={1} />
          </g>
          <g className="wgh-l wgh-rings">
            {RINGS.map((r, i) => (
              <circle key={r} cx={0} cy={0} r={r} data-i={i} />
            ))}
          </g>
          {/* Routes: keyed on mode so the active one re-draws on every switch. */}
          <g className="wgh-route" data-route="subway" data-on={mode === "subway" || undefined} key={`sub-${mode === "subway"}`}>
            <path className="wgh-route__d" d={SUBWAY_D} />
            <path className="wgh-route__nr" d={SUBWAY_NR} />
            <path className="wgh-route__walk" d={WALK} pathLength={1} />
            <path className="wgh-route__tba" d={WALK_TBA} />
          </g>
          <g className="wgh-route" data-route="drive" data-on={mode === "drive" || undefined} key={`drv-${mode === "drive"}`}>
            <path className="wgh-route__hwy" d={I278_A} pathLength={1} />
            <path className="wgh-route__hwy" d={I278_B} pathLength={1} />
          </g>
          <g className="wgh-route" data-route="ride" data-on={mode === "ride" || undefined} key={`ride-${mode === "ride"}`}>
            <path className="wgh-route__curb" d={DROP_CURB} pathLength={1} />
          </g>
        </svg>

        {/* Plates */}
        <span className="wgh-water-label" style={at(585, -400)}>
          Upper New York Bay
        </span>
        <span className="wgh-area" style={at(aveW(5) - 60, stU(41))}>
          Sunset Park
        </span>
        {AVE_LABELS.map(([w, u, t]) => (
          <span key={t} className="wgh-plate wgh-plate--ave" style={{ ...at(w, u), "--rot": `${AVE_ANGLE}deg` } as CSSProperties}>
            {t}
          </span>
        ))}
        {ST_LABELS.map(([w, u, t]) => (
          <span key={t} className="wgh-plate wgh-plate--st" style={{ ...at(w, u), "--rot": `${ST_ANGLE}deg` } as CSSProperties}>
            {t}
          </span>
        ))}
        {RINGS.map((r) => (
          <span key={r} className="wgh-ring-label" data-r={r} style={ringAt(r)}>
            {r} M
          </span>
        ))}

        {/* Radar sweep + lock-on crosshair (composited layers) */}
        <span className="wgh-radar" />
        <span className="wgh-xh wgh-xh--h" />
        <span className="wgh-xh wgh-xh--v" />

        {/* Callouts (light up with their route mode) */}
        <Callout at={pos(STATION)} dir="nw" mode="subway" active={mode} onPick={onPick} title="36 St Station" sub="Subway :: closest stop">
          <span className="wgh-bullets">
            {lines.map((l) => (
              <span key={l.line} className="wgh-bullet" style={{ background: l.color, color: l.textColor }}>
                {l.line}
              </span>
            ))}
          </span>
        </Callout>
        <Callout at={at(aveW(3), stU(30))} dir="nw" mode="drive" active={mode} onPick={onPick} title="I-278 W :: BQE" sub="Exit 23" pip="none" />
        <Callout at={pos(LOTS)} dir="sw" mode="drive" active={mode} onPick={onPick} title="Lots B + C" sub="Entry :: 2nd Ave + 37th St" />
        <Callout at={pos(DROP)} dir="nw" mode="ride" active={mode} onPick={onPick} title="Drop-off" sub="571 2nd Avenue" />
        <Callout at={pos(BIKE_A)} dir="nw" mode="bike" active={mode} onPick={onPick} title="Citi Bike" sub="2nd Ave + 32 St :: closest" />
        <Callout at={pos(BIKE_B)} dir="se" mode="bike" active={mode} onPick={onPick} title="Citi Bike" sub="3rd Ave + 36 St" />

        {/* Target reticle */}
        <div className="wgh-ret">
          <span className="wgh-ret__sweep">
            <span className="wgh-ret__spin">
              <svg viewBox="-60 -60 120 120" focusable="false">
                <circle className="wgh-ret__dash" r="50" />
                <path className="wgh-ret__ticks" d="M0 -58V-50M0 50V58M-58 0H-50M50 0H58" />
              </svg>
            </span>
            <svg className="wgh-ret__svg" viewBox="-60 -60 120 120" focusable="false">
              <circle className="wgh-ret__ring" r="34" />
              <path className="wgh-ret__cross" d="M0 -26V-10M0 10V26M-26 0H-10M10 0H26" />
              <circle className="wgh-ret__dot" r="2.4" />
            </svg>
            <span className="wgh-ret__box">
              <i />
              <i />
              <i />
              <i />
            </span>
          </span>
          <span className="wgh-ret__ping" />
          <span className="wgh-ret__ping wgh-ret__ping--2" />
          <span className="wgh-ret__tag">
            <b data-decode="2350" data-decode-from="SCANNING">TGT-01 :: LOCKED</b>
            <span>Industry City</span>
            <em>Gate :: TBA</em>
          </span>
        </div>
      </div>

      <div className="wgh-scrim" aria-hidden="true" />

      {/* Edge rulers with live lat/lon */}
      <div className="wgh-ruler wgh-ruler--x" aria-hidden="true">
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <span key={f} data-lon={f} style={{ left: `${f * 100}%` }}>
            {fmtLon(VENUE.lon, 3)}
          </span>
        ))}
      </div>
      <div className="wgh-ruler wgh-ruler--y" aria-hidden="true">
        {[0.34, 0.5, 0.66].map((f) => (
          <span key={f} data-lat={f} style={{ top: `${f * 100}%` }}>
            {fmtLat(VENUE.lat, 3)}
          </span>
        ))}
      </div>

      {/* Pointer crosshair */}
      <div className="wgh-ptr" aria-hidden="true">
        <span className="wgh-ptr__h" />
        <span className="wgh-ptr__v" />
        <span className="wgh-ptr__tag">
          <span className="wgh-ptr__lat">{fmtLat(VENUE.lat)}</span>
          <span className="wgh-ptr__lon">{fmtLon(VENUE.lon)}</span>
          <span>
            Δ TGT <span className="wgh-ptr__dist">0.00 KM</span>
          </span>
        </span>
      </div>

      <Compass />
    </div>
  );
}

function Callout({
  at: style,
  dir,
  mode,
  active,
  onPick,
  title,
  sub,
  pip = "square",
  children,
}: {
  at: CSSProperties;
  dir: "ne" | "nw" | "se" | "sw";
  mode: RouteMode;
  active: RouteMode;
  onPick: (m: RouteMode) => void;
  title: string;
  sub: string;
  pip?: "square" | "none";
  children?: ReactNode;
}) {
  return (
    <span className="wgh-call" data-dir={dir} data-mode={mode} data-on={active === mode || undefined} data-pip={pip} style={style} onClick={() => onPick(mode)}>
      <span className="wgh-call__pip" />
      <svg className="wgh-call__lead" viewBox="0 0 44 26" focusable="false">
        <path d="M0 26L22 4H44" pathLength={1} />
      </svg>
      <span className="wgh-call__box">
        <b>{title}</b>
        <span>{sub}</span>
        {children}
      </span>
    </span>
  );
}

function Compass() {
  return (
    <div className="wgh-compass" aria-hidden="true">
      <svg viewBox="-40 -40 80 80" focusable="false">
        <circle className="wgh-compass__ring" r="30" />
        <g className="wgh-compass__ticks">
          {Array.from({ length: 24 }, (_, i) => (
            <path key={i} d={i % 6 === 0 ? "M0 -30V-24" : "M0 -30V-27"} transform={`rotate(${i * 15})`} />
          ))}
        </g>
        <g className="wgh-compass__needle">
          <path className="wgh-compass__n" d="M0 -22L5 0H-5Z" />
          <path className="wgh-compass__s" d="M0 22L5 0H-5Z" />
        </g>
        <path className="wgh-compass__grid" d="M0 0L0 -34" transform={`rotate(${90 + AVE_ANGLE})`} />
      </svg>
      <span className="wgh-compass__n-label">N</span>
      <span className="wgh-compass__meta">Grid 038°</span>
    </div>
  );
}
