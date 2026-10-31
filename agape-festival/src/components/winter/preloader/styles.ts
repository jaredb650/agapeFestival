// Critical CSS for the SYSTEM BOOT overlay. Inlined (minified) in front of the
// overlay markup so it paints with the very first frame, with no request and
// no JS. Classes wb-*, keyframes wb-*.
//
// Perf contract: every animation is transform/opacity (plus stepped clips on a
// few tiny text rows). No filters, no blend modes, no backdrop-filter. The two
// door panels are pre-promoted (they carry the exit); everything else promotes
// only while it animates. The overlay is removed from the DOM after the exit.
//
// Timeline (from first paint): brackets + header 0–0.5 s, ring locks 0.1–0.9 s,
// the ÄGAPĒ mark's four plates slam in 0.2–0.95 s under a scan laser, log lines
// type 0.12–0.82 s. JS lights the ring segments, the orbs (50 % / 100 %) and the
// log statuses from real readiness. Exit (data-exit="full"): jitter + RGB split
// + glitch bars, a CRT collapse into the seam, the seam flares, then the hatch
// doors part (unlock clunk, then slide) and the page's intro starts under them.

const CSS = String.raw`
.wb-defs{position:absolute;width:0;height:0;overflow:hidden}
.wb{
  --wb-ice:#9cc8ff;--wb-volt:#3d6bff;--wb-deep:#1e3bb8;--wb-frost:#e9ebec;--wb-mist:#a7afba;--wb-fog:#737c8b;--wb-ink:#04060a;--wb-red:#f0294b;
  --wb-e:cubic-bezier(0.16,1,0.3,1);
  --wb-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  --wb-hud:var(--font-hud,ui-sans-serif),ui-sans-serif,system-ui,sans-serif;
  --wb-ring:min(300px,36svh,62vw);
  --wb-tab:min(380px,64vw);
  --wb-nd:16px;
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
    radial-gradient(120% 85% at 50% 46%,transparent 38%,rgba(0,0,0,.7) 100%),
    repeating-linear-gradient(0deg,rgba(4,6,10,.5) 0 1px,transparent 1px 3px),
    linear-gradient(rgba(156,200,255,.05) 1px,transparent 1px) calc(50% - 32px) calc(50% - 32px)/64px 64px,
    linear-gradient(90deg,rgba(156,200,255,.05) 1px,transparent 1px) calc(50% - 32px) calc(50% - 32px)/64px 64px,
    radial-gradient(70% 55% at 50% 44%,rgba(30,59,184,.2),transparent 72%),
    #04060a;
}
.wb-door__edge{background:var(--wb-ice);opacity:.18}
.wb-door[data-d="t"] .wb-door__face,.wb-door[data-d="t"] .wb-door__edge{
  clip-path:polygon(0 0,100% 0,100% 50%,calc(50% + var(--wb-tab)/2 + var(--wb-nd)) 50%,calc(50% + var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% - var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% - var(--wb-tab)/2 - var(--wb-nd)) 50%,0 50%);
}
.wb-door[data-d="b"] .wb-door__face,.wb-door[data-d="b"] .wb-door__edge{
  clip-path:polygon(0 50%,calc(50% - var(--wb-tab)/2 - var(--wb-nd)) 50%,calc(50% - var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% + var(--wb-tab)/2) calc(50% + var(--wb-nd)),calc(50% + var(--wb-tab)/2 + var(--wb-nd)) 50%,100% 50%,100% 100%,0 100%);
}
/* The edge is the same shape nudged 1.5px across the seam: it peeks out as a lit hairline that traces the notch. */
.wb-door[data-d="t"] .wb-door__edge{transform:translateY(1.5px)}
.wb-door[data-d="b"] .wb-door__edge{transform:translateY(-1.5px)}

/* ---- Core (everything that collapses on exit) ---- */
.wb-core{position:absolute;inset:0;z-index:3}
.wb-core__in{position:absolute;inset:0}
.wb-core__in::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(4,6,10,.3) 0 1px,transparent 1px 3px)}
.wb-sweep{position:absolute;left:0;right:0;top:0;height:90px;opacity:0;background:linear-gradient(180deg,transparent,rgba(156,200,255,.03) 85%,rgba(156,200,255,.16) calc(100% - 1px),transparent)}

/* Header bar */
.wb-head{position:absolute;top:18px;left:28px;right:28px;height:24px;display:flex;align-items:center;gap:10px;font:700 9px/1 var(--wb-hud);letter-spacing:.32em;color:var(--wb-mist);white-space:nowrap}
.wb-head b{color:var(--wb-frost);font-weight:800}
.wb-head i{font-style:normal;color:var(--wb-ice);opacity:.7}
.wb-head__rule{flex:1;height:1px;min-width:12px;background:linear-gradient(90deg,rgba(233,235,236,.3),rgba(233,235,236,.08))}
.wb-head__rule+.wb-head__st+.wb-head__rule{background:linear-gradient(270deg,rgba(233,235,236,.3),rgba(233,235,236,.08))}
.wb-head__st{position:relative;display:grid;color:var(--wb-ice)}
.wb-head__st b{grid-area:1/1;color:inherit;font-weight:700;text-align:center}
.wb-head__st b+b,.wb-title__v b+b{opacity:0}
.wb[data-ready] .wb-head__st b:first-child,.wb[data-ready] .wb-title__v b:first-child{opacity:0}
.wb[data-ready] .wb-head__st b+b,.wb[data-ready] .wb-title__v b+b{opacity:1}

/* Glass LEDs */
.wb-led{position:relative;flex:none;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 34% 30%,rgba(233,235,236,.5) 0 12%,#4a5566 32%,#1b212c 72%,#0b0e14 100%);box-shadow:inset 0 0 0 1px rgba(4,6,10,.7)}
.wb-led::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff 0 10%,#cfe3ff 24%,var(--wb-ice) 46%,var(--wb-volt) 76%,var(--wb-deep) 100%);box-shadow:0 0 8px 1px rgba(61,107,255,.65)}

/* Side rulers */
.wb-ruler{position:absolute;top:28%;bottom:28%;width:12px;background:
  repeating-linear-gradient(180deg,rgba(233,235,236,.34) 0 1px,transparent 1px 40px) 0 0/12px 100% no-repeat,
  repeating-linear-gradient(180deg,rgba(233,235,236,.18) 0 1px,transparent 1px 8px) 0 0/6px 100% no-repeat}
.wb-ruler[data-side="l"]{left:30px}
.wb-vtext{position:absolute;left:14px;top:50%;font:400 8px/1 var(--wb-mono);letter-spacing:.42em;color:var(--wb-fog);white-space:nowrap;transform:translate(-50%,-50%) rotate(-90deg)}
.wb-ruler[data-side="r"]{right:30px;transform:scaleX(-1)}

/* ---- Centre stack: ring + mark, title, LCD ---- */
.wb-stack{position:absolute;left:0;right:0;top:56px;bottom:64px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.wb-ring{position:relative;flex:none;width:var(--wb-ring);height:var(--wb-ring)}
.wb-ring::before{content:"";position:absolute;inset:-18%;border-radius:50%;background:radial-gradient(closest-side,rgba(61,107,255,.2),rgba(30,59,184,.07) 55%,transparent)}
.wb-ring svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;fill:none;stroke:var(--wb-frost)}
.wb-ring__spin{position:absolute;inset:0}
.wb-r-o{stroke-width:1;opacity:.24;vector-effect:non-scaling-stroke}
.wb-r-i{stroke-width:1;opacity:.22;stroke-dasharray:1 3}
.wb-r-x{stroke-width:1;opacity:.5;vector-effect:non-scaling-stroke}
.wb-r-pip{fill:var(--wb-ice);stroke:none}
.wb-r-t{stroke-width:5;opacity:.3;stroke-dasharray:1 7.1171}
.wb-r-t--maj{stroke-width:9;opacity:.55;stroke:var(--wb-ice);stroke-dasharray:1.6 71.43}
.wb-r-a{stroke-width:1.2;opacity:.42}
.wb-r-a--hot{stroke:var(--wb-ice);stroke-width:3;opacity:.9}
.wb-r-seg path{stroke:rgba(156,200,255,.12);stroke-width:4}
.wb-r-seg path[data-on]{stroke:var(--wb-ice)}

/* The ÄGAPĒ mark: a chrome body in four plates + two glass orbs (the umlaut). */
.wb-mk{position:absolute;left:50%;top:50%;height:calc(var(--wb-ring)*.5);aspect-ratio:1476/2090;transform:translate(-50%,-50%)}
.wb-mk svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.wb-mk__ghost{fill:none;stroke:var(--wb-ice);stroke-width:1.2;opacity:.28}
.wb-mk__p,.wb-mk__rgb,.wb-mk__flash,.wb-mk__laser{position:absolute;inset:0}
.wb-mk__p svg{fill:url(#wb-chrome)}
.wb-mk__p[data-p="a"]{clip-path:inset(0 68.5% 0 0);--fx:-58%;--fy:0%}
.wb-mk__p[data-p="b"]{clip-path:inset(0 0 44.5% 31%);--fx:34%;--fy:-30%}
.wb-mk__p[data-p="c"]{clip-path:inset(55% 0 20.3% 31%);--fx:62%;--fy:0%}
.wb-mk__p[data-p="d"]{clip-path:inset(79.2% 0 0 31%);--fx:0%;--fy:36%}
.wb-mk__rgb,.wb-mk__flash,.wb-mk__laser{opacity:0}
.wb-mk__rgb[data-c="b"] svg{fill:var(--wb-volt)}
.wb-mk__rgb[data-c="r"] svg{fill:var(--wb-red)}
.wb-mk__rgb[data-c="b"]{--rx:-7px}
.wb-mk__rgb[data-c="r"]{--rx:7px}
.wb-mk__flash svg{fill:#fff}
.wb-mk__laser::before{content:"";position:absolute;left:-14%;right:-14%;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--wb-ice) 18%,#fff 50%,var(--wb-ice) 82%,transparent)}
.wb-mk__laser::after{content:"";position:absolute;left:-6%;right:-6%;top:-14px;height:16px;background:linear-gradient(180deg,transparent,rgba(156,200,255,.28))}
.wb-orb{position:absolute;top:0;width:18.02%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 30%,rgba(233,235,236,.6) 0 11%,#56627a 30%,#1b212c 70%,#0b0e14 100%);box-shadow:inset 0 0 0 1px rgba(4,6,10,.8),inset 0 -2px 3px rgba(156,200,255,.18)}
.wb-orb[data-n="1"]{left:.47%}
.wb-orb[data-n="2"]{left:27.24%}
.wb-orb::before{content:"";position:absolute;inset:-130%;border-radius:50%;background:radial-gradient(closest-side,rgba(156,200,255,.5),rgba(61,107,255,.18) 45%,transparent);opacity:0}
.wb-orb::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff 0 12%,#d6e8ff 26%,var(--wb-ice) 48%,var(--wb-volt) 78%,var(--wb-deep) 100%);opacity:0}
.wb-orb[data-lit]::before,.wb-orb[data-lit]::after{opacity:1}

/* Callouts */
.wb-call{position:absolute;display:flex;align-items:center;gap:6px;font:400 9px/1 var(--wb-mono);letter-spacing:.1em;color:var(--wb-mist);white-space:nowrap}
.wb-call b{font-weight:400;color:var(--wb-ice)}
.wb-call i{position:absolute;width:44px;height:1px;background:rgba(156,200,255,.55);transform-origin:0 50%}
.wb-call[data-p="ne"]{left:88%;top:14%;padding-left:46px}
.wb-call[data-p="ne"] i{left:0;top:50%}
.wb-call[data-p="ne"]::before{content:"";position:absolute;left:-18px;top:calc(50% + 12px);width:24px;height:1px;background:rgba(156,200,255,.55);transform:rotate(-30deg);transform-origin:100% 50%}
.wb-call[data-p="sw"]{right:90%;bottom:3%;padding-right:46px}
.wb-call[data-p="sw"] i{right:0;top:50%}
.wb-call[data-p="sw"]::before{content:"";position:absolute;right:-18px;top:calc(50% - 12px);width:24px;height:1px;background:rgba(156,200,255,.55);transform:rotate(-30deg);transform-origin:0 50%}

/* Title */
.wb-title{display:flex;align-items:center;gap:.9em;margin-top:22px;font:700 11px/1 var(--wb-hud);letter-spacing:.62em;color:var(--wb-frost);white-space:nowrap;padding-left:.62em}
.wb-title i{font-style:normal;color:var(--wb-ice);letter-spacing:.1em}
.wb-title__v{display:grid;color:var(--wb-ice)}
.wb-title__v b{grid-area:1/1;font-weight:800;text-align:center}

/* LCD counter: chamfered recessed screen, 5x7 dot-matrix digits, segmented gauge */
.wb-lcd{margin-top:16px;width:min(272px,72vw);padding:1px;background:linear-gradient(180deg,rgba(156,200,255,.5),rgba(233,235,236,.14));clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)}
.wb-lcd__in{position:relative;padding:9px 14px 12px;background:linear-gradient(180deg,#05080e,#0a1220);clip-path:polygon(11.5px 0,100% 0,100% calc(100% - 11.5px),calc(100% - 11.5px) 100%,0 100%,0 11.5px)}
.wb-lcd__in::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(4,6,10,.32) 0 1px,transparent 1px 3px)}
.wb-lcd__bar{display:flex;align-items:center;gap:8px;font:700 8px/1 var(--wb-hud);letter-spacing:.3em;color:var(--wb-fog)}
.wb-lcd__bar .wb-led{width:6px;height:6px}
.wb-lcd__rule{flex:1;height:1px;background:rgba(156,200,255,.16)}
.wb-num{display:block;height:52px;width:auto;aspect-ratio:110/34;margin:11px auto 10px}
.wb-num__ghost{fill:rgba(156,200,255,.075)}
.wb-num__lit,.wb-num__pct{fill:#c6defd}
.wb-num__lit use[data-lead]{opacity:.26}
.wb-gauge{position:relative;height:7px;overflow:hidden;background:rgba(156,200,255,.07);box-shadow:inset 0 0 0 1px rgba(156,200,255,.14)}
.wb-gauge__fill{position:absolute;inset:0;transform:translate3d(-100%,0,0);background:linear-gradient(90deg,var(--wb-deep),var(--wb-volt) 55%,var(--wb-ice) 94%,#fff);will-change:transform;transition:transform .1s linear}
.wb-gauge::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent calc(100% - 2px),#070b13 0) 0 0/calc(100%/24) 100%}

/* Coordinates caption under the LCD (only where the data window is hidden) */
.wb-coords{display:none;margin-top:12px;font:400 9px/1 var(--wb-mono);letter-spacing:.18em;color:var(--wb-fog);white-space:nowrap}
.wb-coords b{font-weight:400;color:var(--wb-mist)}

/* Boot log (bottom left) */
/* Windows (Xefirotarch): header row, hairline-framed body, footer control bar */
.wb-win{position:absolute;bottom:34px;display:flex;flex-direction:column;gap:6px}
.wb-win[data-w="log"]{left:44px;width:360px}
.wb-win[data-w="data"]{right:44px;width:300px}
.wb-win__hd,.wb-win__ft{display:flex;align-items:center;gap:10px;font:700 8px/1 var(--wb-hud);letter-spacing:.3em;color:var(--wb-fog);white-space:nowrap}
.wb-win__hd i{font-style:normal;color:var(--wb-ice);opacity:.7;letter-spacing:.1em}
.wb-win__hd>span:first-child{color:var(--wb-mist)}
.wb-win__rule{flex:1;height:1px;background:rgba(233,235,236,.14)}
.wb-win__body{position:relative;padding:12px 14px}
.wb-win__body::before,.wb-win__ft::before{content:"";position:absolute;inset:0;border:1px solid rgba(233,235,236,.16);pointer-events:none}
.wb-win__body::after{content:"";position:absolute;top:-1px;left:-1px;width:10px;height:10px;border:0 solid var(--wb-ice);border-top-width:1px;border-left-width:1px}
.wb-win__ft{position:relative;height:22px;padding:0 10px}
.wb-win__count{margin-left:auto;font:400 10px/1 var(--wb-mono);letter-spacing:.06em;color:var(--wb-mist)}
.wb-win__count b{font-weight:400;color:var(--wb-ice)}
.wb-pips{display:flex;gap:5px}
.wb-pips .wb-led{width:7px;height:7px}
.wb-pips .wb-led::after{opacity:0}
.wb-pips .wb-led[data-on]::after{opacity:1}
.wb-log{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.wb-log li{display:flex;align-items:baseline;gap:9px}
.wb-log__n{color:var(--wb-fog)}
.wb-log__t{color:var(--wb-frost);white-space:nowrap}
.wb-log__d{flex:1;min-width:16px;transform-origin:0 50%;height:1px;align-self:center;background:linear-gradient(90deg,rgba(167,175,186,.45) 1px,transparent 1px) 0 0/4px 1px}
.wb-log__s{position:relative;display:grid;min-width:6ch;justify-items:end}
.wb-log__s i,.wb-log__s b{grid-area:1/1}
.wb-log__s i{width:.6em;height:1em;background:var(--wb-ice);opacity:.7}
.wb-log__s b{font-weight:400;color:var(--wb-ice);opacity:0}
.wb-log__s b[data-k="lock"]{color:#fff}
.wb-log li[data-ok] .wb-log__s i{display:none}
.wb-log li[data-ok] .wb-log__s b{opacity:1}

/* Data block (bottom right) */
.wb-data{display:flex;flex-direction:column;gap:7px;color:var(--wb-frost);white-space:nowrap}
.wb-data span{display:flex}
.wb-data i{font-style:normal;color:var(--wb-fog);width:5ch;flex:none}
.wb-win[data-w="data"] .wb-win__body{padding-bottom:13px}

/* Corner brackets */
.wb-brk{position:absolute;z-index:4;width:26px;height:26px;border:0 solid rgba(156,200,255,.85)}
.wb-brk[data-c="tl"]{top:12px;left:12px;border-top-width:1px;border-left-width:1px;--bx:-12px;--by:-12px}
.wb-brk[data-c="tr"]{top:12px;right:12px;border-top-width:1px;border-right-width:1px;--bx:12px;--by:-12px}
.wb-brk[data-c="bl"]{bottom:12px;left:12px;border-bottom-width:1px;border-left-width:1px;--bx:-12px;--by:12px}
.wb-brk[data-c="br"]{bottom:12px;right:12px;border-bottom-width:1px;border-right-width:1px;--bx:12px;--by:12px}

/* Exit FX layer */
.wb-fx{position:absolute;inset:0;z-index:5;pointer-events:none}
.wb-fx>*{position:absolute;opacity:0}
.wb-bloom{left:50%;top:44%;width:min(90vw,720px);aspect-ratio:1;margin:calc(min(90vw,720px)/-2) 0 0 calc(min(90vw,720px)/-2);border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(156,200,255,.25) 35%,rgba(61,107,255,.08) 60%,transparent)}
.wb-seam{left:0;right:0;top:calc(50% - 30px);height:60px;background:radial-gradient(50% 50% at 50% 50%,rgba(156,200,255,.55),transparent 70%)}
.wb-seam::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:linear-gradient(90deg,transparent,#fff 30%,#fff 70%,transparent)}
.wb-fx i{left:var(--l);width:var(--w);top:var(--y);height:var(--h);background:linear-gradient(90deg,transparent,rgba(156,200,255,.55) 12%,rgba(255,255,255,.8) 46%,rgba(156,200,255,.5) 88%,transparent)}
.wb-fx i:nth-of-type(2),.wb-fx i:nth-of-type(4){background:linear-gradient(90deg,transparent,rgba(240,41,75,.5) 20%,rgba(255,160,175,.7) 50%,rgba(240,41,75,.45) 80%,transparent)}

/* ---- Motion ----
   Only the header and the title type in with a stepped clip (main-thread paints); every other row stutters in
   with transform/opacity steps, which the compositor runs without main-thread frames.
   Intro animations fill BACKWARDS only: each ends on the element's own resting style, so once done they leave
   nothing applied (no lingering clip-path or composited layer; WebKit also repaints a finished clip reliably). */
@media (prefers-reduced-motion:no-preference){
  .wb-brk{animation:wb-snap .46s var(--wb-e) backwards}
  .wb-brk[data-c="tr"]{animation-delay:.05s}
  .wb-brk[data-c="br"]{animation-delay:.1s}
  .wb-brk[data-c="bl"]{animation-delay:.15s}
  .wb-head{animation:wb-type .5s steps(20,end) .06s backwards}
  .wb-led[data-blink]::after{animation:wb-blip 1.2s steps(1,end) infinite}
  .wb-ruler{animation:wb-draw-y .8s var(--wb-e) .14s backwards}
  .wb-ruler[data-side="r"]{animation-name:wb-draw-y-r}
  .wb-sweep{animation:wb-sweep 1.9s cubic-bezier(.5,0,.3,1) .1s infinite}
  .wb-ring__base{animation:wb-lock .85s var(--wb-e) .08s backwards}
  .wb-ring__spin[data-l="ticks"]>svg{animation:wb-spin-in 1.4s var(--wb-e) .1s backwards}
  .wb-ring__spin[data-l="ticks"]{animation:wb-spin 40s linear 1.5s infinite}
  .wb-ring__spin[data-l="arcs"]>svg{animation:wb-spin-in-rev 1.2s var(--wb-e) .14s backwards}
  .wb-ring__spin[data-l="arcs"]{animation:wb-spin-rev 16s linear 1.34s infinite}
  .wb-mk__ghost{animation:wb-ghost 1s linear .08s backwards}
  .wb-mk__p{animation:wb-plate .52s cubic-bezier(.2,.8,.25,1) .2s backwards}
  .wb-mk__p[data-p="b"]{animation-delay:.3s}
  .wb-mk__p[data-p="d"]{animation-delay:.38s}
  .wb-mk__p[data-p="c"]{animation-delay:.46s}
  .wb-mk__laser{animation:wb-laser .72s cubic-bezier(.45,0,.55,1) .22s backwards}
  .wb-mk__flash{animation:wb-flash .42s ease-out .9s backwards}
  .wb-orb{animation:wb-drop .42s var(--wb-e) .6s backwards}
  .wb-orb[data-n="2"]{animation-delay:.68s}
  .wb-orb[data-lit]::before,.wb-orb[data-lit]::after{animation:wb-lit .34s linear backwards}
  .wb-call{animation:wb-blink .5s steps(1,end) .92s backwards}
  .wb-call[data-p="sw"]{animation-delay:1.02s}
  .wb-title{animation:wb-type .5s steps(14,end) .42s backwards}
  .wb-lcd{animation:wb-power .6s var(--wb-e) .28s backwards}
  /* One stepped clip per row (no layers); only the line being worked on blinks its cursor. */
  .wb-log li{animation:wb-row .32s steps(5,end) calc(.12s + var(--i)*.12s) backwards}
  .wb-log li:first-child:not([data-ok]) .wb-log__s i,.wb-log li[data-ok]+li:not([data-ok]) .wb-log__s i{animation:wb-cursor .5s steps(1,end) infinite}
  .wb-log li[data-ok] .wb-log__s b{animation:wb-blink .26s steps(1,end) backwards}
  .wb-data span{animation:wb-row .32s steps(5,end) calc(.32s + var(--i)*.1s) backwards}
  .wb-coords{animation:wb-row .32s steps(5,end) .62s backwards}
  .wb-win__hd{animation:wb-row .32s steps(5,end) .1s backwards}
  .wb-win[data-w="data"] .wb-win__hd{animation-delay:.22s}
  .wb-win__body::before,.wb-win__ft::before{transform-origin:0 50%;animation:wb-draw-x .5s var(--wb-e) .12s backwards}
  .wb-win__body::after{animation:wb-blink .4s steps(1,end) .3s backwards}
  .wb-win__ft{animation:wb-blink .3s steps(1,end) .5s backwards}
  .wb-vtext{animation:wb-blink .5s steps(1,end) .3s backwards}
  .wb[data-ready] .wb-head__st b+b,.wb[data-ready] .wb-title__v b+b{animation:wb-blink .3s steps(1,end) backwards}

  /* Full exit: glitch → CRT collapse into the seam → seam flare → doors part. */
  .wb[data-exit="full"] .wb-core__in{animation:wb-jitter .22s steps(1,end) both}
  .wb[data-exit="full"] .wb-core{animation:wb-crt .2s cubic-bezier(.55,0,.85,.35) .12s both}
  .wb[data-exit="full"] .wb-mk__rgb{animation:wb-rgb .2s steps(1,end) both}
  .wb[data-exit="full"] .wb-bloom{animation:wb-bloom .36s ease-out both}
  .wb[data-exit="full"] .wb-fx i{animation:wb-bar .26s steps(1,end) both}
  .wb[data-exit="full"] .wb-fx i:nth-of-type(2n){animation-delay:.04s}
  .wb[data-exit="full"] .wb-seam{animation:wb-seam .48s var(--wb-e) .15s both}
  .wb[data-exit="full"] .wb-door__edge{animation:wb-edge .56s ease-out .16s both}
  .wb[data-exit="full"] .wb-door[data-d="t"]{animation:wb-door-t .54s linear .23s both}
  .wb[data-exit="full"] .wb-door[data-d="b"]{animation:wb-door-b .54s linear .23s both}
  .wb[data-exit="full"] .wb-brk{animation:wb-brk-out .4s var(--wb-e) .23s both}

  /* Quick exit (repeat visit, or a key/click/scroll during the boot): the hatch just opens. */
  .wb[data-exit="quick"] .wb-core{animation:wb-out .12s ease-in both}
  .wb[data-exit="quick"] .wb-door__edge{animation:wb-edge .3s ease-out both}
  .wb[data-exit="quick"] .wb-door[data-d="t"]{animation:wb-door-tq .28s cubic-bezier(.65,0,.35,1) both}
  .wb[data-exit="quick"] .wb-door[data-d="b"]{animation:wb-door-bq .28s cubic-bezier(.65,0,.35,1) both}
  .wb[data-exit="quick"] .wb-brk{animation:wb-out .2s ease-in both}

  /* No JS: light up on a timer instead of on real progress. */
  .wb:not([data-js]) .wb-orb::before,.wb:not([data-js]) .wb-orb::after{animation:wb-lit .34s linear 1.1s both}
  .wb:not([data-js]) .wb-orb[data-n="2"]::before,.wb:not([data-js]) .wb-orb[data-n="2"]::after{animation-delay:1.9s}
  .wb:not([data-js]) .wb-r-seg path{animation:wb-seg .1s steps(1,end) calc(.4s + var(--k)*.22s) both}
  .wb:not([data-js]) .wb-gauge__fill{animation:wb-fill 2.2s cubic-bezier(.3,.6,.4,1) .35s both}
  .wb:not([data-js]) .wb-log__s b{animation:wb-blink .26s steps(1,end) calc(.6s + var(--i)*.28s) both}
  .wb:not([data-js]) .wb-log__s i{animation:wb-hide 0s linear calc(.6s + var(--i)*.28s) both}
}
/* Repeat visit: nothing assembles, the doors just open. */
.wb[data-fast] .wb-core{visibility:hidden}
/* Reduced motion: everything static, then a plain fade (important: see the failsafe). */
.wb[data-exit="fade"]{animation:wb-out .3s ease both!important}
@media (prefers-reduced-motion:reduce){
  .wb:not([data-js]) .wb-orb::before,.wb:not([data-js]) .wb-orb::after,.wb:not([data-js]) .wb-log__s b{opacity:1}
  .wb:not([data-js]) .wb-log__s i{display:none}
  .wb:not([data-js]) .wb-r-seg path{stroke:var(--wb-ice)}
  .wb:not([data-js]) .wb-gauge__fill{transform:none}
}

/* ---- Phones ---- */
@media (max-width:1100px){
  .wb-win[data-w="data"],.wb-call{display:none}
  .wb-coords{display:block}
}
@media (max-width:640px){
  .wb{--wb-ring:min(66vw,35svh);--wb-nd:12px;font-size:10px}
  .wb-head{left:36px;right:36px;top:12px;gap:7px;font-size:8px;letter-spacing:.24em}
  .wb-head__st,.wb-head__st+.wb-head__rule{display:none}
  .wb-ruler,.wb-call,.wb-vtext,.wb-win[data-w="data"]{display:none}
  .wb-stack{top:44px;bottom:calc(186px + env(safe-area-inset-bottom))}
  .wb-title{margin-top:18px;font-size:10px;letter-spacing:.5em}
  .wb-lcd{margin-top:14px;width:min(250px,70vw)}
  .wb-num{height:44px;margin:9px auto 8px}
  .wb-win[data-w="log"]{left:20px;right:20px;width:auto;bottom:calc(22px + env(safe-area-inset-bottom))}
  .wb-win__body{padding:10px 12px}
  .wb-log{gap:6px}
  .wb-brk{width:20px;height:20px}
}
@media (max-height:520px){
  .wb-win,.wb-ruler,.wb-call,.wb-vtext{display:none}
  .wb-stack{bottom:24px}
}

/* ---- Keyframes ---- */
@keyframes wb-failsafe{from{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}
@keyframes wb-out{to{opacity:0}}
@keyframes wb-hide{to{opacity:0}}
@keyframes wb-snap{0%{opacity:0;transform:scale(1.9)}35%{opacity:1}50%{opacity:.25}65%,100%{opacity:1;transform:none}}
@keyframes wb-type{from{clip-path:inset(-6px 100% -6px 0)}to{clip-path:inset(-6px 0)}}
@keyframes wb-row{0%{opacity:0;transform:translateX(-10px)}40%{opacity:1}60%{opacity:.35}80%,100%{opacity:1;transform:none}}
@keyframes wb-blink{0%{opacity:0}20%{opacity:1}40%{opacity:0}60%,100%{opacity:1}}
@keyframes wb-blip{0%{opacity:1}50%{opacity:.15}}
@keyframes wb-cursor{0%{opacity:.75}50%{opacity:0}}
@keyframes wb-draw-y{from{transform:scaleY(0)}to{transform:none}}
@keyframes wb-draw-y-r{from{transform:scale(-1,0)}to{transform:scaleX(-1)}}
@keyframes wb-draw-x{from{transform:scaleX(0)}to{transform:none}}
@keyframes wb-sweep{0%{opacity:1;transform:translateY(-90px)}100%{opacity:1;transform:translateY(100vh)}}
@keyframes wb-lock{0%{opacity:0;transform:scale(1.3)}60%{opacity:1}100%{opacity:1;transform:none}}
@keyframes wb-spin-in{from{transform:rotate(-140deg)}to{transform:none}}
@keyframes wb-spin-in-rev{from{transform:rotate(120deg)}to{transform:none}}
@keyframes wb-spin{to{transform:rotate(360deg)}}
@keyframes wb-spin-rev{to{transform:rotate(-360deg)}}
@keyframes wb-ghost{0%{opacity:0}6%{opacity:.95}11%{opacity:.1}17%{opacity:.95}62%{opacity:.85}100%{opacity:.28}}
@keyframes wb-plate{0%{opacity:0;transform:translate(var(--fx),var(--fy))}14%{opacity:1}64%{transform:translate(calc(var(--fx)*-.06),calc(var(--fy)*-.06))}100%{opacity:1;transform:none}}
@keyframes wb-laser{0%{opacity:0;transform:translateY(16%)}12%{opacity:1}88%{opacity:1}100%{opacity:0;transform:translateY(100%)}}
@keyframes wb-flash{0%{opacity:0}22%{opacity:.85}100%{opacity:0}}
@keyframes wb-drop{from{opacity:0;transform:translateY(-140%) scale(.5)}to{opacity:1;transform:none}}
@keyframes wb-lit{0%{opacity:0}18%{opacity:1}34%{opacity:.25}52%,100%{opacity:1}}
@keyframes wb-power{0%{opacity:0;transform:scale(.5,.04)}32%{opacity:1;transform:scale(1,.04)}64%{transform:scale(1,1.05)}80%{opacity:.6}100%{opacity:1;transform:none}}
@keyframes wb-seg{to{stroke:var(--wb-ice)}}
@keyframes wb-fill{to{transform:none}}
@keyframes wb-jitter{0%{transform:none}14%{transform:translate(-10px,0)}28%{transform:translate(8px,1px) skewX(-3deg)}44%{transform:translate(-5px,-1px)}60%{transform:translate(3px,0) skewX(2deg)}78%,100%{transform:none}}
@keyframes wb-crt{0%{opacity:1;transform:none}55%{opacity:1;transform:scale(1,.006)}100%{opacity:0;transform:scale(0,.006)}}
@keyframes wb-rgb{0%{opacity:.85;transform:translateX(var(--rx))}34%{opacity:.7;transform:translateX(calc(var(--rx)*-.6))}67%{opacity:.85;transform:translateX(calc(var(--rx)*1.4))}100%{opacity:0;transform:none}}
@keyframes wb-bloom{0%{opacity:0;transform:scale(.55)}24%{opacity:1}100%{opacity:0;transform:scale(1.35)}}
@keyframes wb-bar{0%{opacity:0;transform:none}12%{opacity:.95;transform:translateX(var(--x))}38%{opacity:.25;transform:translateX(calc(var(--x)*-1))}58%{opacity:.85;transform:translateX(calc(var(--x)*.5))}80%,100%{opacity:0;transform:none}}
@keyframes wb-seam{0%{opacity:0;transform:scaleX(0)}28%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
@keyframes wb-edge{0%{opacity:.18}30%{opacity:1}100%{opacity:.75}}
@keyframes wb-door-t{0%{transform:none;animation-timing-function:cubic-bezier(.3,0,.4,1)}12%{transform:translateY(-1.2%);animation-timing-function:linear}20%{transform:translateY(-1.2%);animation-timing-function:cubic-bezier(.7,0,.22,1)}100%{transform:translateY(-58%)}}
@keyframes wb-door-b{0%{transform:none;animation-timing-function:cubic-bezier(.3,0,.4,1)}12%{transform:translateY(1.2%);animation-timing-function:linear}20%{transform:translateY(1.2%);animation-timing-function:cubic-bezier(.7,0,.22,1)}100%{transform:translateY(58%)}}
@keyframes wb-door-tq{to{transform:translateY(-58%)}}
@keyframes wb-door-bq{to{transform:translateY(58%)}}
@keyframes wb-brk-out{to{opacity:0;transform:translate(var(--bx),var(--by)) scale(1.2)}}
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
