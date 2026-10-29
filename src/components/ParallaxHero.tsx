"use client";

import type { ReactNode } from "react";
import { clamp01, smooth, useScrollProgress } from "@/lib/useScrollProgress";
import { Landscape } from "./Landscape";
import s from "./Hero.module.css";

// The hero: the Grassfield landscape at dawn. Scrolling raises the sun and the hills at their own pace,
// the title steps back and the desktop rises out of the field.
export function ParallaxHero({ copy, display }: { copy: ReactNode; display: ReactNode }) {
  const { track, target } = useScrollProgress<HTMLDivElement, HTMLDivElement>(
    (p) => ({ "--q": smooth(clamp01((p - 0.12) / 0.7)).toFixed(4) }),
    0,
  );
  return (
    <div className={s.track} ref={track}>
      <div className={s.sticky} ref={target}>
        <Landscape />
        <div className={s.copy}>{copy}</div>
        <div className={s.rise}>{display}</div>
      </div>
    </div>
  );
}
