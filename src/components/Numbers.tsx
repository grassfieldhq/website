import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import s from "./Numbers.module.css";

export function Numbers({ t }: { t: Dict["numbers"] }) {
  return (
    <section className="chapter stage" id="numbers" aria-labelledby="numbers-title">
      <div className="wrap">
        <div className="chapter-head center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="numbers-title">
            <Dot>{t.title}</Dot>
          </h2>
        </div>
        <dl className={s.grid}>
          {t.items.map((it) => (
            <div key={it.value} className="reveal">
              <dt className="grad">{it.value}</dt>
              <dd>{it.label}</dd>
            </div>
          ))}
        </dl>
        <p className={s.note}>{t.note}</p>
      </div>
    </section>
  );
}
