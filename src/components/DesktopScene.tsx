import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Clock } from "./Clock";
import { Dock } from "./Dock";
import { Mask } from "./Mask";
import { Wallpaper } from "./Wallpaper";
import s from "./Scene.module.css";

const sideIcons = ["person", "folder", "download", "laptop", "globe", "trash"];
const docKinds = ["MD", "TXT", "CSV", "PDF", "SH"];

export function MenuBar({ t, locale, app }: { t: Dict["scene"]; locale: string; app: string }) {
  return (
    <div className={s.mbar}>
      <Mask name="grassfield-logo" className={s.mlogo} />
      <b>{app}</b>
      {t.menus.map((m) => (
        <span key={m}>{m}</span>
      ))}
      <div className={s.mright}>
        <Mask name="wifi-3" />
        <Mask name="volume-2" />
        <Mask name="search" />
        <Mask name="control-center" />
        <Clock variant="bar" locale={locale} placeholder="" />
      </div>
    </div>
  );
}

export function DesktopScene({ t, locale }: { t: Dict["scene"]; locale: string }) {
  const folders = t.files.slice(0, 5);
  const docs = t.files.slice(5);
  return (
    <div className="screen" role="img" aria-label={t.label}>
      <Wallpaper />
      <MenuBar t={t} locale={locale} app={t.app} />

      <div className={s.win} style={{ left: "calc(var(--u) * 250)", top: "calc(var(--u) * 120)", width: "calc(var(--u) * 820)", height: "calc(var(--u) * 520)" }}>
        <div className={s.side}>
          <div className={s.lights}>
            <i />
            <i />
            <i />
          </div>
          <span className={s.group}>{t.favourites}</span>
          {t.sidebar.slice(0, 3).map((label, i) => (
            <span key={label} data-on={i === 1 || undefined}>
              <Mask name={sideIcons[i]!} />
              {label}
            </span>
          ))}
          <span className={s.group}>{t.locations}</span>
          {t.sidebar.slice(3).map((label, i) => (
            <span key={label}>
              <Mask name={sideIcons[i + 3]!} />
              {label}
            </span>
          ))}
        </div>
        <div className={s.main}>
          <div className={s.bar}>
            <span className={s.chev}>‹ ›</span>
            <b>{t.folder}</b>
            <span className={s.field}>
              <Mask name="search" />
              {t.search}
            </span>
          </div>
          <div className={s.files}>
            {folders.map((f, i) => (
              <div key={f} className={s.file} data-sel={i === 1 || undefined}>
                <img src={appIcon("Files")} alt="" />
                <span>{f}</span>
              </div>
            ))}
            {docs.map((f, i) => (
              <div key={f} className={s.file}>
                <div className={s.doc} data-x={docKinds[i]} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.banner}>
        <img src={appIcon("Store")} alt="" />
        <div>
          <b>{t.bannerTitle}</b>
          <span>{t.bannerBody}</span>
        </div>
        <time>{t.now}</time>
      </div>

      <Dock t={t.dock} />
    </div>
  );
}
