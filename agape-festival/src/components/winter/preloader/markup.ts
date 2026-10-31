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

/** SVG arc, angles in degrees clockwise from 12 o'clock, centre (100, 100). */
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(100 + r * Math.cos(t)).toFixed(2)} ${(100 + r * Math.sin(t)).toFixed(2)}`;
  };
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The mark's body (the dots are glass orbs on top). Same coordinates as agape-mark.svg. */
const MARK_BODY = "M0 388H972L1473 849L1150 1154L1472 1463V2090H0ZM460 817V1661H1144V1152L781 817Z";
const MARK_VB = "0 0 1476 2090";
const markSvg = (cls: string) => `<svg class="${cls}" viewBox="${MARK_VB}" focusable="false"><use href="#wb-mark"/></svg>`;

export interface BootCopy {
  /** Short coordinates caption under the LCD (shown where the data window isn't). */
  coords: string;
  /** Vertical microtext down the left margin. */
  vtext: string;
  /** Boot log lines: [label, status]. One per readiness task, in task order. */
  log: [string, string][];
  /** Bottom-right data block rows: [key, value]. */
  data: [string, string][];
  /** Header, right ("WNTR.27"). */
  build: string;
}

export function bootMarkup({ log, data, build, vtext, coords }: BootCopy): string {
  const defs =
    `<svg class="wb-defs" width="0" height="0" focusable="false"><defs>` +
    Object.entries(GLYPHS)
      .map(([k, rows]) => `<path id="wbg${k === "ghost" ? "h" : k === "%" ? "p" : k}" d="${glyphPath(rows)}"/>`)
      .join("") +
    `<linearGradient id="wb-chrome" x1="0" y1="0" x2="0.35" y2="1">` +
    `<stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#d9e1ea"/><stop offset=".47" stop-color="#8d98a8"/>` +
    `<stop offset=".5" stop-color="#eef2f6"/><stop offset=".72" stop-color="#aeb7c3"/><stop offset="1" stop-color="#5a6f89"/></linearGradient>` +
    `<path id="wb-mark" fill-rule="evenodd" vector-effect="non-scaling-stroke" d="${MARK_BODY}"/>` +
    `</defs></svg>`;

  const segs = Array.from({ length: 8 }, (_, k) => `<path data-seg style="--k:${k}" d="${arc(86, k * 45 + 3, (k + 1) * 45 - 3)}"/>`).join("");
  const ring =
    `<div class="wb-ring">` +
    `<svg class="wb-ring__base" viewBox="0 0 200 200" focusable="false">` +
    `<circle class="wb-r-o" cx="100" cy="100" r="99"/><circle class="wb-r-i" cx="100" cy="100" r="72"/>` +
    `<path class="wb-r-x" d="M100 -9v13M100 196v13M-9 100h13M196 100h13"/><path class="wb-r-pip" d="M96 7h8l-4 6z"/>` +
    `<g class="wb-r-seg">${segs}</g></svg>` +
    `<div class="wb-ring__spin" data-l="ticks"><svg viewBox="0 0 200 200" focusable="false">` +
    `<circle class="wb-r-t" cx="100" cy="100" r="93"/><circle class="wb-r-t wb-r-t--maj" cx="100" cy="100" r="93"/></svg></div>` +
    `<div class="wb-ring__spin" data-l="arcs"><svg viewBox="0 0 200 200" focusable="false">` +
    [arc(79, 18, 68), arc(79, 108, 158), arc(79, 198, 248), arc(79, 288, 338)].map((d) => `<path class="wb-r-a" d="${d}"/>`).join("") +
    [arc(79, 82, 98), arc(79, 262, 278)].map((d) => `<path class="wb-r-a wb-r-a--hot" d="${d}"/>`).join("") +
    `</svg></div>` +
    `<div class="wb-mk">` +
    markSvg("wb-mk__ghost") +
    `<span class="wb-mk__rgb" data-c="b">${markSvg("")}</span><span class="wb-mk__rgb" data-c="r">${markSvg("")}</span>` +
    (["a", "b", "c", "d"] as const).map((p) => `<span class="wb-mk__p" data-p="${p}">${markSvg("")}</span>`).join("") +
    `<span class="wb-mk__flash">${markSvg("")}</span>` +
    `<span class="wb-mk__laser"></span>` +
    `<span class="wb-orb" data-orb data-n="1"></span><span class="wb-orb" data-orb data-n="2"></span>` +
    `</div>` +
    `<span class="wb-call" data-p="ne"><i></i>&Auml;.CORE <b>&#9656; LIT</b></span>` +
    `<span class="wb-call" data-p="sw"><i></i>PLATE &times;4 <b>LOCK</b></span>` +
    `</div>`;

  const lcd =
    `<div class="wb-lcd"><div class="wb-lcd__in">` +
    `<div class="wb-lcd__bar"><span class="wb-led"></span><span>PWR</span><span class="wb-lcd__rule"></span><span>SYNC</span><span class="wb-led" data-blink></span></div>` +
    `<svg class="wb-num" viewBox="0 0 110 34" focusable="false">` +
    `<g class="wb-num__ghost"><use href="#wbgh"/><use href="#wbgh" x="30"/><use href="#wbgh" x="60"/></g>` +
    `<g class="wb-num__lit"><use data-dg/><use data-dg x="30"/><use data-dg x="60"/></g>` +
    `<use class="wb-num__pct" href="#wbgp" transform="translate(95 13.6) scale(.6)"/></svg>` +
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
    `<span>${esc(build)}</span><i>//</i><span>CH.01</span><span class="wb-led" data-blink></span></div>`;

  const door = (side: "t" | "b") => `<div class="wb-door" data-d="${side}"><i class="wb-door__edge"></i><i class="wb-door__face"></i></div>`;
  // Glitch tears: [top %, height px, shift %, left %, width %]
  const bars = [
    [17, 2, -7, 8, 62],
    [33, 6, 5, 30, 58],
    [46, 1, -12, 0, 100],
    [58, 4, 9, 18, 44],
    [74, 3, -4, 46, 50],
    [86, 1, 6, 4, 70],
  ]
    .map(([y, h, x, l, w]) => `<i style="--y:${y}%;--h:${h}px;--x:${x}%;--l:${l}%;--w:${w}%"></i>`)
    .join("");

  return (
    `<div id="wboot" class="wb">` +
    defs +
    door("b") +
    door("t") +
    `<div class="wb-core"><div class="wb-core__in">` +
    `<span class="wb-sweep"></span>` +
    head +
    `<span class="wb-ruler" data-side="l"></span><span class="wb-ruler" data-side="r"></span>` +
    `<span class="wb-vtext">${esc(vtext)}</span>` +
    `<div class="wb-stack">` +
    ring +
    `<div class="wb-title"><i>::</i><span>SYSTEM</span><span class="wb-title__v"><b>BOOT</b><b>ONLINE</b></span><i>::</i></div>` +
    lcd +
    `<div class="wb-coords">&#9666; <b>${esc(coords)}</b> &#9656;</div>` +
    `</div>` +
    logHtml +
    dataHtml +
    `</div></div>` +
    `<span class="wb-brk" data-c="tl"></span><span class="wb-brk" data-c="tr"></span><span class="wb-brk" data-c="bl"></span><span class="wb-brk" data-c="br"></span>` +
    `<div class="wb-fx"><span class="wb-bloom"></span><span class="wb-seam"></span>${bars}</div>` +
    `</div>`
  );
}
