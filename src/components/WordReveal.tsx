"use client";

import type { CSSProperties } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import s from "./Statement.module.css";

// The statement lights up word by word as it crosses the screen; emphasised words are set in italic.
export function WordReveal({ parts }: { parts: { em: boolean; text: string }[] }) {
  const words = parts.flatMap((p) => p.text.split(/(?<=\s)/).filter(Boolean).map((w) => ({ w, em: p.em })));
  const { track, target } = useScrollProgress<HTMLDivElement, HTMLParagraphElement>((p) => ({ "--n": (p * 1.35 * words.length).toFixed(2) }), 1);
  return (
    <div className={s.track} ref={track}>
      <p className={s.statement} ref={target} style={{ "--n": words.length } as CSSProperties}>
        {words.map(({ w, em }, i) => (
          <span key={i} className={em ? s.em : undefined} style={{ "--i": i } as CSSProperties}>
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}
