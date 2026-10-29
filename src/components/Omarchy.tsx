import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import s from "./Sections.module.css";

export function Omarchy({ t }: { t: Dict["omarchy"] }) {
  return (
    <section className="chapter alt" id="omarchy" aria-labelledby="omarchy-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="omarchy-title">
            <Dot>{t.title}</Dot>
          </h2>
          <p className="lead">
            {t.lead}
            <strong>{t.leadStrong}</strong>
          </p>
        </div>
        <dl className={s.specs}>
          {t.specs.map((sp) => (
            <div key={sp.k} className="reveal">
              <dt>{sp.k}</dt>
              <dd>
                <b>{sp.v}</b>
                <p>{sp.p}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
