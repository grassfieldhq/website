import type { Dict, Locale } from "@/i18n";
import { slot } from "@/lib/shots";
import { Dot } from "./Dot";
import { OverviewScrub } from "./OverviewScrub";
import { Shot } from "./Shot";

export function Overview({ t, scene, locale, lang }: { t: Dict["overview"]; scene: Dict["scene"]; locale: string; lang: Locale }) {
  const capture = slot(lang, "overview");
  return (
    <section className="chapter stage" id="overview" aria-labelledby="overview-title">
      <div className="wrap">
        <div className="chapter-head center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="overview-title">
            {t.title[0]}
            <br />
            <Dot>{t.title[1]}</Dot>
          </h2>
        </div>
      </div>
      <OverviewScrub t={t} scene={scene} locale={locale} />
      <div className="wrap">
        <p className="lead" style={{ margin: "clamp(48px, 7vw, 96px) auto clamp(40px, 5vw, 64px)", textAlign: "center" }}>
          {t.lead}
          <strong>{t.leadStrong}</strong>
          {t.leadAfter}
        </p>
        {capture && (
          <figure className="reveal" style={{ maxWidth: 1240, marginInline: "auto" }}>
            {/* an always-dark chapter: the dark capture, whatever the site's appearance */}
            <Shot scene={capture.scene} mode="dark" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 1164px) calc(100vw - 44px), 1120px" />
            <figcaption className="cap-note" style={{ justifyContent: "center" }}>
              {t.captureNote}
            </figcaption>
          </figure>
        )}
        <div className="stats">
          {t.stats.map((st) => (
            <div className="stat reveal" key={st.value}>
              <b>{st.value}</b>
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
