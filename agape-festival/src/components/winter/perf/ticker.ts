"use client";

import { observeInView, type InViewOptions } from "./inView";

// One shared 1 Hz ticker for every clock / countdown on the page. It is
// aligned to the wall-clock second (so all readouts flip together), runs only
// while at least one subscriber is active, and never while the tab is hidden
// (it catches up immediately on return).

type Tick = (nowMs: number) => void;

const subs = new Set<Tick>();
let timer = 0;
let listening = false;

function run() {
  timer = 0;
  if (!subs.size || document.hidden) return;
  const now = Date.now();
  subs.forEach((fn) => fn(now));
  schedule();
}

function schedule() {
  if (timer || !subs.size || document.hidden) return;
  // +8ms so the callback lands just after the second boundary, never just before it.
  timer = window.setTimeout(run, 1000 - (Date.now() % 1000) + 8);
}

function onVisibility() {
  if (document.hidden) {
    clearTimeout(timer);
    timer = 0;
  } else {
    clearTimeout(timer);
    run();
  }
}

/**
 * Subscribe to the shared second tick. `fn` is also called once immediately so
 * the readout is never stale. Returns the unsubscribe function.
 */
export function onSecond(fn: Tick): () => void {
  subs.add(fn);
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", onVisibility);
  }
  fn(Date.now());
  schedule();
  return () => {
    subs.delete(fn);
    if (subs.size) return;
    clearTimeout(timer);
    timer = 0;
    document.removeEventListener("visibilitychange", onVisibility);
    listening = false;
  };
}

/**
 * Like onSecond, but only subscribed while `el` is on screen. The readout
 * refreshes the moment it scrolls back into view.
 */
export function onSecondWhileVisible(el: Element, fn: Tick, opts?: InViewOptions): () => void {
  let unsub: (() => void) | null = null;
  const unobserve = observeInView(
    el,
    (inView) => {
      if (inView && !unsub) unsub = onSecond(fn);
      else if (!inView && unsub) {
        unsub();
        unsub = null;
      }
    },
    opts,
  );
  return () => {
    unobserve();
    unsub?.();
  };
}
