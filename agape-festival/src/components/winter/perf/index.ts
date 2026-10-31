// Shared runtime-perf helpers for the winter page:
//  - observeInView: one IntersectionObserver per option set, shared page-wide.
//  - onSecond / onSecondWhileVisible: one wall-clock-aligned 1 Hz ticker for every clock and
//    countdown, stopped while the tab is hidden or no subscriber is on screen.
export { observeInView, type InViewOptions } from "./inView";
export { onSecond, onSecondWhileVisible } from "./ticker";
