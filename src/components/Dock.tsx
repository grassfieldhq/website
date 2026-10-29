"use client";

import { useRef } from "react";
import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Mask } from "./Mask";
import s from "./Scene.module.css";

// Magnification as in grassfield tokens.json: dock.magnificationMax 1.6 over a radius of 3 icons.
const MAX = 1.6;
const RADIUS = 3;

function Item({ label, run, children }: { label: string; run?: boolean; children: React.ReactNode }) {
  return (
    <div className={s.it} data-it data-run={run || undefined}>
      {children}
      <span className={s.tip}>{label}</span>
    </div>
  );
}

export function Dock({ t }: { t: Dict["scene"]["dock"] }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = ref.current?.querySelectorAll<HTMLElement>("[data-it]");
    items?.forEach((it) => {
      const b = it.getBoundingClientRect();
      const scale = parseFloat(it.style.getPropertyValue("--s") || "1");
      const base = b.width / scale;
      const dist = Math.abs(e.clientX - (b.left + b.width / 2)) / base;
      const v = dist >= RADIUS ? 1 : 1 + (MAX - 1) * ((Math.cos((Math.PI * dist) / RADIUS) + 1) / 2);
      it.style.setProperty("--s", v.toFixed(3));
    });
  };
  const onLeave = () => ref.current?.querySelectorAll<HTMLElement>("[data-it]").forEach((it) => it.style.setProperty("--s", "1"));

  return (
    <div className={s.dock} ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <Item label={t.files} run>
        <img src={appIcon("Files")} alt="" />
      </Item>
      <Item label={t.apps}>
        <div className={`${s.dk} ${s.apps}`}>
          <Mask name="apps" />
        </div>
      </Item>
      <Item label={t.terminal}>
        <div className={`${s.dk} ${s.term}`}>&gt;_</div>
      </Item>
      <Item label={t.settings} run>
        <img src={appIcon("Settings")} alt="" />
      </Item>
      <Item label={t.preview}>
        <img src={appIcon("Preview")} alt="" />
      </Item>
      <Item label={t.store}>
        <img src={appIcon("Store")} alt="" />
      </Item>
      <div className={s.sep} />
      <Item label={t.trash}>
        <div className={`${s.dk} ${s.bin}`}>
          <Mask name="trash" />
        </div>
      </Item>
    </div>
  );
}
