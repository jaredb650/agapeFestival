// Static HTML for the SYSTEM BOOT overlay, built once at build time (server
// only). It is a string, not JSX, because it is injected through
// dangerouslySetInnerHTML: the inline boot script mutates and finally removes
// it before (or after) React hydrates, and hydration never inspects it.
//
// Everything is CSS/SVG: the ÄGAPĒ mark is the vector from
// public/assets/winter/logos/agape-mark.svg (inlined once as a <path> in
// <defs>, reused by <use>); the counter is a 5x7 dot-matrix LCD drawn as SVG
// paths (no font, so no FOUT); text uses the HUD face (already preloaded) and
// the system mono.

/** 5x7 dot-matrix glyphs ("1" = lit pixel). */
const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "%": ["11000", "11001", "00010", "00100", "01000", "10011", "00011"],
  ghost: ["11111", "11111", "11111", "11111", "11111", "11111", "11111"],
};

/** One 4x4 square per lit pixel on a 5-unit pitch: a glyph is 24x34 units. */
const glyphPath = (rows: string[]) =>
  rows
    .map((row, y) => [...row].map((b, x) => (b === "1" ? `M${x * 5} ${y * 5}h4v4h-4z` : "")).join(""))
    .join("");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The mark's body (the umlaut dots are separate elements on top). Same coordinates as agape-mark.svg. */
const MARK_BODY = "M0 388H972L1473 849L1150 1154L1472 1463V2090H0ZM460 817V1661H1144V1152L781 817Z";
const MARK_VB = "0 0 1476 2090";
const markSvg = (cls: string) => `<svg class="${cls}" viewBox="${MARK_VB}" focusable="false"><use href="#wb-mark"/></svg>`;

export interface BootCopy {
  /** Short coordinates caption under the LCD (shown where the data window isn't). */
  coords: string;
  /** Boot log lines: [label, status]. One per readiness task, in task order. */
  log: [string, string][];
  /** Bottom-right data block rows: [key, value]. */
  data: [string, string][];
  /** Header, right ("WNTR.27"). */
  build: string;
}

export function bootMarkup({ log, data, build, coords }: BootCopy): string {
  const defs =
    `<svg class="wb-defs" width="0" height="0" focusable="false"><defs>` +
    Object.entries(GLYPHS)
      .map(([k, rows]) => `<path id="wbg${k === "ghost" ? "h" : k === "%" ? "p" : k}" d="${glyphPath(rows)}"/>`)
      .join("") +
    `<linearGradient id="wb-chrome" x1="0" y1="0" x2="0.35" y2="1">` +
    `<stop offset="0" stop-color="#f4f6f8"/><stop offset=".3" stop-color="#d3d9e0"/><stop offset=".47" stop-color="#8d96a3"/>` +
    `<stop offset=".5" stop-color="#e3e7eb"/><stop offset=".72" stop-color="#a9b1bc"/><stop offset="1" stop-color="#5a6f89"/></linearGradient>` +
    `<path id="wb-mark" fill-rule="evenodd" vector-effect="non-scaling-stroke" d="${MARK_BODY}"/>` +
    `</defs></svg>`;

  // The mark, framed by four rectangular corner brackets (no reticle: the hero owns the circle).
  // It sits just above the door seam; the title rides in the seam's notch tab below it.
  const unit =
    `<div class="wb-unit">` +
    (["tl", "tr", "bl", "br"] as const).map((c) => `<span class="wb-fr" data-c="${c}"></span>`).join("") +
    `<span class="wb-unit__tag" data-p="l">MK.01</span><span class="wb-unit__tag" data-p="r">&Auml;.CORE</span>` +
    `<div class="wb-mk">` +
    markSvg("wb-mk__ghost") +
    (["a", "b", "c", "d"] as const).map((p) => `<span class="wb-mk__p" data-p="${p}">${markSvg("")}</span>`).join("") +
    `<span class="wb-dot" data-orb data-n="1"></span><span class="wb-dot" data-orb data-n="2"></span>` +
    `</div>` +
    `</div>`;

  const lcd =
    `<div class="wb-lcd"><div class="wb-lcd__in">` +
    `<div class="wb-lcd__bar"><span class="wb-led"></span><span>PWR</span><span class="wb-lcd__rule"></span><span>SYNC</span><span class="wb-led" data-blink></span></div>` +
    `<div class="wb-lcd__scr"><svg class="wb-num" viewBox="0 0 110 34" focusable="false">` +
    `<g class="wb-num__ghost"><use href="#wbgh"/><use href="#wbgh" x="30"/><use href="#wbgh" x="60"/></g>` +
    `<g class="wb-num__lit"><use data-dg/><use data-dg x="30"/><use data-dg x="60"/></g>` +
    `<use class="wb-num__pct" href="#wbgp" transform="translate(95 13.6) scale(.6)"/></svg></div>` +
    `<div class="wb-gauge"><i class="wb-gauge__fill" data-fill></i></div>` +
    `</div></div>`;

  const pips = log.map(() => `<i class="wb-led" data-pip></i>`).join("");
  const logHtml =
    `<div class="wb-win" data-w="log">` +
    `<div class="wb-win__hd"><span><i>::</i> Boot.log <i>::</i></span><span class="wb-win__rule"></span><span>Seq.01</span></div>` +
    `<div class="wb-win__body"><ol class="wb-log">` +
    log
      .map(
        ([label, status], i) =>
          `<li data-ln style="--i:${i}"><span class="wb-log__n">0${i + 1}</span><span class="wb-log__t">${esc(label)}</span>` +
          `<span class="wb-log__d"></span><span class="wb-log__s"><i></i><b${status !== "OK" ? ' data-k="lock"' : ""}>${esc(status)}</b></span></li>`,
      )
      .join("") +
    `</ol></div>` +
    `<div class="wb-win__ft"><span class="wb-pips">${pips}</span><span class="wb-win__count"><b data-count>0</b>/${log.length}</span><span>&lt; &gt;</span><span>Tasks</span></div>` +
    `</div>`;

  const dataHtml =
    `<div class="wb-win" data-w="data">` +
    `<div class="wb-win__hd"><span>Tgt.data</span><span class="wb-win__rule"></span><span><i>::</i> Lock <i>::</i></span></div>` +
    `<div class="wb-win__body"><div class="wb-data">` +
    data.map(([k, v], i) => `<span style="--i:${i}"><i>${esc(k)}</i>${esc(v)}</span>`).join("") +
    `</div></div></div>`;

  const head =
    `<div class="wb-head"><span class="wb-led"></span><b>&Auml;GAPE</b><i>::</i><span>SYS.BOOT</span>` +
    `<span class="wb-head__rule"></span><span class="wb-head__st"><b>BOOTING</b><b>READY</b></span><span class="wb-head__rule"></span>` +
    `<span>${esc(build)}</span><i>//</i><span>CH.01</span></div>`;

  const door = (side: "t" | "b") => `<div class="wb-door" data-d="${side}"><i class="wb-door__edge"></i><i class="wb-door__face"></i></div>`;

  return (
    `<div id="wboot" class="wb">` +
    defs +
    door("b") +
    door("t") +
    `<div class="wb-core"><div class="wb-core__in">` +
    head +
    `<span class="wb-axis" data-side="l"></span><span class="wb-axis" data-side="r"></span>` +
    unit +
    `<div class="wb-title"><i>::</i><span>SYSTEM</span><span class="wb-title__v"><b>BOOT</b><b>ONLINE</b></span><i>::</i></div>` +
    `<div class="wb-below">` +
    lcd +
    `<div class="wb-coords">&#9666; <b>${esc(coords)}</b> &#9656;</div>` +
    `</div>` +
    logHtml +
    dataHtml +
    `</div></div>` +
    `<span class="wb-brk" data-c="tl"></span><span class="wb-brk" data-c="tr"></span><span class="wb-brk" data-c="bl"></span><span class="wb-brk" data-c="br"></span>` +
    `</div>`
  );
}
