import type { Dict, Locale } from "@/i18n";
import { scenes } from "@/lib/shots";
import { Clock } from "./Clock";
import { Mask } from "./Mask";
import { Picture, primary } from "./Shot";
import { Stage } from "./Stage";
import { Wallpaper } from "./Wallpaper";
import s from "./SecurityScene.module.css";

// Scrolling locks the desktop: the real capture blurs and dims, the lock screen's clock rises, then a polkit sheet
// asks for the password. The sheet is drawn (no capture of it yet), in the session's own style.
export function SecurityScene({ t, locale, lang }: { t: Dict["scenes"]["security"]; locale: string; lang: Locale }) {
  const desktop = scenes(lang).find((sc) => sc.kind === "screen" && sc.base === "desktop");
  return (
    <Stage steps={t.steps} label={t.label}>
      <div className={s.desk}>{desktop ? <Picture shot={primary(desktop)} sizes="(max-width: 1200px) 100vw, 1180px" /> : <Wallpaper />}</div>
      <div className={s.lock}>
        <div className={s.date}>
          <Clock variant="date" locale={locale} placeholder="" />
        </div>
        <div className={s.time}>
          <Clock variant="time" locale={locale} placeholder="9:41" />
        </div>
        <div className={s.user}>
          <span className={s.av}>G</span>
          <span>{t.polkitUser}</span>
        </div>
      </div>
      <div className={s.sheet}>
        <span className={s.sheetIcon}>
          <Mask name="lock-fill" />
        </span>
        <b>{t.polkitTitle}</b>
        <p>{t.polkitBody}</p>
        <div className={s.field}>
          <span className={s.dots}>••••••••</span>
        </div>
        <div className={s.buttons}>
          <span>{t.cancel}</span>
          <span data-primary>{t.allow}</span>
        </div>
      </div>
    </Stage>
  );
}
