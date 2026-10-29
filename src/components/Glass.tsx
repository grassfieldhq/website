import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import { GlassDemo } from "./GlassDemo";

export function Glass({ t }: { t: Dict["glass"] }) {
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
      </div>
    </section>
  );
}
