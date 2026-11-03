import type { Dict, Locale } from "@/i18n";
import { scenes } from "@/lib/shots";
import { DesktopScene } from "./DesktopScene";
import { Dot } from "./Dot";
import { Ridge } from "./Ridge";
import { Picture, variants, variantProps } from "./Shot";
import s from "./Hero.module.css";

// Home's head: the name over a contour map of the two reliefs, then the real desktop, captured on the development
// instance in the visitor's appearance, standing on the plateau's ridge as the first figure. The drawn desktop stands
// in only when the capture set has no desktop.
export function Hero({ t, scene, locale, lang }: { t: Dict["hero"]; scene: Dict["scene"]; locale: string; lang: Locale }) {
  const desk = scenes(lang).find((sc) => sc.kind === "screen" && sc.base === "desktop");
  return (
    <header className={s.hero} id="top">
      <div className="contours" aria-hidden="true" />
      <div className={`wrap ${s.copy}`}>
        <p className={`eyebrow ${s.in}`}>{t.eyebrow}</p>
        <h1 className={`h-hero ${s.title} ${s.in} ${s.d1}`}>
          <Dot>{t.title}</Dot>
        </h1>
        <div className={`${s.intro} ${s.in} ${s.d2}`}>
          <p className="lead">
            {t.leadBefore}
            <strong>{t.leadStrong}</strong>
            {t.leadAfter}
          </p>
          <div className={s.cta}>
            <a className="btn btn-primary" href={`/${lang}/os/`}>
              {t.cta}
            </a>
            <a className="btn-link" href={`/${lang}/download/`}>
              {t.more}
            </a>
          </div>
        </div>
      </div>
      <figure className={s.figure}>
        <Ridge className={s.ridge} />
        <div className={`wrap ${s.plate}`}>
          <div className="display">
            {desk ? (
              <div className="screen">
                {variants(desk, "auto").map(({ shot, v }) => (
                  <span key={shot.id} {...variantProps(v, s.layer)}>
                    <Picture shot={shot} sizes="(max-width: 1264px) 94vw, 1200px" />
                  </span>
                ))}
              </div>
            ) : (
              <DesktopScene t={scene} locale={locale} />
            )}
          </div>
          <figcaption className="cap-note">{t.figure}</figcaption>
        </div>
      </figure>
    </header>
  );
}
