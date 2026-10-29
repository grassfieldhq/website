"use client";

import { useSyncExternalStore } from "react";
import type { Dict } from "@/i18n";
import { THEME_KEY, type ThemePref } from "@/lib/theme";
import { Mask } from "./Mask";
import s from "./Nav.module.css";

const EVENT = "gf-theme-change";
const order: ThemePref[] = ["system", "light", "dark"];
const icons: Record<ThemePref, string> = { system: "display", light: "sun", dark: "moon" };

function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}
const read = (): ThemePref => {
  const v = document.documentElement.dataset.themePref;
  return v === "light" || v === "dark" ? v : "system";
};

function apply(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === "system") delete root.dataset.theme;
  else root.dataset.theme = pref;
  root.dataset.themePref = pref;
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // storage blocked: the choice lasts for this page only
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle({ t }: { t: Dict["theme"] }) {
  const pref = useSyncExternalStore(subscribe, read, () => "system" as ThemePref);
  const next = order[(order.indexOf(pref) + 1) % order.length]!;
  return (
    <button
      type="button"
      className={s.theme}
      onClick={() => apply(next)}
      aria-label={`${t.label}, ${t[pref]}`}
      title={`${t.label}, ${t[pref]}`}
    >
      <Mask name={icons[pref]} />
    </button>
  );
}
