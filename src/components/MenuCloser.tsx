"use client";

import { useEffect } from "react";

// The phone menu is a native <details> (it opens without JavaScript); with scripts, Escape and a click outside close
// it too, and Escape gives the keyboard back to its button.
export function MenuCloser({ selector }: { selector: string }) {
  useEffect(() => {
    const menu = () => document.querySelector<HTMLDetailsElement>(selector);
    const onKey = (e: KeyboardEvent) => {
      const m = menu();
      if (e.key !== "Escape" || !m?.open) return;
      m.open = false;
      m.querySelector("summary")?.focus();
    };
    const onClick = (e: MouseEvent) => {
      const m = menu();
      if (m?.open && !m.contains(e.target as Node)) m.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [selector]);
  return null;
}
