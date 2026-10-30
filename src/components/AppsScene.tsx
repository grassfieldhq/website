import type { CSSProperties } from "react";
import type { Dict, Locale } from "@/i18n";
import { scenes } from "@/lib/shots";
import { appIcon } from "@/lib/site";
import { Picture, primary } from "./Shot";
import { Stage } from "./Stage";
import { Wallpaper } from "./Wallpaper";
import s from "./AppsScene.module.css";

// Scrolling opens the four apps one after the other, each in its window with a real capture (the Store has no
// capture yet: its window is drawn). Windows cascade like a session filling up.
const windows = [
  { app: "Files", base: "files-icons", x: 60, y: 70, w: 820 },
  { app: "Settings", base: "settings-appearance", x: 420, y: 140, w: 760 },
  { app: "Preview", base: "preview-image", x: 180, y: 300, w: 700 },
  { app: "Store", base: null, x: 560, y: 360, w: 680 },
];

export function AppsScene({ t, names, lang }: { t: Dict["scenes"]["apps"]; names: string[]; lang: Locale }) {
  const all = scenes(lang);
  return (
    <Stage steps={t.steps} label={t.label} height={300}>
      <Wallpaper />
      {windows.map((w, i) => {
        const sc = w.base ? all.find((x) => x.kind === "screen" && x.base === w.base) : undefined;
        const shot = sc ? primary(sc) : undefined;
        // a capture is a full screen: the window keeps the capture's own window region, cropped from it
        return (
          <div key={w.app} className={s.win} style={{ "--i": i, "--x": w.x, "--y": w.y, "--w": w.w, "--ar": shot ? `${shot.width} / ${shot.height}` : "16 / 10" } as CSSProperties}>
            <div className={s.bar}>
              <span className={s.lights}>
                <i />
                <i />
                <i />
              </span>
              <b>{names[i]}</b>
            </div>
            <div className={s.body}>
              {shot ? (
                <Picture shot={shot} sizes="(max-width: 1200px) 70vw, 820px" />
              ) : (
                <div className={s.store}>
                  <img src={appIcon("Store")} width={96} height={96} alt="" />
                  <b>{names[i]}</b>
                  <p>{t.storeLine}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Stage>
  );
}
