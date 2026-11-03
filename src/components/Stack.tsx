import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import s from "./Stack.module.css";

// How Grassfield OS is built, as layers from the apps down to the foundations: what Grassfield brings and what it
// stands on. Drawn as strata, from the field's green at the top to the earth at the bottom.
export function Stack({ t }: { t: Dict["stack"] }) {
  return (
    <section className="chapter alt" id="stack" aria-labelledby="stack-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="stack-title">
            {t.title[0]}
            <br />
            <span className="grad">
              <Dot>{t.title[1]}</Dot>
            </span>
          </h2>
          <p className="lead">
            {t.lead}
            <strong>{t.leadStrong}</strong>
          </p>
        </div>
        <ol className={s.layers} aria-label={t.label}>
          {t.layers.map((layer) => (
            <li key={layer.name} className={`${s.layer} reveal`}>
              <div className={s.head}>
                <h3 className="h-3">{layer.name}</h3>
                {layer.tech && <span className={s.tech}>{layer.tech}</span>}
              </div>
              <div className={s.detail}>
                <p>{layer.body}</p>
                <ul className={s.items}>
                  {layer.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <p className={`small ${s.note}`}>{t.note}</p>
      </div>
    </section>
  );
}
