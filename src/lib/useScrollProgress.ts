"use client";

import { useEffect, useRef } from "react";

// Writes the scroll progress (0..1) of a tall track through the viewport to the target element:
// `--p` raw, and whatever extra variables `derive` returns. With reduced motion the end state is used.
export function useScrollProgress<T extends HTMLElement, U extends HTMLElement>(
  derive: (p: number) => Record<string, number | string> = () => ({}),
  reducedP = 1,
) {
  const track = useRef<T>(null);
  const target = useRef<U>(null);
  useEffect(() => {
    const el = track.current;
    const out = target.current;
    if (!el || !out) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      let p = reducedP;
      if (!reduce.matches) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const span = r.height - vh;
        // a tall track scrubs while pinned; a short element scrubs while it crosses the screen
        p = clamp01(span > 0 ? -r.top / span : (vh * 0.9 - r.top) / (r.height * 0.9 + vh * 0.4));
      }
      out.style.setProperty("--p", p.toFixed(4));
      for (const [k, v] of Object.entries(derive(p))) {
        if (k.startsWith("--")) out.style.setProperty(k, String(v));
        else out.dataset[k] = String(v);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
    // derive is a pure function of p; the effect wires the listeners once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { track, target };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
