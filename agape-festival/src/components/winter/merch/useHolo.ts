"use client";

import { useEffect, type RefObject } from "react";

/**
 * The holographic view: while a mouse is over the preview, a silver sheen on the garment follows it.
 * Fine pointers with motion allowed only; touch and reduced motion get the plain photograph. Each pointer
 * move schedules one rAF that eases the sheen toward the pointer and writes two custom properties on the
 * sheen layer (`--dx`, `--dy`: px from the centre). The loop stops once it has caught up: nothing runs
 * while the pointer is still or elsewhere, and React never re-renders for it.
 */
export function useHolo(stageRef: RefObject<HTMLElement | null>, holoRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    const holo = holoRef.current;
    if (!stage || !holo) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let detach = () => {};

    const attach = () => {
      detach();
      if (!mq.matches) return;
      let rect: DOMRect | null = null;
      let raf = 0;
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      const write = () => {
        holo.style.setProperty("--dx", `${x.toFixed(1)}px`);
        holo.style.setProperty("--dy", `${y.toFixed(1)}px`);
      };
      const step = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        if (Math.abs(tx - x) + Math.abs(ty - y) < 0.5) {
          x = tx;
          y = ty;
          raf = 0;
        } else {
          raf = requestAnimationFrame(step);
        }
        write();
      };
      const aim = (e: PointerEvent) => {
        rect ??= stage.getBoundingClientRect();
        tx = e.clientX - rect.left - rect.width / 2;
        ty = e.clientY - rect.top - rect.height / 2;
      };
      const enter = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        rect = null;
        aim(e);
        x = tx;
        y = ty;
        write();
        stage.setAttribute("data-holo", "");
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        aim(e);
        if (!raf) raf = requestAnimationFrame(step);
      };
      const leave = () => {
        stage.removeAttribute("data-holo");
        rect = null;
      };
      const stale = () => {
        rect = null;
      };
      stage.addEventListener("pointerenter", enter);
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", leave);
      window.addEventListener("scroll", stale, { passive: true });
      window.addEventListener("resize", stale);
      detach = () => {
        cancelAnimationFrame(raf);
        stage.removeEventListener("pointerenter", enter);
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
        window.removeEventListener("scroll", stale);
        window.removeEventListener("resize", stale);
        stage.removeAttribute("data-holo");
        detach = () => {};
      };
    };

    attach();
    mq.addEventListener("change", attach);
    return () => {
      mq.removeEventListener("change", attach);
      detach();
    };
  }, [stageRef, holoRef]);
}
