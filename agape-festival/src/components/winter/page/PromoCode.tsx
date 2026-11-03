"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/winter/classic";
import { trackCustom } from "@/components/winter/analytics/pixel";
import { CheckIcon, CopyIcon } from "@/components/winter/ui";

/** Clipboard API first (needs a secure context); the old hidden-textarea copy as a fallback. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * The promo code as a quiet secondary button (the kit's copy pattern): a tap or Enter / Space copies it,
 * the copy glyph turns to a check and the label reads "Copied" for a moment. Code and "Copied" share one
 * grid cell, so the button keeps its width. A polite live region tells screen readers what happened.
 */
export function PromoCode({ code, until }: { code: string; until?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  // The page is static, so an expired code would stay up: once `until` has passed, hide the whole row.
  useEffect(() => {
    const end = until ? Date.parse(until) : NaN;
    if (!(Date.now() > end)) return;
    const row = ref.current?.closest<HTMLElement>(".tk-row");
    if (row) row.hidden = true;
  }, [until]);

  const copy = async () => {
    const ok = await copyText(code);
    if (ok) trackCustom("CopyPromoCode", { code });
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };
  const copied = state === "copied";

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="tk-code"
        lead={copied ? <CheckIcon /> : <CopyIcon />}
        icon={null}
        onClick={copy}
        aria-label={`Copy promo code ${code}`}
        data-copied={copied || undefined}
      >
        <span className="tk-code__swap">
          <span className="tk-code__text" aria-hidden={copied || undefined}>
            {code}
          </span>
          <span className="tk-code__done" aria-hidden="true">
            Copied
          </span>
        </span>
      </Button>
      <span ref={ref} className="w-sr-only" role="status" aria-live="polite">
        {copied ? `Promo code ${code} copied` : state === "failed" ? `Couldn't copy. The code is ${code}` : ""}
      </span>
    </>
  );
}
