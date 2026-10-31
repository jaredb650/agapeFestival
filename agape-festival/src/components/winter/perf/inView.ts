"use client";

import { useEffect, useState, type RefObject } from "react";

// One IntersectionObserver per (rootMargin, threshold) pair, shared by every
// caller on the page: dozens of "pause me when off screen" elements cost one
// observer, not dozens.

export interface InViewOptions {
  /** IntersectionObserver rootMargin. Default "0px". */
  rootMargin?: string;
  /** Single threshold. Default 0. */
  threshold?: number;
}

type Listener = (entry: IntersectionObserverEntry) => void;

interface Pool {
  io: IntersectionObserver;
  listeners: Map<Element, Set<Listener>>;
}

const pools = new Map<string, Pool>();

function pool({ rootMargin = "0px", threshold = 0 }: InViewOptions): { key: string; p: Pool } {
  const key = `${rootMargin}|${threshold}`;
  let p = pools.get(key);
  if (!p) {
    const listeners = new Map<Element, Set<Listener>>();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => listeners.get(e.target)?.forEach((fn) => fn(e))),
      { rootMargin, threshold },
    );
    p = { io, listeners };
    pools.set(key, p);
  }
  return { key, p };
}

/**
 * Call `onChange(inView, entry)` whenever `el` enters or leaves the viewport
 * (grown by `rootMargin`). Fires once right after observing. Returns the
 * unobserve function. No React, no state: safe for per-element imperative use.
 */
export function observeInView(
  el: Element,
  onChange: (inView: boolean, entry: IntersectionObserverEntry) => void,
  opts: InViewOptions = {},
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true, {} as IntersectionObserverEntry);
    return () => {};
  }
  const { key, p } = pool(opts);
  const fn: Listener = (e) => onChange(e.isIntersecting, e);
  let set = p.listeners.get(el);
  if (!set) {
    set = new Set();
    p.listeners.set(el, set);
    p.io.observe(el);
  }
  set.add(fn);
  return () => {
    const s = p.listeners.get(el);
    if (!s) return;
    s.delete(fn);
    if (s.size) return;
    p.listeners.delete(el);
    p.io.unobserve(el);
    if (!p.listeners.size) {
      p.io.disconnect();
      pools.delete(key);
    }
  };
}

/**
 * Toggle `data-offscreen` on `el` while it is out of view. With the rule in
 * winter.css, every CSS animation inside it (pseudo-elements included) parks
 * via `animation-play-state` and resumes where it left off.
 */
export function pauseWhenOffscreen(el: HTMLElement, opts: InViewOptions = { rootMargin: "64px 0px" }): () => void {
  const off = observeInView(el, (inView) => el.toggleAttribute("data-offscreen", !inView), opts);
  return () => {
    off();
    el.removeAttribute("data-offscreen");
  };
}

/** Live in-view flag for React consumers that genuinely need to re-render on it (prefer observeInView). */
export function useInView(ref: RefObject<Element | null>, opts: InViewOptions = {}): boolean {
  const [inView, setInView] = useState(false);
  const { rootMargin, threshold } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeInView(el, setInView, { rootMargin, threshold });
  }, [ref, rootMargin, threshold]);
  return inView;
}

/** Hook form of pauseWhenOffscreen. */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>, opts?: InViewOptions) {
  const rootMargin = opts?.rootMargin;
  const threshold = opts?.threshold;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return pauseWhenOffscreen(el, { rootMargin: rootMargin ?? "64px 0px", threshold });
  }, [ref, rootMargin, threshold]);
}
