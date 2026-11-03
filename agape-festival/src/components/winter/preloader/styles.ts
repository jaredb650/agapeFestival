// Critical CSS for the preloader. Inlined (minified) in front of the overlay
// markup so it paints with the very first frame: no request, no JS. Classes
// wb-*, keyframes wb-*. Classic tokens (classic.css / winter.css, on the
// .winter root the overlay sits in), each with its literal fallback: --c-ink
// ground, --c-red-line hairline (the hero divider's own red), --c-text-3
// label, --f-display (Orbitron). No glow until the line becomes the divider.
//
// Story: black, one red hairline across the hero logo's centre line that
// draws outward with real loading progress, a small "Loading" caps label
// under it. Then the hairline opens as a slit onto the logo (two black
// shutters part, the lower edge riding the hairline), keeps falling and
// narrows into the hero's 30px divider (taking on the divider's glow as it
// lands) while the black lifts. The logo copy and the hairline land exactly on
// the hero's own logo and divider, then dissolve into them.
//
// Motion: one curve (--e, a strong ease-in-out, for everything that moves or
// fades; the progress fill alone is linear, it's constant motion). Transform and
// opacity only, all on the compositor. Timings mirror Preloader.tsx CONFIG.x.

const CSS = String.raw`
.wb{
  --e:cubic-bezier(.77,0,.175,1);
  --wb-red:var(--c-red-line,#a42b2b);
  position:fixed;inset:0;z-index:1000;contain:strict;overflow:hidden;
  cursor:progress;
  /* No-JS failsafe: never covers the page for more than ~4 s. !important (with .wb's specificity)
     beats globals.css's reduced-motion "animation-delay: 0s" reset. JS removes it well before. */
  animation:wb-fs .4s 4s both!important;
}
.wb[data-exit]{pointer-events:none}
.wb i,.wb img,.wb b{position:absolute;display:block}
.wb-bg{inset:0;background:var(--c-ink,#000)}

/* The hairline runs edge to edge and fills outward from the centre with real progress. Until the script measures
   the hero logo, it sits where the deployed layout centres it. */
.wb-ln{left:0;top:calc(50% - 195px);width:100%;height:1px;transition:transform .4s var(--e)}
.wb-ln>i:first-child{inset:0;background:var(--wb-red);transform:scaleX(0);transition:transform .25s linear}
/* The hero divider's glow (0 0 14px at 40%), on its own layer: it fades in only as the line lands on the divider. */
.wb-ln>i:first-child::after{content:"";position:absolute;inset:0;box-shadow:0 0 14px rgb(164 43 43/.4);opacity:0}

/* Under the hairline: a caps label in the classic type (Orbitron 500, 12px, 0.2em). The text is CSS-generated, so
   it is never an LCP candidate. The left padding balances the tracking after the last letter. */
.wb-ld{left:50%;top:20px;transform:translateX(-50%);padding-left:.2em;font:500 12px/1 var(--f-display,var(--font-hud),sans-serif);letter-spacing:.2em;text-transform:uppercase;white-space:nowrap;color:var(--c-text-3,#7d7d7d);transition:opacity .25s var(--e)}
.wb-ld::before{content:"Loading"}
[data-exit] .wb-ld{opacity:0;transition-duration:.15s}

/* The slit: the script sets its box 1px inside the hero logo's (the art has a transparent margin), so the
   copy is never larger than the hero's own logo, the page's LCP element. */
.wb-sl{overflow:hidden;visibility:hidden}
.wb-sl img{left:-1px;top:-1px;width:calc(100% + 2px);height:calc(100% + 2px)}
.wb-sl b{inset:0 0 50%;background:var(--c-ink,#000);box-shadow:0 1px var(--wb-red);transition:transform .85s var(--e)}
.wb-sl b+b{inset:50% 0 0;box-shadow:none}
[data-slit] .wb-sl{visibility:visible}
[data-slit] .wb-sl b{transform:translateY(calc(0px - var(--o)))}
[data-slit] .wb-sl b+b{transform:translateY(var(--o))}

/* Full exit: the hairline falls into the divider (the script sets its target) and narrows, the black lifts. */
[data-exit=full] .wb-ln{transition-duration:.85s}
[data-exit=full] .wb-ln>i:first-child{transition:transform .5s var(--e) .3s}
[data-exit=full] .wb-ln>i:first-child::after{opacity:1;transition:opacity .5s var(--e) .35s}
[data-exit=full] .wb-bg{animation:wb-o .5s var(--e) .3s both}
/* Landed: the copy and the hairline dissolve into the hero's own logo and divider. */
[data-out] .wb-sl,[data-out] .wb-ln{animation:wb-o .2s var(--e) both}
/* Back/forward return, a key/click/scroll during the boot, or reduced motion: a plain fade. */
.wb[data-exit=quick],.wb[data-exit=fade]{animation:wb-o .3s var(--e) both!important}
[data-fast] .wb-ln{visibility:hidden}

@media (max-width:600px){
  .wb-ln{top:calc(50% - 176px)}
}
@media (prefers-reduced-motion:no-preference){
  .wb-ld{animation:wb-i .5s var(--e) .15s both}
  /* No JS: the hairline still fills, on a timer. */
  .wb:not([data-js]) .wb-ln>i:first-child{animation:wb-g 2.4s var(--e) .2s both}
}
@media (prefers-reduced-motion:reduce){
  .wb .wb-ln>i:first-child{transform:none}
}
@keyframes wb-fs{to{opacity:0;visibility:hidden}}
@keyframes wb-o{to{opacity:0}}
@keyframes wb-i{from{opacity:0}}
@keyframes wb-g{to{transform:none}}
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
