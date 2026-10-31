// Shared runtime-perf helpers for the winter page:
//  - observeInView / useInView: one IntersectionObserver per option set, shared page-wide.
//  - pauseWhenOffscreen / usePauseOffscreen / OffscreenPauser + [data-pause-offscreen]:
//    park every CSS animation inside an element while it is off screen ([data-offscreen] rule in winter.css).
//  - onSecond / onSecondWhileVisible: one wall-clock-aligned 1 Hz ticker for every clock and
//    countdown, stopped while the tab is hidden or no subscriber is on screen.
export { observeInView, pauseWhenOffscreen, useInView, usePauseOffscreen, type InViewOptions } from "./inView";
export { onSecond, onSecondWhileVisible } from "./ticker";
export { OffscreenPauser, PAUSE_ATTR } from "./OffscreenPauser";
