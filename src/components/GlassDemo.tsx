"use client";

import { useState, type CSSProperties } from "react";
import type { Dict } from "@/i18n";
import { Wallpaper } from "./Wallpaper";
import s from "./Glass.module.css";

// Accent pairs from grassfield tokens.json: [dark fill, dark ink, light fill, light ink].
const ACCENTS: [string, string, string, string][] = [
  ["#4FB36B", "#06240F", "#26763F", "#FFFFFF"],
  ["#5AA2FF", "#06182E", "#1F5FCC", "#FFFFFF"],
  ["#B48CF2", "#1E0A3A", "#7A3FC4", "#FFFFFF"],
  ["#F07AB0", "#3A0820", "#C2306F", "#FFFFFF"],
  ["#F2766E", "#3A0804", "#C0302A", "#FFFFFF"],
  ["#F5A04A", "#331800", "#964D08", "#FFFFFF"],
  ["#F2D14B", "#2B2300", "#E0B000", "#241C00"],
  ["#8BD34E", "#10240A", "#3A7512", "#FFFFFF"],
  ["#A0A4AE", "#121316", "#5C616B", "#FFFFFF"],
];

export function GlassDemo({ t }: { t: Dict["glass"] }) {
  const [transparency, setTransparency] = useState(25);
  const [accent, setAccent] = useState(0);
  const [look, setLook] = useState<"light" | "dark">("dark");
  const a = ACCENTS[accent]!;
  const [fill, ink] = look === "dark" ? [a[0], a[1]] : [a[2], a[3]];

  return (
    <div className={s.demo}>
      <div className="mini reveal" style={{ ["--ar" as string]: "4 / 3", borderRadius: "var(--r-tile)" }} role="img" aria-label={`${t.panelTitle}: ${t.transparency} ${`${transparency}${t.percentSuffix}`}, ${t.accents[accent]}, ${look === "dark" ? t.dark : t.light}`}>
        <Wallpaper ratio={4 / 3} />
        <div className={s.panel} data-look={look} style={{ "--t": transparency / 100, "--ac": fill, "--ac-ink": ink } as CSSProperties}>
          <b className={s.h}>{t.panelTitle}</b>
          <div className={s.row}>
            <span>{t.reduceMotion}</span>
            <span className={s.toggle} />
          </div>
          <div className={s.row}>
            <span>{t.iconSize}</span>
          </div>
          <div className={s.bar} />
          <div className={s.btns}>
            <span>{t.cancel}</span>
            <span data-primary>{t.apply}</span>
          </div>
        </div>
      </div>

      <div className={s.controls}>
        <div className={s.ctrl}>
          <label htmlFor="glass-transparency">
            {t.transparency}
            <output htmlFor="glass-transparency">{`${transparency}${t.percentSuffix}`}</output>
          </label>
          <input id="glass-transparency" type="range" min={0} max={60} step={1} value={transparency} onChange={(e) => setTransparency(Number(e.target.value))} />
        </div>
        <fieldset className={s.ctrl}>
          <legend>
            {t.accent}
            <output>{t.accents[accent]}</output>
          </legend>
          <div className={s.swatches}>
            {ACCENTS.map((c, i) => (
              <button
                key={c[0]}
                id={`glass-accent-${i}`}
                type="button"
                className={s.sw}
                style={{ "--c": look === "dark" ? c[0] : c[2] } as CSSProperties}
                aria-label={t.accents[i]}
                aria-pressed={i === accent}
                onClick={() => setAccent(i)}
              />
            ))}
          </div>
        </fieldset>
        <fieldset className={s.ctrl}>
          <legend>{t.appearance}</legend>
          <div className={s.seg}>
            {(["light", "dark"] as const).map((v) => (
              <button key={v} id={`glass-look-${v}`} type="button" aria-pressed={look === v} onClick={() => setLook(v)}>
                {v === "light" ? t.light : t.dark}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="small">{t.note}</p>
      </div>
    </div>
  );
}
