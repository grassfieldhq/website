import type { Locale } from "@/i18n";
import { shotData } from "./shots.generated";

// Captures of Grassfield, produced by scripts/shots.mjs from a capture manifest (see README).
export type ShotKind = "screen" | "detail" | "clip";
export type ShotSrc = { w: number; src: string };
export type ShotData = {
  id: string;
  /** the id without its "-dark" / "-light" suffix: the light and dark captures of one scene share it */
  base: string;
  lang: Locale;
  kind: ShotKind;
  theme: "dark" | "light";
  feature: string;
  /** details: the base of the scene they are cut from */
  parent: string | null;
  title: string;
  caption: string;
  alt: string;
  demo: boolean;
  /** intrinsic size of the image (the poster, for a clip) */
  width: number;
  height: number;
  scale: number;
  avif: ShotSrc[];
  webp: ShotSrc[];
  video?: { webm: string | null; mp4: string | null; duration: number | null };
};

/** One scene in one language: its dark and/or light capture. */
export type Scene = { key: string; base: string; kind: ShotKind; feature: string; dark?: ShotData; light?: ShotData };

/** A region of a screen capture to show zoomed in a frame of ratio `ar`; x, y (0–1) is the point that stays put. */
export type Focus = { x: number; y: number; zoom: number; ar: string };

const cache = new Map<Locale, Scene[]>();

/** The scenes of a language, in manifest order. */
export function scenes(lang: Locale): Scene[] {
  let list = cache.get(lang);
  if (!list) {
    const byKey = new Map<string, Scene>();
    for (const d of shotData) {
      if (d.lang !== lang) continue;
      const key = `${d.kind}:${d.base}`;
      const sc = byKey.get(key) ?? { key, base: d.base, kind: d.kind, feature: d.feature };
      sc[d.theme] = d;
      byKey.set(key, sc);
    }
    list = [...byKey.values()];
    cache.set(lang, list);
  }
  return list;
}

// Slots: where a page shows one particular capture. Each slot lists candidates in order of preference; the first
// match in the page's language wins, and a slot with no match shows its code-drawn render or nothing. Small tiles
// zoom into a screen (`focus`) rather than use a close-up, so every tile keeps the same framing; close-ups go to
// the galleries.
type Candidate = { bases?: string[]; feature?: string; kind: ShotKind; focus?: Focus };
const slots = {
  overview: [{ bases: ["overview"], feature: "overview", kind: "screen" }],
  search: [
    { bases: ["search"], feature: "search", kind: "screen", focus: { x: 0.5, y: 0.3, zoom: 2, ar: "2 / 1" } },
  ],
  controlcenter: [
    { bases: ["controlcenter"], feature: "controlcenter", kind: "screen", focus: { x: 1, y: 0, zoom: 2.2, ar: "1 / 1" } },
  ],
  notifications: [
    { bases: ["notifications"], feature: "notifications", kind: "screen", focus: { x: 1, y: 0, zoom: 1.6, ar: "1 / 1" } },
  ],
  // the global menu tile shows an open app menu only: a capture of the menu bar alone would not prove it
  menus: [{ bases: ["menubar-app-menu", "menubar-menu", "app-menu", "global-menu"], kind: "screen" }],
  tiling: [{ bases: ["tiling"], feature: "tiling", kind: "screen" }],
  lock: [{ bases: ["lock"], feature: "lock", kind: "screen" }],
  settings: [{ bases: ["settings-appearance", "settings", "files-settings"], feature: "settings", kind: "screen" }],
} satisfies Record<string, Candidate[]>;
export type SlotName = keyof typeof slots;

const matches = (sc: Scene, c: Candidate, base?: string) => sc.kind === c.kind && (base ? sc.base === base : sc.feature === c.feature);

export function slot(lang: Locale, name: SlotName): { scene: Scene; focus?: Focus } | undefined {
  const list = scenes(lang);
  for (const c of slots[name] as Candidate[]) {
    for (const b of c.bases ?? []) {
      const sc = list.find((x) => matches(x, c, b));
      if (sc) return { scene: sc, focus: sc.kind === "screen" ? c.focus : undefined };
    }
    const sc = c.feature ? list.find((x) => matches(x, c)) : undefined;
    if (sc) return { scene: sc, focus: sc.kind === "screen" ? c.focus : undefined };
  }
  return undefined;
}

/** The scenes a page's slots show, so its gallery does not repeat them. */
export function used(lang: Locale, names: SlotName[]): Set<string> {
  return new Set(names.flatMap((n) => slot(lang, n)?.scene.key ?? []));
}

/** A screen with both appearances, for the light/dark comparison: the preferred bases first, then any. */
export function themePair(lang: Locale, prefer = ["settings-appearance", "files-settings", "desktop"]): Scene | undefined {
  const pairs = scenes(lang).filter((sc) => sc.kind === "screen" && sc.dark && sc.light);
  return prefer.map((b) => pairs.find((sc) => sc.base === b)).find(Boolean) ?? pairs[0];
}

/**
 * Scenes grouped by feature, in the order of `order` (the features the site has words for); features it does not
 * know are gathered at the end under "other". `only` keeps some features, `exclude` drops scenes shown elsewhere.
 */
export function byFeature(lang: Locale, order: readonly string[], opts: { only?: readonly string[]; exclude?: Set<string> } = {}) {
  const groups = new Map<string, Scene[]>();
  for (const sc of scenes(lang)) {
    if (opts.only && !opts.only.includes(sc.feature)) continue;
    if (opts.exclude?.has(sc.key)) continue;
    const f = order.includes(sc.feature) ? sc.feature : "other";
    groups.set(f, [...(groups.get(f) ?? []), sc]);
  }
  return [...order, "other"].filter((f) => groups.has(f)).map((feature) => ({ feature, scenes: groups.get(feature)! }));
}

/** Which features each page gathers in its gallery (the Tour shows them all). */
export const pageFeatures = {
  desktop: ["desktop", "widgets", "menubar", "dock", "controlcenter", "notifications", "search", "overview", "tiling", "apps"],
  apps: { Files: ["files"], Settings: ["settings", "update"], Preview: ["preview"], Store: ["store"] } as Record<string, string[]>,
  appsMore: ["activity", "dialogs"],
  security: ["lock", "polkit"],
} as const;
