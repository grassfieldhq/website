"use client";

import type { CSSProperties, ReactNode } from "react";
import { clamp01, smooth, useScrollProgress } from "@/lib/useScrollProgress";
import s from "./Stage.module.css";

/**
 * A scene the visitor scrolls through: a tall track pins its stage, --e (eased progress, 0..1) drives the scene's
 * CSS, and one caption per step crossfades as --e crosses the step boundaries. With reduced motion the stage is not
 * pinned and shows its final frame.
 */
export function Stage({ steps, label, children, height = 260, hold = 0.12 }: { steps: string[]; label: string; children: ReactNode; height?: number; hold?: number }) {
  const n = steps.length;
  const { track, target } = useScrollProgress<HTMLDivElement, HTMLDivElement>((p) => {
    const q = smooth(clamp01((p - hold) / (1 - 2 * hold)));
    return { "--e": q.toFixed(4), step: String(Math.min(n - 1, Math.floor(q * n))) };
  }, 1);
  return (
    <div className={s.track} ref={track} style={{ "--h": `${height}vh` } as CSSProperties}>
      <div className={s.sticky} ref={target} data-step={n - 1} style={{ "--e": 1 } as CSSProperties}>
        <div className={s.steps} aria-live="off">
          {steps.map((step, i) => (
            <p key={step} data-i={i}>
              {step}
            </p>
          ))}
        </div>
        <div className={`display ${s.display}`}>
          <div className={`screen ${s.screen}`} role="img" aria-label={label}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
