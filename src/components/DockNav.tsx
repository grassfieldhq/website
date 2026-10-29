"use client";

import { useRef, type CSSProperties } from "react";
import type { Locale } from "@/i18n";
import { Mask } from "./Mask";
import s from "./Shell.module.css";

// The site's main navigation is a Dock: one tile per page, the magnification of Grassfield's Dock
// (dock.magnificationMax 1.6 over 3 tiles), a dot under the open page. On a phone it is a tab bar.
const MAX = 1.6;
const RADIUS = 3;

type Tile = { path: string; label: string; short?: string; icon: string; tint: string; phone?: boolean };

export type DockLabels = { dock: string; home: string; desktop: string; apps: string; security: string; os: string; tour: string; download: string; faq: string };

export function DockNav({ t, lang, path }: { t: DockLabels; lang: Locale; path: string }) {
  const ref = useRef<HTMLElement>(null);
  const home = `/${lang}/`;
  const tiles: Tile[] = [
    { path: "", label: t.home, icon: "grassfield-logo", tint: "linear-gradient(160deg, #3e7d5a, #16391f)", phone: false },
    { path: "desktop/", label: t.desktop, icon: "display", tint: "linear-gradient(160deg, #5aa2ff, #1f5fcc)" },
    { path: "apps/", label: t.apps, icon: "apps", tint: "linear-gradient(160deg, #f5a04a, #964d08)" },
    { path: "security/", label: t.security, icon: "shield", tint: "linear-gradient(160deg, #a0a4ae, #5c616b)" },
    { path: "os/", label: t.os, short: "OS", icon: "gear", tint: "linear-gradient(160deg, #b48cf2, #7a3fc4)" },
    { path: "tour/", label: t.tour, icon: "camera", tint: "linear-gradient(160deg, #f07ab0, #c2306f)" },
    { path: "download/", label: t.download, icon: "download", tint: "linear-gradient(160deg, #8bd34e, #3a7512)" },
    { path: "faq/", label: t.faq, icon: "info", tint: "linear-gradient(160deg, #f2d14b, #e0b000)", phone: false },
  ];

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(max-width: 700px)").matches) return;
    ref.current?.querySelectorAll<HTMLElement>("[data-tile]").forEach((it) => {
      const b = it.getBoundingClientRect();
      const scale = parseFloat(it.style.getPropertyValue("--s") || "1");
      const dist = Math.abs(e.clientX - (b.left + b.width / 2)) / (b.width / scale);
      const v = dist >= RADIUS ? 1 : 1 + (MAX - 1) * ((Math.cos((Math.PI * dist) / RADIUS) + 1) / 2);
      it.style.setProperty("--s", v.toFixed(3));
    });
  };
  const onLeave = () => ref.current?.querySelectorAll<HTMLElement>("[data-tile]").forEach((it) => it.style.setProperty("--s", "1"));

  return (
    <nav className={s.dock} ref={ref} aria-label={t.dock} onPointerMove={onMove} onPointerLeave={onLeave}>
      <ul className={s.dockList}>
        {tiles.map((tile, i) => (
          <li key={tile.path} className={s.tile} data-tile data-current={tile.path === path || undefined} data-phone={tile.phone === false ? "no" : undefined} style={{ "--tint": tile.tint } as CSSProperties}>
            {i === tiles.length - 2 && <span className={s.dockSep} aria-hidden="true" />}
            <a href={`${home}${tile.path}`} aria-current={tile.path === path ? "page" : undefined} aria-label={tile.label}>
              <span className={s.tileIcon}>
                <Mask name={tile.icon} />
              </span>
              <span className={s.tileLabel}>{tile.label}</span>
              <span className={s.tileShort} aria-hidden="true">
                {tile.short ?? tile.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
