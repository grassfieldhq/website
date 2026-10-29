"use client";

import { useNow } from "@/lib/useNow";

type Variant = "bar" | "time" | "date";

const formats: Record<Variant, Intl.DateTimeFormatOptions> = {
  bar: { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
  time: { hour: "numeric", minute: "2-digit" },
  date: { weekday: "long", day: "numeric", month: "long" },
};

// A stable placeholder on the server, then the visitor's real time.
export function Clock({ variant, locale, placeholder }: { variant: Variant; locale: string; placeholder: string }) {
  const now = useNow();
  const text = now === null ? placeholder : new Intl.DateTimeFormat(locale, formats[variant]).format(now).replace(/,/g, "");
  return <span className="tnum">{text}</span>;
}
