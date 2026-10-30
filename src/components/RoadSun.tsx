"use client";

import type { ReactNode } from "react";
import { clamp01, smooth, useScrollProgress } from "@/lib/useScrollProgress";
import s from "./Roadmap.module.css";

// The roadmap's horizon: as it crosses the screen, the sun travels from step 1 towards step 2 and stops where
// the work is (the release candidate), never at step 2 itself.
export function RoadSun({ children }: { children: ReactNode }) {
  const { track, target } = useScrollProgress<HTMLDivElement, HTMLDivElement>((p) => ({ "--e": smooth(clamp01((p - 0.1) / 0.6)).toFixed(4) }), 1);
  return (
    <div ref={track}>
      <div ref={target} className={s.roadWrap} data-road>
        {children}
        <span className={s.travel} aria-hidden="true" />
      </div>
    </div>
  );
}
