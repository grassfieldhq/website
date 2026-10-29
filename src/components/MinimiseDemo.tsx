"use client";

import { useState } from "react";
import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Mask } from "./Mask";
import { Wallpaper } from "./Wallpaper";
import sc from "./Scene.module.css";
import s from "./Proof.module.css";

// The window tucks into its Dock slot (the thumbnail before the Trash), as grassfield-compositor's animated minimise does.
export function MinimiseDemo({ t }: { t: Dict["proof"] }) {
  const [min, setMin] = useState(false);
  return (
    <div className={s.demoWrap}>
      <div className="mini" style={{ ["--ar" as string]: "16 / 10" }} data-min={min || undefined}>
        <Wallpaper />
        <div className={s.win} aria-hidden={min || undefined} inert={min || undefined}>
          <div className={s.bar}>
            <span className={s.lights}>
              <i />
              <button type="button" className={s.yellow} onClick={() => setMin(true)} aria-label={t.minimise} />
              <i />
            </span>
            <b>{t.demoTitle}</b>
          </div>
          <div className={s.body}>
            <h4>{t.demoBody[0]}</h4>
            {t.demoBody.slice(1).map((line) => (
              <p key={line}>
                <span className={s.box} aria-hidden="true" />
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className={sc.dock}>
          <div className={sc.it} data-run>
            <img src={appIcon("Files")} alt="" />
          </div>
          <div className={sc.it}>
            <div className={`${sc.dk} ${sc.apps}`}>
              <Mask name="apps" />
            </div>
          </div>
          <div className={sc.it}>
            <img src={appIcon("Preview")} alt="" />
          </div>
          <div className={sc.sep} />
          <button type="button" className={`${sc.it} ${s.thumb}`} onClick={() => setMin(false)} aria-label={t.restore} tabIndex={min ? 0 : -1} aria-hidden={!min || undefined}>
            <span />
          </button>
          <div className={sc.it}>
            <div className={`${sc.dk} ${sc.bin}`}>
              <Mask name="trash" />
            </div>
          </div>
        </div>
      </div>
      <p className={s.hint} aria-live="polite">
        {min ? t.hintBack : t.hint}
      </p>
    </div>
  );
}
