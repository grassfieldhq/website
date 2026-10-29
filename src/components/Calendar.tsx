"use client";

import { useNow } from "@/lib/useNow";
import s from "./Everyday.module.css";

// Month grid starting on Monday. Server render uses a fixed reference date; the browser shows today.
const REF = new Date(2026, 9, 29);

function cap(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export function Calendar({ locale, weekdays }: { locale: string; weekdays: string[] }) {
  const now = useNow();
  const d = now === null ? REF : new Date(now);

  const y = d.getFullYear();
  const m = d.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const prev = new Date(y, m, 0).getDate();
  const tail = (7 - ((first + days) % 7)) % 7;
  const cells: { n: number; kind: "o" | "d" | "t" }[] = [
    ...Array.from({ length: first }, (_, i) => ({ n: prev - first + 1 + i, kind: "o" as const })),
    ...Array.from({ length: days }, (_, i) => ({ n: i + 1, kind: i + 1 === d.getDate() ? ("t" as const) : ("d" as const) })),
    ...Array.from({ length: tail }, (_, i) => ({ n: i + 1, kind: "o" as const })),
  ];

  return (
    <div className={s.calw}>
      <div>
        <div className={s.dow}>{cap(new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d))}</div>
        <div className={s.big}>{d.getDate()}</div>
        <div className={s.mo}>{new Intl.DateTimeFormat(locale, { month: "long" }).format(d)}</div>
      </div>
      <div className={s.cal}>
        {weekdays.map((w, i) => (
          <span key={`h${i}`} className={s.h}>
            {w}
          </span>
        ))}
        {cells.map((c, i) => (
          <span key={i} className={c.kind === "o" ? s.o : c.kind === "t" ? s.t : undefined}>
            {c.n}
          </span>
        ))}
      </div>
    </div>
  );
}
