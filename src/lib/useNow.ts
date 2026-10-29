"use client";

import { useSyncExternalStore } from "react";

// The current minute (ms timestamp, floored), or null during server rendering and hydration.
const subscribe = (notify: () => void) => {
  const id = setInterval(notify, 5_000);
  return () => clearInterval(id);
};
const minute = () => Math.floor(Date.now() / 60_000) * 60_000;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, minute, () => null);
}
