import type { CSSProperties } from "react";
import { Redaction } from "@/components/winter/ui";
import { TBA_LABEL, WINTER } from "@/data/winter";
import { buildBoard, dotDate, pad2, spokenName, type BoardRow } from "@/components/winter/lineup/board";
import { LineupMotion } from "@/components/winter/lineup/LineupMotion";
import { FLYER } from "./media";
import "@/styles/sections/lineup.css";

// Distinct blob shapes per hidden slot so they don't look stamped.
const BLOBS: Record<string, { length: number; seed: number }> = {
  "tba-1": { length: 6.4, seed: 3 },
  "tba-2": { length: 4.6, seed: 12 },
  "tba-3": { length: 5.2, seed: 21 },
};

const board = buildBoard();
const total = board.reduce((s, d) => s + d.rows.length, 0);
const named = board.reduce((s, d) => s + d.named, 0);
const locked = total - named;
const maxRows = Math.max(...board.map((d) => d.rows.length));
// Level meter ornament: fixed bar heights + bounce periods (deterministic, so SSR matches).
const EQ = [0.46, 0.72, 0.58, 0.94, 0.66, 0.38, 0.82, 1, 0.7, 0.52, 0.88, 0.62, 0.42, 0.76, 0.9, 0.56, 0.34, 0.68, 0.5, 0.28].map((h, i) => ({
  h,
  t: 0.52 + ((i * 7) % 11) * 0.06,
}));
const [d1, d2] = board.map((d) => d.info);
// "02.19–20.27"
const span = `${dotDate(d1.isoDate).slice(0, 5)}–${dotDate(d2.isoDate).slice(3)}`;

function Row({ row, linked }: { row: BoardRow; linked: boolean }) {
  const { act, day, n, k } = row;
  const wd = row.day === 1 ? d1 : d2;
  const style = { "--k": k } as CSSProperties;
  const num = (
    <span className="wlu-row__num" aria-hidden="true">
      {pad2(n)}
    </span>
  );
  const rule = (
    <span className="wlu-row__rule" aria-hidden="true">
      <svg className="wlu-row__notch" viewBox="0 0 14 5" focusable="false">
        <path d="M0 4.5h7.5l4-4h2.5" />
      </svg>
      <i className="wlu-row__line" />
      <i className="wlu-row__lit" />
    </span>
  );
  const brackets = (
    <span className="wlu-row__brk" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
  const date = `${wd.weekday.slice(0, 3).toUpperCase()} ${dotDate(wd.isoDate).slice(0, 5)}`;

  if (act.kind === "tba") {
    const blob = BLOBS[act.id] ?? { length: 5, seed: 9 };
    return (
      <li className="wlu-row" data-n={n} data-day={day} data-tba="" style={style}>
        <div className="wlu-row__hit">
          {num}
          <span className="wlu-row__sub" aria-hidden="true">
            <span className="wlu-row__date">{date} <i>::</i> </span>
            <span className="wlu-row__status">Encrypted</span>
            <span className="wlu-row__alt">{TBA_LABEL}</span>
          </span>
          <span className="wlu-row__name">
            <Redaction length={blob.length} seed={blob.seed} label={TBA_LABEL} className="wlu-row__blob" />
          </span>
          {rule}
          {brackets}
        </div>
      </li>
    );
  }

  const sub = (
    <span className="wlu-row__sub" aria-hidden="true">
      <span className="wlu-row__date">{date} <i>::</i> </span>
      <span className="wlu-row__status">Confirmed</span>
      {linked && <span className="wlu-row__alt">Open profile ▸</span>}
    </span>
  );
  const name = (
    <span className="wlu-row__name">
      <span className="w-sr-only">{spokenName(act)}</span>
      <span className="wlu-row__text" data-decode={act.displayName} aria-hidden="true">
        {act.displayName}
      </span>
    </span>
  );
  const tag = (
    <span className="wlu-row__tag" aria-hidden="true">
      D{day}
    </span>
  );

  return (
    <li className="wlu-row" data-n={n} data-day={day} style={style}>
      {linked ? (
        <a className="wlu-row__hit" href="#artists" data-artist={act.slug} aria-label={`${spokenName(act)}, open artist profile`}>
          {num}
          {sub}
          {name}
          {tag}
          {rule}
          {brackets}
        </a>
      ) : (
        <div className="wlu-row__hit">
          {num}
          {sub}
          {name}
          {tag}
          {rule}
          {brackets}
        </div>
      )}
    </li>
  );
}

/**
 * The lineup as a DVD-back track list (Sound & Motion Vol.01 reference): an
 * index ticker, a big thin edition title, then Day 1 | Day 2 in two tight
 * columns with outlined numbers, a sub-label over each name and a notched
 * hairline under it. One screen on desktop and phones. The markup is static;
 * LineupMotion arms the entrance (ticker run, hairlines drawing in, number
 * flicks, names decoding) and the hover/idle FX.
 */
export function Lineup({ linkToSelect }: { linkToSelect: boolean }) {
  return (
    <section id="lineup" className="wlu" aria-labelledby="lineup-title" data-bg-dim="0.4" data-linked={linkToSelect || undefined} data-pause-offscreen="">
      <div className="wlu__panel">
        <svg className="wlu__bezel" aria-hidden="true" focusable="false">
          <path className="wlu__bezel-fill" />
          <path className="wlu__bezel-outer" />
          <path className="wlu__bezel-inner" />
          <path className="wlu__bezel-pins" />
        </svg>
        <span className="wlu__notch" aria-hidden="true">
          :: Lineup ::
        </span>

        <ol className="wlu__ticker" aria-hidden="true">
          {board.flatMap((d) =>
            d.rows.map((r) => (
              <li key={r.n} className="wlu-tick" data-n={r.n} data-tba={r.act.kind === "tba" || undefined} style={{ "--n": r.n - 1 } as CSSProperties}>
                .{pad2(r.n)}
              </li>
            )),
          )}
          <li className="wlu__sweep" />
        </ol>

        <header className="wlu__head">
          <p className="wlu__vol" aria-hidden="true">
            <span className="wlu__vol-bar" />
            Winter<span className="wlu__vol-num">.{WINTER.year.slice(2)}</span>
          </p>
          <span className="wlu__eq" aria-hidden="true">
            {EQ.map((b, i) => (
              <i key={i} style={{ "--h": b.h, "--t": `${b.t.toFixed(2)}s`, "--i": i } as CSSProperties} />
            ))}
          </span>
          <div className="wlu__meta">
            <p className="wlu__facts">
              {pad2(total)} acts <i>/</i> 2 days <i>/</i> one stage per day
            </p>
            <h2 id="lineup-title" className="wlu__title">
              Lineup <i aria-hidden="true">::</i> <span className="w-sr-only">February 19 to 20, 2027</span>
              <span aria-hidden="true">{span}</span>
            </h2>
            <p className="wlu__where">
              {WINTER.venue.name} <i>::</i> {WINTER.venue.location}
            </p>
          </div>
          <div className="wlu__lcd" aria-hidden="true">
            <span>
              {pad2(named)} confirmed <i>/</i> {pad2(locked)} encrypted
            </span>
            <span>
              Set times <i>::</i> TBA
            </span>
          </div>
        </header>

        <div className="wlu__board">
          {board.map((d) => {
            const scrawl = FLYER.dayLabels[d.info.day];
            return (
              <article key={d.info.day} className="wlu-day" data-day={d.info.day} aria-labelledby={`lineup-day-${d.info.day}`}>
                <header className="wlu-day__head">
                  <h3 id={`lineup-day-${d.info.day}`} className="wlu-day__label">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scrawl.src} width={scrawl.width} height={scrawl.height} alt={d.info.label} loading="lazy" decoding="async" />
                  </h3>
                  <time className="wlu-day__date" dateTime={d.info.isoDate}>
                    {d.info.weekday.slice(0, 3).toUpperCase()} {dotDate(d.info.isoDate)}
                  </time>
                  <span className="wlu-day__rule" aria-hidden="true" />
                  <span className="wlu-day__count" aria-hidden="true">
                    {pad2(d.rows.length)}
                  </span>
                </header>
                <ol className="wlu-day__list">
                  {d.rows.map((r) => (
                    <Row key={r.n} row={r} linked={linkToSelect} />
                  ))}
                  {d.rows.length < maxRows && (
                    // Closes the shorter column on the shared row grid.
                    <li className="wlu-row wlu-row--end" data-day={d.info.day} style={{ "--k": d.rows.length } as CSSProperties} aria-hidden="true">
                      <div className="wlu-row__hit">
                        <span className="wlu-row__num">--</span>
                        <span className="wlu-row__sub">
                          <span className="wlu-row__status">
                            End of day {pad2(d.info.day)}
                            <span className="wlu-row__date">
                              {" "}
                              <i>::</i> {pad2(d.named)} + {pad2(d.locked)} TBA
                            </span>
                          </span>
                        </span>
                        <span className="wlu-row__rule">
                          <svg className="wlu-row__notch" viewBox="0 0 14 5" focusable="false">
                            <path d="M0 4.5h7.5l4-4h2.5" />
                          </svg>
                          <i className="wlu-row__line" />
                        </span>
                      </div>
                    </li>
                  )}
                </ol>
              </article>
            );
          })}
          <div className="wlu__spine" aria-hidden="true">
            <span className="wlu__spine-node">
              <span className="wlu__orb" />
              <i>::</i>
              <span className="wlu__orb" />
            </span>
            <span className="wlu__spine-rail" />
          </div>
        </div>

        <footer className="wlu__foot" aria-hidden="true">
          <span className="wlu__legend">
            <i className="wlu__key" /> Confirmed <i className="wlu__key" data-tba="" /> Encrypted
          </span>
          {linkToSelect ? (
            <span className="wlu__hint">
              <span className="wlu__wide">Select a name</span>
              <span className="wlu__narrow">Tap a name</span> ▸ profile
            </span>
          ) : (
            <span className="wlu__hint">Set times :: TBA</span>
          )}
        </footer>
      </div>
      <LineupMotion rootId="lineup" />
    </section>
  );
}
