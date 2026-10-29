import type { Dict, Locale } from "@/i18n";
import { scenes, type Scene } from "@/lib/shots";
import { Dot } from "./Dot";
import { featureText } from "./Gallery";
import { Shot } from "./Shot";
import s from "./TourStrip.module.css";

// Home: a few real captures, one per feature in this order, each opening its place in the guided tour.
const ORDER = ["widgets", "desktop", "overview", "controlcenter", "files", "settings", "tiling", "search", "apps", "notifications", "dialogs", "update", "lock"];
const MAX = 6;

export function TourStrip({ t, shots, lang }: { t: Dict["tour"]["strip"]; shots: Dict["shots"]; lang: Locale }) {
  const screens = scenes(lang).filter((sc) => sc.kind === "screen");
  const picks = ORDER.map((f) => screens.find((sc) => sc.feature === f)).filter((sc): sc is Scene => !!sc);
  for (const sc of screens) if (picks.length < MAX && !picks.includes(sc)) picks.push(sc);
  if (!picks.length) return null;
  return (
    <section className="chapter stage" id="tour" aria-labelledby="tour-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="tour-title">
            {t.title[0]}
            <br />
            <span className="grad">
              <Dot>{t.title[1]}</Dot>
            </span>
          </h2>
          <p className="lead">{t.lead}</p>
        </div>
        <ul className={s.grid}>
          {picks.slice(0, MAX).map((sc) => (
            <li key={sc.key} className="reveal">
              <a className={s.card} href={`/${lang}/tour/#shot-${sc.base}`}>
                <Shot scene={sc} mode="dark" sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 900px) calc(50vw - 32px), 360px" />
                <span className={s.title}>{featureText(shots, sc.feature).title}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className={s.cta}>
          <a className="btn btn-primary" href={`/${lang}/tour/`}>
            {t.cta}
          </a>
        </p>
      </div>
    </section>
  );
}
