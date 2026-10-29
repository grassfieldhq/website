import type { Dict, Locale } from "@/i18n";
import { slot } from "@/lib/shots";
import { Dot } from "./Dot";
import { Clock } from "./Clock";
import { Mask } from "./Mask";
import { Shot } from "./Shot";
import { Wallpaper } from "./Wallpaper";
import s from "./Security.module.css";

export function Security({ t, locale, lang }: { t: Dict["security"]; locale: string; lang: Locale }) {
  const lock = slot(lang, "lock"); // the real lock screen when the capture set has one, else the drawn one
  return (
    <section className="chapter stage" id="security" aria-labelledby="security-title">
      <div className={`wrap ${s.grid}`}>
        {lock ? (
          <div className="reveal">
            <Shot scene={lock.scene} mode="dark" sizes="(max-width: 900px) calc(100vw - 44px), 620px" />
          </div>
        ) : (
        <div className="display reveal">
          <div className={`screen ${s.lock}`} role="img" aria-label={t.label}>
            <Wallpaper className={`wp ${s.blur}`} />
            <div className={s.date}>
              <Clock variant="date" locale={locale} placeholder="" />
            </div>
            <div className={s.time}>
              <Clock variant="time" locale={locale} placeholder="9:41" />
            </div>
            <div className={s.user}>
              <span className={s.av}>G</span>
              <span>Grassfield</span>
              <span className={s.pw}>{t.password}</span>
            </div>
          </div>
        </div>
        )}
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="security-title" style={{ marginTop: 14 }}>
            {t.title[0]}
            <br />
            <Dot>{t.title[1]}</Dot>
          </h2>
          <ul className={s.facts}>
            {t.facts.map((f) => (
              <li key={f.title}>
                <span className={s.ic}>
                  <Mask name={f.icon} />
                </span>
                <div>
                  <b>{f.title}</b>
                  <span>{f.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
