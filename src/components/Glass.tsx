import type { Dict, Locale } from "@/i18n";
import { themePair } from "@/lib/shots";
import { Dot } from "./Dot";
import { GlassDemo } from "./GlassDemo";
import { Frame } from "./Shot";
import g from "./Gallery.module.css";

export function Glass({ t, lang, shots }: { t: Dict["glass"]; lang: Locale; shots: Dict["shots"] }) {
  // the proof under the demo: one real scene in both appearances, side by side
  const pair = themePair(lang);
  return (
    <section className="chapter alt" id="glass" aria-labelledby="glass-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="glass-title">
            {t.title[0]}
            <br />
            <Dot>{t.title[1]}</Dot>
          </h2>
          <p className="lead">
            {t.lead}
            <strong>{t.leadStrong}</strong>
            {t.leadAfter}
          </p>
        </div>
        <GlassDemo t={t} />
        {pair?.dark && pair.light && (
          <figure className={`${g.pair} reveal`}>
            <div className={g.pairRow}>
              {([[pair.dark, shots.dark], [pair.light, shots.light]] as const).map(([shot, label]) => (
                <div key={shot.id}>
                  <Frame shot={shot} sizes="(max-width: 700px) calc(100vw - 44px), (max-width: 1164px) calc(50vw - 32px), 550px" />
                  <span className={g.pairLabel}>{label}</span>
                </div>
              ))}
            </div>
            <figcaption className="cap-note">{shots.pair}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
