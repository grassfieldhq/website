import type { Dict } from "@/i18n";
import { DesktopScene } from "./DesktopScene";
import { ParallaxHero } from "./ParallaxHero";
import { Dot } from "./Dot";
import s from "./Hero.module.css";

export function Hero({ t, scene, locale, lang }: { t: Dict["hero"]; scene: Dict["scene"]; locale: string; lang: string }) {
  return (
    <header className={s.hero} id="top">
      <ParallaxHero
        copy={
          <div className="wrap">
            <p className={`eyebrow ${s.eyebrow} ${s.in}`}>{t.eyebrow}</p>
            <h1 className={`h-hero ${s.title} ${s.in} ${s.d1}`}>
              <Dot>{t.title}</Dot>
            </h1>
            <p className={`lead ${s.lead} ${s.in} ${s.d2}`}>
              {t.leadBefore}
              <strong>{t.leadStrong}</strong>
              {t.leadAfter}
            </p>
            <div className={`${s.cta} ${s.in} ${s.d3}`}>
              <a className="btn btn-primary" href={`/${lang}/download/`}>
                {t.cta}
              </a>
              <a className={`btn btn-link ${s.more}`} href={`/${lang}/os/`}>
                {t.more}
              </a>
            </div>
          </div>
        }
        display={
          <div className={`display ${s.display}`}>
            <DesktopScene t={scene} locale={locale} />
          </div>
        }
      />
    </header>
  );
}
