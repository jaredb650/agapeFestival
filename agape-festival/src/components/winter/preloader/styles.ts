// Critical CSS for the preloader. Inlined (minified) in front of the overlay
// markup so it paints with the very first frame: no request, no JS. Classes
// wb-*, keyframes wb-*. Self-contained colours (the deployed site's): #000
// ground, #a42b2b hairline with the divider's own 0 0 14px #a42b2b66, #ffffff35
// ticks. No gradients, no circles; the only text is a small CSS-generated "Loading".
//
// Story: black, the hero frame's corner ticks, and one red hairline across the
// hero logo's centre line that draws outward with real loading progress. Then
// the hairline opens as a slit onto the logo (two black shutters part, the
// lower edge riding the hairline), keeps falling and narrows into the hero's
// 30px divider while the black lifts. The logo copy and the hairline land
// exactly on the hero's own logo and divider, then dissolve into them.
//
// Motion: one curve (--e, a strong ease-in-out, for everything that moves or
// fades; the progress fill alone is linear, it's constant motion). Transform and
// opacity only, all on the compositor. Timings mirror Preloader.tsx CONFIG.x.

const CSS = String.raw`
.wb{
  --e:cubic-bezier(.77,0,.175,1);
  --w:min(100vw - 48px,510px,60svh);
  position:fixed;inset:0;z-index:1000;contain:strict;overflow:hidden;
  cursor:progress;
  /* No-JS failsafe: never covers the page for more than ~4 s. !important (with .wb's specificity)
     beats globals.css's reduced-motion "animation-delay: 0s" reset. JS removes it well before. */
  animation:wb-fs .4s 4s both!important;
}
.wb[data-exit]{pointer-events:none}
.wb i,.wb img,.wb b{position:absolute;display:block}
.wb-bg{inset:0;background:#000}

/* The hero frame's corner ticks (deployed .winter-frame: 25px in, 13px, #ffffff35). */
.wb-k{inset:25px}
.wb-k i{width:13px;height:13px;border:0 solid #ffffff35}
.wb-k i:nth-child(-n+2){top:0;border-top-width:1px}
.wb-k i:nth-child(n+3){bottom:0;border-bottom-width:1px}
.wb-k i:nth-child(odd){left:0;border-left-width:1px}
.wb-k i:nth-child(even){right:0;border-right-width:1px}

/* The hairline runs edge to edge and fills outward from the centre with real progress. Until the script measures
   the hero logo, it sits where the deployed layout centres it. */
.wb-ln{left:0;top:calc(50% - 195px);width:100%;height:1px;transition:transform .4s var(--e)}
.wb-ln>i:first-child{inset:0;background:#a42b2b;box-shadow:0 0 14px #a42b2b66;transform:scaleX(0);transition:transform .25s linear}

/* Under the hairline: LOADING with its dots appearing one at a time, then the small Ä mark glowing red. */
.wb-ld{left:50%;top:22px;display:flex!important;flex-direction:column;align-items:center;gap:16px;transform:translateX(-50%);transition:opacity .25s var(--e)}
.wb .wb-ld i,.wb .wb-ld b{position:static}
.wb-tx{display:flex!important;align-items:baseline;font:400 9px/1 var(--font-hud),sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#a6a6a6;white-space:nowrap;padding-left:.32em}
.wb-tx::before{content:"Loading"}
.wb-tx b{display:inline-block!important;width:.62em;text-align:left;letter-spacing:0;opacity:0}
.wb-tx b::before{content:"."}
.wb-mk{width:15px;height:21px;filter:drop-shadow(0 0 6px #e52424aa)}
.wb-mk svg{display:block;width:100%;height:100%}
[data-exit] .wb-ld{opacity:0;transition-duration:.15s}

/* The slit: the script sets its box 1px inside the hero logo's (the art has a transparent margin), so the
   copy is never larger than the hero's own logo, the page's LCP element. */
.wb-sl{overflow:hidden;visibility:hidden}
.wb-sl img{left:-1px;top:-1px;width:calc(100% + 2px);height:calc(100% + 2px)}
.wb-sl b{inset:0 0 50%;background:#000;box-shadow:0 1px #a42b2b;transition:transform .85s var(--e)}
.wb-sl b+b{inset:50% 0 0;box-shadow:none}
[data-slit] .wb-sl{visibility:visible}
[data-slit] .wb-sl b{transform:translateY(calc(0px - var(--o)))}
[data-slit] .wb-sl b+b{transform:translateY(var(--o))}

/* Full exit: the hairline falls into the divider (the script sets its target) and narrows, the black lifts. */
[data-exit=full] .wb-ln{transition-duration:.85s}
[data-exit=full] .wb-ln>i:first-child{transition:transform .5s var(--e) .3s}
[data-exit=full] .wb-bg,[data-exit=full] .wb-k{animation:wb-o .5s var(--e) .3s both}
/* Landed: the copy and the hairline dissolve into the hero's own logo and divider. */
[data-out] .wb-sl,[data-out] .wb-ln{animation:wb-o .2s var(--e) both}
/* Back/forward return, a key/click/scroll during the boot, or reduced motion: a plain fade. */
.wb[data-exit=quick],.wb[data-exit=fade]{animation:wb-o .3s var(--e) both!important}
[data-fast] .wb-k,[data-fast] .wb-ln{visibility:hidden}

@media (max-width:600px){
  .wb{--w:min(100vw - 60px,510px,60svh)}
  .wb-k{inset:16px}
  .wb-ln{top:calc(50% - 176px)}
}
@media (prefers-reduced-motion:no-preference){
  .wb-k{animation:wb-i .6s var(--e) both}
  .wb-ld{animation:wb-i .5s var(--e) .15s both}
  .wb-tx b{animation:wb-d1 1.6s steps(1,end) infinite}
  .wb-tx b+b{animation-name:wb-d2}
  .wb-tx b+b+b{animation-name:wb-d3}
  .wb-mk{animation:wb-gl 1.6s ease-in-out infinite alternate}
  /* No JS: the hairline still fills, on a timer. */
  .wb:not([data-js]) .wb-ln>i:first-child{animation:wb-g 2.4s var(--e) .2s both}
}
@media (prefers-reduced-motion:reduce){
  .wb .wb-ln>i:first-child{transform:none}
  .wb-tx b{opacity:1}
}
@keyframes wb-fs{to{opacity:0;visibility:hidden}}
@keyframes wb-o{to{opacity:0}}
@keyframes wb-i{from{opacity:0}}
@keyframes wb-g{to{transform:none}}
@keyframes wb-d1{0%{opacity:0}25%{opacity:1}}
@keyframes wb-d2{0%{opacity:0}50%{opacity:1}}
@keyframes wb-d3{0%{opacity:0}75%{opacity:1}}
@keyframes wb-gl{from{opacity:.55}}
`;

/**
 * Parks the hero + nav CSS intros under the preloader so they play from the handover. A separate sheet the
 * boot script inserts (only with JS, motion allowed, first visit) and removes at the handover: nothing is set
 * on React-owned elements (no hydration mismatch), and the rules only exist during the boot. The logo is held
 * in its FINAL state rather than paused on a hidden first keyframe, so it paints (it is the LCP element) under
 * the overlay; any entrance it has replays at the handover, under the preloader's copy.
 */
const HOLD = String.raw`
#hero *,#hero *::before,#hero *::after,
header.whud *,header.whud *::before,header.whud *::after{animation-play-state:paused!important}
#hero [data-boot-logo],#hero .winter-logo,#hero .wh__logo{animation:none!important}
`;

/** Comments out, whitespace collapsed (never around ":", which would join descendant + pseudo selectors). */
const minify = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/@media \(/g, "@media(")
    .trim();

export const BOOT_CSS = minify(CSS);
export const HOLD_CSS = minify(HOLD);
