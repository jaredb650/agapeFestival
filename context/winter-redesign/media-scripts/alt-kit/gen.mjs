// usage: node gen.mjs <festival red-hybrid.css out> <theme cyber.css out> <a node_modules dir with postcss>
// Builds the two stylesheets of the alternate kit from src-css/*.css (written with the
// c9688b5 blue literals and --rhk-* token refs, rhk- class prefix):
//   1. festival: <wt>/agape-festival/src/components/alt/red-hybrid/red-hybrid.css
//      every selector scoped under .rhk, tokens on .rhk (red-hybrid values) and
//      .rhk[data-palette="blue"] (the original c9688b5 values).
//   2. theme:    <out>/styles/cyber.css for ~/code/liveSeshFLyer/red-hybrid-theme
//      unscoped (the theme's convention: prefixed classes, tokens on .winter), wcy- prefix,
//      --w-* tokens from tokens/tokens.css, add-on tokens --wcy-* on .winter + .wcy-blue.
// Every non-neutral colour literal becomes a token: blue = the literal, red = the mapping
// e88ce36 applied (ice -> #a42b2b, volt -> #8b0000 / rgba(200,0,0,a*.6), cold greys ->
// neutral greys of the same luminance, saturated blues -> their warm mirror).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const [, , festivalOut, themeOut, nodeModules] = process.argv;
const require = createRequire(path.join(nodeModules, "x.js"));
const postcss = require("postcss");

const SRC = path.join(path.dirname(new URL(import.meta.url).pathname), "src-css");
const parts = fs.readdirSync(SRC).filter((f) => /^\d\d-.*\.css$/.test(f) && !f.includes(".raw.")).sort();
const source = parts.map((f) => `/* ---- ${f.replace(/^\d\d-|\.css$/g, "")} ---- */\n` + fs.readFileSync(path.join(SRC, f), "utf8")).join("\n");

// ---------------------------------------------------------------- colour tokens
const hex2 = (n) => n.toString(16).padStart(2, "0");
const toHex = ([r, g, b]) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (y) => Math.round(255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055));
const neutral = ([r, g, b]) => {
  const v = unlin(0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b));
  return [v, v, v];
};

/** Semantic tokens: rgb triplet -> [name, red value]. Blue value = the literal. */
const SEMANTIC = new Map([
  ["156,200,255", ["ice", "#a42b2b"]],
  ["61,107,255", ["volt", "#8b0000"]],
  ["233,235,236", ["frost", "#fff"]],
  ["4,6,10", ["ink", "#000"]],
  ["90,111,137", ["steel-blue", "#5c5c5c"]],
  ["30,59,184", ["volt-deep", "#5a0000"]],
  ["214,232,255", ["pale", "#e6e6e6"]],
  ["110,170,255", ["sky", "#a42b2b"]],
  ["120,200,255", ["cyan", "#fff"]],
  ["80,210,255", ["cyan-2", "#fff"]],
  ["207,230,255", ["orb-hi", "#e3e3e3"]],
  ["122,184,255", ["orb-mid", "#a42b2b"]],
  ["47,98,255", ["orb-lo", "#8b0000"]],
  ["13,42,153", ["orb-rim", "#990d0d"]],
]);
/** Translucent volt went to rgba(200,0,0,a*.6) in e88ce36: mixing that base keeps it exact. */
const VOLT_GLASS = ["volt-glass", "rgba(200, 0, 0, 0.6)", "#3d6bff"];
const OVERRIDES = new Map([["20,32,54", "#1f1f1f"]]);

const tokens = new Map(); // name -> { blue, red }
function tokenFor(rgb, translucent) {
  const key = rgb.join(",");
  if (key === "61,107,255" && translucent) {
    tokens.set(VOLT_GLASS[0], { blue: VOLT_GLASS[2], red: VOLT_GLASS[1] });
    return VOLT_GLASS[0];
  }
  const sem = SEMANTIC.get(key);
  if (sem) {
    if (!["ice", "volt", "frost", "ink", "steel-blue", "volt-deep"].includes(sem[0]) || true) tokens.set(sem[0], { blue: toHex(rgb), red: sem[1] });
    return sem[0];
  }
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let name;
  let red;
  if (OVERRIDES.has(key)) {
    name = `g-${toHex(rgb).slice(1)}`;
    red = OVERRIDES.get(key);
  } else if (max < 40 || (max - min) / max <= 0.5) {
    name = `g-${toHex(rgb).slice(1)}`;
    red = toHex(neutral(rgb));
  } else {
    name = `b-${toHex(rgb).slice(1)}`;
    red = toHex([b, r, r]);
  }
  tokens.set(name, { blue: toHex(rgb), red });
  return name;
}

const COLOR = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g;
function convertValue(value, prefix) {
  return value.replace(COLOR, (m, hex, r, g, b, a) => {
    let rgb;
    if (hex) {
      const h = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
      rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    } else rgb = [r, g, b].map(Number);
    const alpha = a === undefined ? 1 : Number(a);
    if (rgb[0] === rgb[1] && rgb[1] === rgb[2]) return m; // pure neutral: same in both palettes
    if (rgb[0] > rgb[2]) return m; // warm (the red/cyan split's red, the roster's P2 crimson): same in both
    const name = tokenFor(rgb, alpha < 1);
    const ref = `var(${prefix}${name})`;
    if (alpha >= 1) return ref;
    const pct = +(alpha * 100).toFixed(2);
    return `color-mix(in srgb, ${ref} ${pct}%, transparent)`;
  });
}

// ---------------------------------------------------------------- token blocks
const RED = {
  ink: "#000", deep: "#0b0b0b", steel: "#1f1f1f", fog: "#777", mist: "#a6a6a6", frost: "#fff",
  "steel-blue": "#5c5c5c", ice: "#a42b2b", volt: "#8b0000", "volt-deep": "#5a0000",
  glow: "rgba(164, 43, 43, 0.4)", line: "rgba(255, 255, 255, 0.08)", "line-strong": "rgba(255, 255, 255, 0.18)",
  bracket: "#ffffff35", "bracket-accent": "#ff2a2a99", "accent-line": "#a42b2b", "ice-text": "#e52424",
};
const BLUE = {
  ink: "#04060a", deep: "#1b212c", steel: "#313743", fog: "#737c8b", mist: "#a7afba", frost: "#e9ebec",
  "steel-blue": "#5a6f89", ice: "#9cc8ff", volt: "#3d6bff", "volt-deep": "#1e3bb8",
  glow: "rgba(61, 107, 255, 0.45)", line: "rgba(233, 235, 236, 0.08)", "line-strong": "rgba(233, 235, 236, 0.18)",
  bracket: "rgba(233, 235, 236, 0.34)", "bracket-accent": "rgba(156, 200, 255, 0.85)",
  "accent-line": "linear-gradient(90deg, #9cc8ff 0%, #3d6bff 100%)", "ice-text": "#9cc8ff",
};
const SHARED = {
  "font-display": "var(--font-display, var(--font-hud, var(--font-orbitron, sans-serif))), sans-serif",
  "font-hud": "var(--font-hud, var(--font-orbitron, sans-serif)), sans-serif",
  "font-body": "var(--font-body, var(--font-outfit, var(--font-ui, system-ui))), system-ui, sans-serif",
  "font-pixel": "var(--font-pixel, monospace), monospace",
  "fs-lead": "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", "fs-body": "1rem", "fs-small": "0.875rem",
  "fs-micro": "0.6875rem", "fs-nano": "0.5625rem",
  "s-1": "4px", "s-2": "8px", "s-3": "12px", "s-4": "16px", "s-5": "24px", "s-6": "32px", "s-7": "48px", "s-8": "64px",
  gutter: "clamp(16px, 4vw, 48px)",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)", "ease-io": "cubic-bezier(0.65, 0, 0.35, 1)",
  "dur-fast": "0.18s", dur: "0.3s", "dur-slow": "0.6s",
};
/** Names the theme's tokens/tokens.css already defines (as --w-*). */
const THEME_HAS = new Set([
  "ink", "deep", "steel", "fog", "mist", "frost", "steel-blue", "ice", "volt", "volt-deep", "glow", "line", "line-strong",
  "bracket", "bracket-accent", "font-display", "font-hud", "font-body", "font-pixel", "fs-lead", "fs-body", "fs-small",
  "fs-micro", "fs-nano", "s-1", "s-2", "s-3", "s-4", "s-5", "s-6", "s-7", "s-8", "gutter", "ease", "ease-io", "dur-fast", "dur", "dur-slow",
]);

function build(prefix, { scope, classPrefix }) {
  tokens.clear();
  const root = postcss.parse(source);
  root.walkDecls((d) => {
    d.value = convertValue(d.value, prefix);
    // Text set in ice became --w-red-hi in e88ce36 (the line red #a42b2b is never text): a text-only token.
    if (d.prop === "color") d.value = d.value.replace(/var\(--rhk-ice\)/g, "var(--rhk-ice-text)");
  });
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    if (scope) rule.selectors = rule.selectors.map((s) => (/^\.rhk(?![-\w])/.test(s) ? s : `.rhk ${s}`));
  });
  let css = root.toString();
  return { css, tokens: new Map(tokens) };
}

const decl = (name, value) => `  ${name}: ${value};`;

// ---- festival
{
  const { css, tokens: t } = build("--rhk-", { scope: true });
  const used = new Set([...css.matchAll(/var\(--rhk-([\w-]+)/g)].map((m) => m[1]));
  const red = [];
  const blue = [];
  for (const [k, v] of Object.entries(SHARED)) red.push(decl(`--rhk-${k}`, v));
  for (const k of Object.keys(RED)) {
    red.push(decl(`--rhk-${k}`, RED[k]));
    blue.push(decl(`--rhk-${k}`, BLUE[k]));
  }
  for (const [k, v] of [...t].sort()) {
    if (k in RED) continue;
    red.push(decl(`--rhk-${k}`, v.red));
    blue.push(decl(`--rhk-${k}`, v.blue));
  }
  const defined = new Set([...Object.keys(SHARED), ...Object.keys(RED), ...t.keys()]);
  const missing = [...used].filter((u) => !defined.has(u));
  if (missing.length) throw new Error("undefined tokens: " + missing.join(", "));
  const head = `/* ==========================================================================
   ÄGAPĒ RED HYBRID ALT KIT — the blue HUD build's cyber frames + chrome
   (branch winter-redesign @ c9688b5, the last state before e88ce36 simplified
   it into red-hybrid), re-tokened so it renders in the red-hybrid palette.

   GENERATED by context/winter-redesign/media-scripts/alt-kit/gen.mjs from the
   per-piece sources in src-css/ next to it (edit those, then re-run). Opt-in
   only: nothing outside src/components/alt/red-hybrid and the gated
   /kit/red-hybrid showcase imports it.

   Scope: every selector sits under .rhk (render <RedHybridKit> around the
   pieces), every class is rhk-*, every keyframe rhk-*, every token --rhk-*.
   Palette: .rhk = red hybrid (the legacy ice/volt names mapped to red, as
   e88ce36 did); .rhk[data-palette="blue"] = the original c9688b5 blues.
   Colour literals became tokens: --rhk-g-<hex> = a cold grey (red: the
   neutral grey of the same luminance), --rhk-b-<hex> = a saturated blue
   (red: its warm mirror), both named after the original blue hex.
   ========================================================================== */

.rhk {
${red.join("\n")}
}
.rhk[data-palette="blue"] {
${blue.join("\n")}
}
.rhk { color: var(--rhk-frost); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.rhk ::selection { background: var(--rhk-volt); color: var(--rhk-frost); }

`;
  fs.mkdirSync(path.dirname(festivalOut), { recursive: true });
  fs.writeFileSync(festivalOut, head + css.replace(/\n{3,}/g, "\n\n"));
  console.log("festival:", festivalOut, (head + css).length, "bytes,", t.size, "colour tokens");
}

// ---- theme
{
  const { css: raw, tokens: t } = build("--rhk-", { scope: false });
  // token refs: --rhk-x -> --w-x when the theme has it, else --wcy-x
  let css = raw.replace(/--rhk-([\w-]+)/g, (m, k) => (THEME_HAS.has(k) ? `--w-${k}` : `--wcy-${k}`));
  css = css.replace(/\brhk-/g, "wcy-").replace(/\.rhk\b(?!-)/g, ".winter");
  const winter = [];
  const blue = [];
  winter.push(decl("--wcy-accent-line", "var(--w-red-line)"), decl("--wcy-ice-text", "var(--w-red-hi)"));
  blue.push(decl("--wcy-accent-line", BLUE["accent-line"]), decl("--wcy-ice-text", BLUE["ice-text"]));
  for (const k of Object.keys(RED)) if (THEME_HAS.has(k)) blue.push(decl(`--w-${k}`, BLUE[k]));
  for (const [k, v] of [...t].sort()) {
    if (THEME_HAS.has(k)) continue;
    winter.push(decl(`--wcy-${k}`, v.red));
    blue.push(decl(`--wcy-${k}`, v.blue));
  }
  const used = new Set([...css.matchAll(/var\(--wcy-([\w-]+)/g)].map((m) => m[1]));
  const defined = new Set(["accent-line", "ice-text", ...[...t.keys()].filter((k) => !THEME_HAS.has(k))]);
  const missing = [...used].filter((u) => !defined.has(u));
  if (missing.length) throw new Error("theme: undefined tokens: " + missing.join(", "));
  const head = `/* ==========================================================================
   CYBER ADD-ON — the blue HUD build's cyber frames + chrome (agapeFestival
   branch winter-redesign @ c9688b5, the state before e88ce36 simplified it
   into this red-hybrid theme). See components/cyber/README.md.

   Conventions as THEME.md §9: classes wcy-*, keyframes wcy-*, unlayered,
   tokens on .winter. The legacy --w-ice / --w-volt / --w-steel-blue names
   resolve to red through tokens/tokens.css, so the pieces render red here.
   Add-on tokens (--wcy-*) are defined below on .winter. Put className
   "wcy-blue" on any wrapper (or use <CyberScope palette="blue">) to get the
   original c9688b5 blues back inside it.
   --wcy-g-<hex> = a cold grey (red: the neutral grey of the same luminance),
   --wcy-b-<hex> = a saturated blue (red: its warm mirror), both named after
   the original blue hex. Generated by agapeFestival (branch classic-alt-kit)
   context/winter-redesign/media-scripts/alt-kit/gen.mjs, which also builds
   the festival copy (src/components/alt/red-hybrid/red-hybrid.css).
   ========================================================================== */

.winter {
${winter.join("\n")}
}
.wcy-blue {
${blue.join("\n")}
}

`;
  fs.mkdirSync(path.dirname(themeOut), { recursive: true });
  fs.writeFileSync(themeOut, head + css.replace(/\n{3,}/g, "\n\n"));
  console.log("theme:", themeOut, (head + css).length, "bytes");
}
