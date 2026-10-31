// Critical CSS for the SYSTEM BOOT overlay. Inlined (minified) in front of the
// overlay markup so it paints with the very first frame, with no request and
// no JS. Classes wb-*, keyframes wb-*.
//
// Look: the site's own palette, not a blue wash. The ground is the flyer's ink
// with a faint deep-steel lift; frost hairlines at the hero HUD's strengths
// (.14 / .30 / .34); ice only on small accents (bracket knees, LEDs, the LCD
// digits, log statuses, the seam). No reticle: the hero owns the circle, so the
// mark sits in rectangular corner brackets on the door seam, and the title
// rides in the seam's notch tab (the nav notch's language).
//
// Perf contract: every animation is transform/opacity (plus a stepped clip on
// two tiny text rows). No filters, no blend modes, no backdrop-filter. The two
// door panels are pre-promoted (they carry the exit); everything else promotes
// only while it animates. The overlay is removed from the DOM after the exit.
//
// Timeline (from first paint, done by ~0.85 s): brackets, header and seam
// rulers settle 0–0.6 s; the mark's ghost outline shows, then its four plates
// ease together 0.14–0.85 s; title, LCD and log rows fade up alongside. JS
// lights the umlaut dots (50 % / 100 %), the gauge and the log statuses from
// real readiness. Exit (data-exit="full"): the content stows (fade + slight
// scale), the seam brightens, the hatch doors glide apart and the page's intro
// starts under them.

const CSS = String.raw`
.wb-defs{position:absolute;width:0;height:0;overflow:hidden}
.wb{
  --wb-ice:#9cc8ff;--wb-frost:#e9ebec;--wb-mist:#a7afba;--wb-fog:#737c8b;
  --wb-line:rgba(233,235,236,.14);--wb-line-hi:rgba(233,235,236,.3);--wb-bracket:rgba(233,235,236,.34);
  --wb-e:cubic-bezier(0.16,1,0.3,1);
  --wb-io:cubic-bezier(0.65,0,0.35,1);
  --wb-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  --wb-hud:var(--font-hud,ui-sans-serif),ui-sans-serif,system-ui,sans-serif;
  --wb-mk:min(184px,22svh,40vw);
  --wb-tab:min(380px,64vw);
  --wb-nd:18px;
  position:fixed;inset:0;z-index:1000;
  contain:strict;overflow:hidden;
  color:var(--wb-mist);
  font:400 11px/1 var(--wb-mono);
  letter-spacing:.06em;text-transform:uppercase;
  -webkit-font-smoothing:antialiased;
  -webkit-user-select:none;user-select:none;
  cursor:progress;
  /* No-JS failsafe: never covers the page for more than ~4 s. JS removes it well before.
     !important (with .wb's specificity) beats globals.css's reduced-motion "animation-duration: .01ms" reset. */
  animation:wb-failsafe .4s ease 4s both!important;
}
.wb[data-exit]{pointer-events:none}

/* ---- Hatch doors: the boot screen's background, split along the centre notch ---- */
.wb-door{position:absolute;inset:0;will-change:transform}
.wb-door[data-d="b"]{z-index:1}
.wb-door[data-d="t"]{z-index:2}
.wb-door__face,.wb-door__edge{position:absolute;inset:0}
.wb-door__face{
  background:
    radial-gradient(130% 95% at 50% 46%,transparent 40%,rgba(0,0,0,.6) 100%),
    repeating-linear-gradient(0deg,rgba(4,6,10,.26) 0 1px,transparent 1px 3px),
    linear-gradient(rgba(233,235,236,.018) 1px,transparent 1px) calc(50% - 32px) calc(50% - 32px)/64px 64px,
    linear-gradient(90deg,rgba(233,235,236,.018) 1px,transparent 1px) calc(50% - 32px) calc(50% - 32px)/64px 64px,
    radial-gradient(64% 54% at 50% 42%,rgba(49,55,67,.34),rgba(27,33,44,.2) 50%,transparent 78%),
    #04060a;
}
.wb-door__edge{background:var(--wb-ice);opacity:.16}
.wb-door[data-d="t"] .wb-door__face,.wb-door[data-d="t"] .wb-door__edge{
  clip-path:polygon(0 0,100% 0,100% 50%,calc(50% + var(--wb-tab)/2 + var(--wb-nd)) 50%,calc(50% + var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% - var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% - var(--wb-tab)/2 - var(--wb-nd)) 50%,0 50%);
}
.wb-door[data-d="b"] .wb-door__face,.wb-door[data-d="b"] .wb-door__edge{
  clip-path:polygon(0 50%,calc(50% - var(--wb-tab)/2 - var(--wb-nd)) 50%,calc(50% - var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% + var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% + var(--wb-tab)/2 + var(--wb-nd)) 50%,100% 50%,100% 100%,0 100%);
}
/* The edge is the same shape nudged 1px across the seam: it peeks out as a hairline that traces the notch. */
.wb-door[data-d="t"] .wb-door__edge{transform:translateY(1px)}
.wb-door[data-d="b"] .wb-door__edge{transform:translateY(-1px)}

/* ---- Core (everything that stows on exit) ---- */
.wb-core{position:absolute;inset:0;z-index:3}
/* No scanline overlay on the content: like the hero, the chrome mark sits clean over a scanlined ground. */
.wb-core__in{position:absolute;inset:0}

/* Header bar */
.wb-head{position:absolute;top:20px;left:32px;right:32px;height:24px;display:flex;align-items:center;gap:10px;font:700 9px/1 var(--wb-hud);letter-spacing:.32em;color:var(--wb-mist);white-space:nowrap}
.wb-head b{color:var(--wb-frost);font-weight:800}
.wb-head i{font-style:normal;color:rgba(156,200,255,.45)}
.wb-head__rule{flex:1;height:1px;min-width:12px;background:linear-gradient(90deg,rgba(233,235,236,.22),rgba(233,235,236,.05))}
.wb-head__rule+.wb-head__st+.wb-head__rule{background:linear-gradient(270deg,rgba(233,235,236,.22),rgba(233,235,236,.05))}
.wb-head__st{position:relative;display:grid;color:var(--wb-ice)}
.wb-head__st b{grid-area:1/1;color:inherit;font-weight:700;text-align:center}
.wb-head__st b+b,.wb-title__v b+b{opacity:0}
.wb[data-ready] .wb-head__st b:first-child,.wb[data-ready] .wb-title__v b:first-child{opacity:0}
.wb[data-ready] .wb-head__st b+b,.wb[data-ready] .wb-title__v b+b{opacity:1}

/* Glass LEDs (the hero LCD's orb) */
.wb-led{position:relative;flex:none;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 34% 30%,rgba(233,235,236,.5) 0 12%,#4a5566 32%,#1b212c 72%,#0b0e14 100%);box-shadow:inset 0 0 0 1px rgba(4,6,10,.7)}
.wb-led::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff 0 10%,#cfe6ff 22%,#7ab8ff 44%,#2f62ff 74%,#0d2a99 100%);box-shadow:0 0 4px rgba(110,170,255,.55)}

/* Seam rulers: tick scales along the door seam, fading outward (the hero's axis lines) */
.wb-axis{position:absolute;top:calc(50% - 6px);height:6px;width:min(24vw,320px)}
.wb-axis[data-side="l"]{right:calc(50% + var(--wb-tab)/2 + var(--wb-nd) + 14px);transform-origin:100% 50%;
  background:repeating-linear-gradient(270deg,var(--wb-line-hi) 0 1px,transparent 1px 32px) 0 100%/100% 6px no-repeat,repeating-linear-gradient(270deg,var(--wb-line) 0 1px,transparent 1px 8px) 0 100%/100% 3px no-repeat;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 75%);mask-image:linear-gradient(90deg,transparent,#000 75%)}
.wb-axis[data-side="r"]{left:calc(50% + var(--wb-tab)/2 + var(--wb-nd) + 14px);transform-origin:0 50%;
  background:repeating-linear-gradient(90deg,var(--wb-line-hi) 0 1px,transparent 1px 32px) 0 100%/100% 6px no-repeat,repeating-linear-gradient(90deg,var(--wb-line) 0 1px,transparent 1px 8px) 0 100%/100% 3px no-repeat;
  -webkit-mask-image:linear-gradient(270deg,transparent,#000 75%);mask-image:linear-gradient(270deg,transparent,#000 75%)}

/* ---- The mark unit: rectangular corner brackets, just above the seam ---- */
.wb-unit{position:absolute;left:50%;bottom:calc(50% + 16px);width:calc(var(--wb-mk)*1.24);height:calc(var(--wb-mk)*1.3);margin-left:calc(var(--wb-mk)*-.62)}
.wb-unit::before,.wb-unit::after{content:"";position:absolute;top:50%;width:9px;height:1px;background:var(--wb-line-hi)}
.wb-unit::before{left:-4px}
.wb-unit::after{right:-4px}
.wb-fr{position:absolute;width:14px;height:14px;border:0 solid var(--wb-bracket)}
.wb-fr[data-c="tl"]{top:0;left:0;border-top-width:1px;border-left-width:1px;--bx:-6px;--by:-6px}
.wb-fr[data-c="tr"]{top:0;right:0;border-top-width:1px;border-right-width:1px;--bx:6px;--by:-6px}
.wb-fr[data-c="bl"]{bottom:0;left:0;border-bottom-width:1px;border-left-width:1px;--bx:-6px;--by:6px}
.wb-fr[data-c="br"]{bottom:0;right:0;border-bottom-width:1px;border-right-width:1px;--bx:6px;--by:6px}
.wb-fr[data-c="tl"]::after,.wb-fr[data-c="br"]::after{content:"";position:absolute;width:4px;height:4px;background:var(--wb-ice);opacity:.75}
.wb-fr[data-c="tl"]::after{top:-1px;left:-1px}
.wb-fr[data-c="br"]::after{bottom:-1px;right:-1px}
.wb-unit__tag{position:absolute;top:-15px;font:400 8px/1 var(--wb-mono);letter-spacing:.16em;color:var(--wb-fog);white-space:nowrap}
.wb-unit__tag[data-p="l"]{left:0}
.wb-unit__tag[data-p="r"]{right:0}

/* The ÄGAPĒ mark: a chrome body in four plates under the logo's two umlaut dots. */
.wb-mk{position:absolute;left:50%;top:50%;height:var(--wb-mk);aspect-ratio:1476/2090;margin:calc(var(--wb-mk)*-.5) 0 0 calc(var(--wb-mk)*-.3531)}
.wb-mk svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.wb-mk__ghost{fill:none;stroke:var(--wb-ice);stroke-width:1;opacity:.2}
.wb-mk__p{position:absolute;inset:0}
.wb-mk__p svg{fill:url(#wb-chrome)}
.wb-mk__p[data-p="a"]{clip-path:inset(0 68.5% 0 0);--fx:-9%;--fy:0%}
.wb-mk__p[data-p="b"]{clip-path:inset(0 0 44.5% 31%);--fx:6%;--fy:-4%}
.wb-mk__p[data-p="c"]{clip-path:inset(55% 0 20.3% 31%);--fx:9%;--fy:0%}
.wb-mk__p[data-p="d"]{clip-path:inset(79.2% 0 0 31%);--fx:0%;--fy:5%}
/* Umlaut dots, exactly where the logo has them: a ghost ring until progress lights them in chrome. */
.wb-dot{position:absolute;top:0;width:18.02%;aspect-ratio:1;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(156,200,255,.2)}
.wb-dot[data-n="1"]{left:.47%}
.wb-dot[data-n="2"]{left:27.24%}
.wb-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 36% 30%,#f4f6f8 0 9%,#d3d9e0 28%,#a9b1bc 56%,#5a6f89 100%);opacity:0}
.wb-dot[data-lit]::after{opacity:1}

/* Title, riding in the seam's notch tab */
.wb-title{position:absolute;left:0;right:0;top:50%;height:var(--wb-nd);display:flex;align-items:center;justify-content:center;gap:.9em;padding-left:.56em;font:700 9px/1 var(--wb-hud);letter-spacing:.56em;color:var(--wb-frost);white-space:nowrap}
.wb-title i{font-style:normal;color:rgba(156,200,255,.45);letter-spacing:.1em}
.wb-title__v{display:grid;color:var(--wb-ice)}
.wb-title__v b{grid-area:1/1;font-weight:800;text-align:center}

/* Under the seam: LCD (+ coordinates caption on narrow screens) */
.wb-below{position:absolute;left:0;right:0;top:calc(50% + var(--wb-nd) + 20px);display:flex;flex-direction:column;align-items:center}

/* LCD: the hero countdown's build. A steel-grey chamfered strip, a recessed digit window, a slim gauge. */
.wb-lcd{position:relative;width:min(244px,68vw);padding:1px;background:var(--wb-line);clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
.wb-lcd::before,.wb-lcd::after{content:"";position:absolute;z-index:1;width:6px;height:6px;border:0 solid var(--wb-ice);opacity:.8}
.wb-lcd::before{top:0;right:0;border-top-width:1px;border-right-width:1px}
.wb-lcd::after{bottom:0;left:0;border-bottom-width:1px;border-left-width:1px}
.wb-lcd__in{position:relative;padding:8px 12px 10px;background:linear-gradient(180deg,#14181f,#0a0d12);clip-path:polygon(9.5px 0,100% 0,100% calc(100% - 9.5px),calc(100% - 9.5px) 100%,0 100%,0 9.5px)}
.wb-lcd__bar{display:flex;align-items:center;gap:8px;font:700 8px/1 var(--wb-hud);letter-spacing:.26em;color:var(--wb-fog)}
.wb-lcd__bar .wb-led{width:5px;height:5px}
.wb-lcd__rule{flex:1;height:5px;background:linear-gradient(var(--wb-line),var(--wb-line)) center/100% 1px no-repeat,repeating-linear-gradient(90deg,var(--wb-line-hi) 0 1px,transparent 1px 4px)}
.wb-lcd__scr{position:relative;margin:8px 0;padding:7px 0;overflow:hidden;background:linear-gradient(180deg,#04070c,#0a1220);box-shadow:inset 0 1px 2px rgba(0,0,0,.85),inset 0 0 0 1px rgba(156,200,255,.14)}
.wb-lcd__scr::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(4,6,10,.32) 0 1px,transparent 1px 3px)}
.wb-num{display:block;height:38px;width:auto;aspect-ratio:110/34;margin:0 auto}
.wb-num__ghost{fill:rgba(156,200,255,.07)}
.wb-num__lit,.wb-num__pct{fill:var(--wb-ice)}
.wb-num__lit use[data-lead]{opacity:.24}
.wb-gauge{position:relative;height:4px;overflow:hidden;background:rgba(233,235,236,.05);box-shadow:inset 0 0 0 1px rgba(233,235,236,.1)}
.wb-gauge__fill{position:absolute;inset:0;transform:translate3d(-100%,0,0);background:linear-gradient(90deg,rgba(90,111,137,.55),var(--wb-ice));will-change:transform;transition:transform .12s linear}
.wb-gauge::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent calc(100% - 2px),#0c0f14 0) 0 0/calc(100%/24) 100%}

/* Coordinates caption under the LCD (only where the data window is hidden) */
.wb-coords{display:none;margin-top:12px;font:400 9px/1 var(--wb-mono);letter-spacing:.18em;color:var(--wb-fog);white-space:nowrap}
.wb-coords b{font-weight:400;color:var(--wb-mist)}

/* Windows: header row, hairline-framed body, footer control bar */
.wb-win{position:absolute;bottom:36px;display:flex;flex-direction:column;gap:6px}
.wb-win[data-w="log"]{left:48px;width:352px}
.wb-win[data-w="data"]{right:48px;width:292px}
.wb-win__hd,.wb-win__ft{display:flex;align-items:center;gap:10px;font:700 8px/1 var(--wb-hud);letter-spacing:.3em;color:var(--wb-fog);white-space:nowrap}
.wb-win__hd i{font-style:normal;color:rgba(156,200,255,.45);letter-spacing:.1em}
.wb-win__hd>span:first-child{color:var(--wb-mist)}
.wb-win__rule{flex:1;height:1px;background:var(--wb-line)}
.wb-win__body{position:relative;padding:12px 14px}
.wb-win__body::before,.wb-win__ft::before{content:"";position:absolute;inset:0;border:1px solid var(--wb-line);pointer-events:none}
.wb-win__body::after{content:"";position:absolute;top:-1px;left:-1px;width:6px;height:6px;border:0 solid var(--wb-ice);border-top-width:1px;border-left-width:1px;opacity:.8}
.wb-win__ft{position:relative;height:22px;padding:0 10px}
.wb-win__count{margin-left:auto;font:400 10px/1 var(--wb-mono);letter-spacing:.06em;color:var(--wb-mist)}
.wb-win__count b{font-weight:400;color:var(--wb-ice)}
.wb-pips{display:flex;gap:5px}
.wb-pips .wb-led::after{opacity:0}
.wb-pips .wb-led[data-on]::after{opacity:1}
.wb-log{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.wb-log li{display:flex;align-items:baseline;gap:9px}
.wb-log__n{color:var(--wb-fog)}
.wb-log__t{color:var(--wb-frost);white-space:nowrap}
.wb-log__d{flex:1;min-width:16px;height:1px;align-self:center;background:linear-gradient(90deg,rgba(167,175,186,.3) 1px,transparent 1px) 0 0/4px 1px}
.wb-log__s{position:relative;display:grid;min-width:6ch;justify-items:end}
.wb-log__s i,.wb-log__s b{grid-area:1/1}
.wb-log__s i{width:.55em;height:1em;background:var(--wb-ice);opacity:0}
/* One cursor at a time: only on the line being worked on. */
.wb-log li:first-child:not([data-ok]) .wb-log__s i,.wb-log li[data-ok]+li:not([data-ok]) .wb-log__s i{opacity:.55}
.wb-log__s b{font-weight:400;color:var(--wb-ice);opacity:0}
.wb-log__s b[data-k="lock"]{color:var(--wb-frost)}
.wb-log li[data-ok] .wb-log__s i{display:none}
.wb-log li[data-ok] .wb-log__s b{opacity:1}

/* Data block (bottom right) */
.wb-data{display:flex;flex-direction:column;gap:7px;color:var(--wb-frost);white-space:nowrap}
.wb-data span{display:flex}
.wb-data i{font-style:normal;color:var(--wb-fog);width:5ch;flex:none}
.wb-win[data-w="data"] .wb-win__body{padding-bottom:13px}

/* Viewport corners (the hero viewfinder: frost hairline, ice knee) */
.wb-brk{position:absolute;z-index:4;width:30px;height:30px;border:0 solid var(--wb-line-hi)}
.wb-brk::after{content:"";position:absolute;width:5px;height:5px;background:var(--wb-ice);opacity:.7}
.wb-brk[data-c="tl"]{top:14px;left:14px;border-top-width:1px;border-left-width:1px;--bx:-6px;--by:-6px}
.wb-brk[data-c="tr"]{top:14px;right:14px;border-top-width:1px;border-right-width:1px;--bx:6px;--by:-6px}
.wb-brk[data-c="bl"]{bottom:14px;left:14px;border-bottom-width:1px;border-left-width:1px;--bx:-6px;--by:6px}
.wb-brk[data-c="br"]{bottom:14px;right:14px;border-bottom-width:1px;border-right-width:1px;--bx:6px;--by:6px}
.wb-brk[data-c="tl"]::after{top:-1px;left:-1px}
.wb-brk[data-c="tr"]::after{top:-1px;right:-1px}
.wb-brk[data-c="bl"]::after{bottom:-1px;left:-1px}
.wb-brk[data-c="br"]::after{bottom:-1px;right:-1px}

/* ---- Motion ----
   Calm: fades, short eased slides, no flicker. Only the header and the title reveal with a stepped clip
   (main-thread paints on two tiny rows); everything else is transform/opacity, which the compositor runs.
   Intro animations fill BACKWARDS only: each ends on the element's own resting style, so once done they leave
   nothing applied (no lingering clip-path or composited layer; WebKit also repaints a finished clip reliably). */
@media (prefers-reduced-motion:no-preference){
  .wb-brk{animation:wb-in .6s var(--wb-e) backwards}
  .wb-head{animation:wb-type .55s steps(22,end) .06s backwards}
  .wb-led[data-blink]::after{animation:wb-pulse 1.6s ease-in-out infinite}
  .wb-axis{animation:wb-draw-x .8s var(--wb-e) .12s backwards}
  .wb-fr{animation:wb-in .6s var(--wb-e) .04s backwards}
  .wb-unit::before,.wb-unit::after,.wb-unit__tag{animation:wb-fade .5s ease-out .3s backwards}
  .wb-mk__ghost{animation:wb-fade .35s ease-out .02s backwards}
  .wb-mk__p{animation:wb-plate .62s cubic-bezier(.22,1,.36,1) .14s backwards}
  .wb-mk__p[data-p="b"]{animation-delay:.2s}
  .wb-mk__p[data-p="d"]{animation-delay:.26s}
  .wb-mk__p[data-p="c"]{animation-delay:.3s}
  .wb-dot{animation:wb-fade .4s ease-out .2s backwards}
  .wb-dot[data-lit]::after{animation:wb-fade .2s ease-out backwards}
  .wb-title{animation:wb-type .45s steps(16,end) .3s backwards}
  .wb-lcd{animation:wb-rise .55s var(--wb-e) .2s backwards}
  .wb-log li{animation:wb-rise-x .4s var(--wb-e) calc(.12s + var(--i)*.09s) backwards}
  .wb-log li:first-child:not([data-ok]) .wb-log__s i,.wb-log li[data-ok]+li:not([data-ok]) .wb-log__s i{animation:wb-pulse .9s ease-in-out infinite}
  .wb-log li[data-ok] .wb-log__s b{animation:wb-fade .24s ease-out backwards}
  .wb-data span{animation:wb-rise-x .4s var(--wb-e) calc(.24s + var(--i)*.08s) backwards}
  .wb-coords{animation:wb-fade .4s ease-out .45s backwards}
  .wb-win__hd{animation:wb-fade .4s ease-out .08s backwards}
  .wb-win__body::before,.wb-win__ft::before{transform-origin:0 50%;animation:wb-draw-x .6s var(--wb-e) .1s backwards}
  .wb-win__body::after{animation:wb-fade .3s ease-out .3s backwards}
  .wb-win__ft{animation:wb-fade .3s ease-out .36s backwards}
  .wb[data-ready] .wb-head__st b+b,.wb[data-ready] .wb-title__v b+b{animation:wb-fade .25s ease-out backwards}

  /* Full exit: the content stows, the seam brightens, the doors glide apart. */
  .wb[data-exit="full"] .wb-core{animation:wb-stow .24s cubic-bezier(.4,0,1,1) both}
  .wb[data-exit="full"] .wb-brk{animation:wb-out .3s ease-in .08s both}
  .wb[data-exit="full"] .wb-door__edge{animation:wb-edge .7s ease-out both}
  .wb[data-exit="full"] .wb-door[data-d="t"]{animation:wb-door-t .56s var(--wb-io) .16s both}
  .wb[data-exit="full"] .wb-door[data-d="b"]{animation:wb-door-b .56s var(--wb-io) .16s both}

  /* Quick exit (repeat visit, or a key/click/scroll during the boot): the hatch just opens. */
  .wb[data-exit="quick"] .wb-core{animation:wb-out .12s ease-in both}
  .wb[data-exit="quick"] .wb-door__edge{animation:wb-edge .3s ease-out both}
  .wb[data-exit="quick"] .wb-door[data-d="t"]{animation:wb-door-t .28s var(--wb-io) both}
  .wb[data-exit="quick"] .wb-door[data-d="b"]{animation:wb-door-b .28s var(--wb-io) both}
  .wb[data-exit="quick"] .wb-brk{animation:wb-out .2s ease-in both}

  /* No JS: light up on a timer instead of on real progress. */
  .wb:not([data-js]) .wb-dot::after{animation:wb-on .3s ease-out 1.1s both}
  .wb:not([data-js]) .wb-dot[data-n="2"]::after{animation-delay:1.9s}
  .wb:not([data-js]) .wb-gauge__fill{animation:wb-fill 2.2s cubic-bezier(.3,.6,.4,1) .35s both}
  .wb:not([data-js]) .wb-log__s b{animation:wb-on .24s ease-out calc(.6s + var(--i)*.28s) both}
  .wb:not([data-js]) .wb-log__s i{animation:wb-hide 0s linear calc(.6s + var(--i)*.28s) both}
}
/* Repeat visit: nothing assembles, the doors just open. */
.wb[data-fast] .wb-core{visibility:hidden}
/* Reduced motion: everything static, then a plain fade (important: see the failsafe). */
.wb[data-exit="fade"]{animation:wb-out .3s ease both!important}
@media (prefers-reduced-motion:reduce){
  .wb:not([data-js]) .wb-dot::after,.wb:not([data-js]) .wb-log__s b{opacity:1}
  .wb:not([data-js]) .wb-log__s i{display:none}
  .wb:not([data-js]) .wb-gauge__fill{transform:none}
}

/* ---- Narrower screens ---- */
@media (max-width:1100px){
  .wb-win[data-w="data"],.wb-axis{display:none}
  .wb-coords{display:block}
}
@media (max-width:640px){
  .wb{--wb-mk:min(40vw,21svh);--wb-nd:16px;font-size:10px}
  .wb-head{left:38px;right:38px;top:14px;gap:7px;font-size:8px;letter-spacing:.24em}
  .wb-head__st,.wb-head__st+.wb-head__rule{display:none}
  .wb-title{font-size:8px;letter-spacing:.48em;padding-left:.48em}
  .wb-below{top:calc(50% + var(--wb-nd) + 16px)}
  .wb-lcd{width:min(232px,66vw)}
  .wb-num{height:34px}
  .wb-win[data-w="log"]{left:22px;right:22px;width:auto;bottom:calc(24px + env(safe-area-inset-bottom))}
  .wb-win__body{padding:10px 12px}
  .wb-log{gap:6px}
  .wb-brk{width:22px;height:22px}
}
@media (max-height:520px){
  .wb-win{display:none}
}

/* ---- Keyframes ---- */
@keyframes wb-failsafe{from{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}
@keyframes wb-out{to{opacity:0}}
@keyframes wb-hide{to{opacity:0}}
@keyframes wb-on{from{opacity:0}to{opacity:1}}
@keyframes wb-fade{from{opacity:0}}
@keyframes wb-in{from{opacity:0;transform:translate(var(--bx,0),var(--by,0))}}
@keyframes wb-type{from{clip-path:inset(-6px 100% -6px 0)}to{clip-path:inset(-6px 0)}}
@keyframes wb-rise{from{opacity:0;transform:translateY(6px)}}
@keyframes wb-rise-x{from{opacity:0;transform:translateX(-6px)}}
@keyframes wb-pulse{50%{opacity:.25}}
@keyframes wb-draw-x{from{transform:scaleX(0)}}
@keyframes wb-plate{from{opacity:0;transform:translate(var(--fx),var(--fy))}45%{opacity:1}to{opacity:1;transform:none}}
@keyframes wb-fill{to{transform:none}}
@keyframes wb-stow{to{opacity:0;transform:scale(.985)}}
@keyframes wb-edge{0%{opacity:.16}35%{opacity:.6}100%{opacity:.4}}
@keyframes wb-door-t{to{transform:translateY(-58%)}}
@keyframes wb-door-b{to{transform:translateY(58%)}}
`;

/**
 * Parks the hero + nav CSS intros under the boot screen so they play as the doors part. A separate sheet the
 * boot script inserts (only with JS, motion allowed, first visit) and removes at the handover: nothing is set
 * on React-owned elements (no hydration mismatch), the rules only exist during the boot, and removing them
 * restyles just the two subtrees they name. (A :has() or page-level flag restyled the whole document.)
 * The logo is held in its FINAL state rather than paused on its clipped first keyframe, so its first paint
 * (the LCP element) is full size; its glitch power-on still plays at the handover.
 */
const HOLD = String.raw`
#hero *,#hero *::before,#hero *::after,
header.whud *,header.whud *::before,header.whud *::after{animation-play-state:paused!important}
#hero .wh__logo{animation:none!important}
`;

/** Comments out, whitespace collapsed (never around ":", which would join descendant + pseudo selectors). */
const minify = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

export const BOOT_CSS = minify(CSS);
export const HOLD_CSS = minify(HOLD);
