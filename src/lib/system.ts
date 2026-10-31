import type { Locale } from "@/i18n";
import { scenes, type Focus, type Scene } from "./shots";

// "Everything in the system": one tile per surface of Grassfield OS, grouped as the desktop, the apps and the system.
// A tile shows a real capture (a close-up when the set has one, else a screen zoomed on the surface) and opens that
// capture in the guided tour (`shot-<base>`, an anchor every scene has there). A tile whose surface has no capture
// shows its icon and links to the page that covers it. Words live in the dictionaries (`system.tiles`), keyed by id.
export type TileGroup = "desktop" | "apps" | "system";
export type SystemTile = {
  id: string;
  group: TileGroup;
  /** the tour feature the surface belongs to */
  feature: string;
  /** capture bases to look for, in order; the first one in the page's language wins */
  bases: string[];
  /** a region of the capture to frame; close-ups are framed whole (cover) around their centre */
  focus?: { x: number; y: number; zoom: number };
  /** two columns wide on the large layouts */
  wide?: boolean;
  /** shown on the home page's summary; `narrow` there for a tile that is wide on the OS page */
  home?: boolean | "narrow";
  /** without a capture: a symbolic icon or an app icon, and the page that covers the surface */
  icon?: { symbolic?: string; app?: string };
  href?: string;
  soon?: boolean;
};

export const systemTiles: SystemTile[] = [
  { id: "overview", group: "desktop", feature: "overview", bases: ["overview"], wide: true, home: true, focus: { x: 0.5, y: 0.55, zoom: 1 } },
  { id: "controlcenter", group: "desktop", feature: "controlcenter", bases: ["detail-controlcenter"], home: true, focus: { x: 0.5, y: 0.3, zoom: 1 } },
  { id: "menus", group: "desktop", feature: "menubar", bases: ["detail-window-menu", "detail-system-menu"], home: true, focus: { x: 0.65, y: 0, zoom: 1 } },
  { id: "search", group: "desktop", feature: "search", bases: ["detail-search"], wide: true, home: true, focus: { x: 0.5, y: 0.3, zoom: 1 } },
  { id: "widgets", group: "desktop", feature: "widgets", bases: ["detail-widgets"], home: true, focus: { x: 0.5, y: 0.2, zoom: 1 } },
  { id: "dock", group: "desktop", feature: "dock", bases: ["detail-dock-stack"], focus: { x: 0.5, y: 0.35, zoom: 1 } },
  { id: "tiling", group: "desktop", feature: "tiling", bases: ["detail-tiling-popover"], home: true, focus: { x: 0.3, y: 0.2, zoom: 1 } },
  { id: "notifications", group: "desktop", feature: "notifications", bases: ["notifications", "notification-banner"], wide: true, focus: { x: 1, y: 0, zoom: 1.7 } },
  { id: "stages", group: "desktop", feature: "stages", bases: ["detail-stages-strip"], soon: true, focus: { x: 0.3, y: 0.3, zoom: 1 } },
  { id: "files", group: "apps", feature: "files", bases: ["files-columns"], wide: true, home: true, focus: { x: 0.05, y: 0.3, zoom: 1.2 } },
  { id: "settings", group: "apps", feature: "settings", bases: ["detail-accent-picker"], home: true, focus: { x: 0, y: 0.5, zoom: 1 } },
  { id: "preview", group: "apps", feature: "preview", bases: ["preview-pdf"], focus: { x: 0.5, y: 0.3, zoom: 1.3 } },
  { id: "activity", group: "apps", feature: "activity", bases: ["detail-activity-table", "activity-cpu"], wide: true, focus: { x: 0.3, y: 0, zoom: 1 } },
  { id: "apps", group: "apps", feature: "apps", bases: ["detail-apps-grid"], wide: true, focus: { x: 0.5, y: 0.35, zoom: 1 } },
  { id: "store", group: "apps", feature: "store", bases: [], icon: { app: "Store" }, href: "apps/#store" },
  { id: "lock", group: "system", feature: "lock", bases: ["detail-lock"], wide: true, home: "narrow", focus: { x: 0.5, y: 0.4, zoom: 1 } },
  { id: "update", group: "system", feature: "update", bases: ["settings-software-update"], focus: { x: 0.55, y: 0.35, zoom: 1.9 } },
  { id: "dialogs", group: "system", feature: "dialogs", bases: ["detail-replace-sheet"], focus: { x: 0.4, y: 0.4, zoom: 1 } },
  { id: "polkit", group: "system", feature: "polkit", bases: [], icon: { symbolic: "shield" }, href: "security/#protections" },
  { id: "accessibility", group: "system", feature: "settings", bases: ["settings-accessibility"], focus: { x: 0.55, y: 0.3, zoom: 1.7 } },
];

export const tileGroups: TileGroup[] = ["desktop", "apps", "system"];

export type ResolvedTile = SystemTile & { scene?: Scene; frame?: Focus; link: string };

/**
 * The tiles to show, with their capture in the page's language. A tile that expects a capture and finds none is
 * left out (the set can change); icon tiles always show. `home` keeps the home page's summary, in its own order.
 */
export function resolveTiles(lang: Locale, opts: { home?: boolean } = {}): ResolvedTile[] {
  const list = scenes(lang).filter((sc) => sc.kind !== "clip");
  const out: ResolvedTile[] = [];
  for (const tile of systemTiles) {
    if (opts.home && !tile.home) continue;
    if (!tile.bases.length) {
      if (tile.icon && tile.href) out.push({ ...tile, link: `/${lang}/${tile.href}` });
      continue;
    }
    const scene = tile.bases.map((b) => list.find((sc) => sc.base === b)).find(Boolean);
    if (!scene) continue;
    const f = tile.focus ?? { x: 0.5, y: 0.5, zoom: 1 };
    const wide = opts.home && tile.home === "narrow" ? false : tile.wide;
    // the frame's shape comes from the tile (CSS), so the ratio is left to it
    out.push({ ...tile, wide, scene, frame: { ...f, ar: "auto" }, link: `/${lang}/tour/#shot-${scene.base}` });
  }
  return out;
}
