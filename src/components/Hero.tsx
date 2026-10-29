import type { Dict } from "@/i18n";
import { DesktopScene } from "./DesktopScene";
import s from "./Hero.module.css";

export function Hero({ t, scene, locale }: { t: Dict["hero"]; scene: Dict["scene"]; locale: string }) {
  return (
    <header className={s.hero} id="top">
      <div className="wrap">
        <p className={`eyebrow ${s.in}`}>{t.eyebrow}</p>
        <h1 className={`h-hero ${s.in} ${s.d1}`}>
          <span className="grad">{t.title}</span>
        </h1>
        <p className={`lead ${s.lead} ${s.in} ${s.d2}`}>
          {t.leadBefore}
          <strong>{t.leadStrong}</strong>
          {t.leadAfter}
        </p>
        <div className={`${s.cta} ${s.in} ${s.d3}`}>
          <a className="btn btn-primary" href="#install">
            {t.cta}
          </a>
          <a className="btn btn-link" href="#desktop">
            {t.more}
          </a>
        </div>
      </div>
      <div className={`wrap ${s.art}`}>
        <div className={s.tilt}>
          <div className={`display ${s.display}`}>
            <DesktopScene t={scene} locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
