import type { Dict } from "@/i18n";
import { release } from "@/lib/release";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import s from "./Roadmap.module.css";

// Grassfield OS is the product; the desktop is its first step. Step 2 follows the master plan's M6 (ISO from
// omarchy-iso, signed repository, VM install/update matrix, recovery guide) and carries no date on purpose.
export function Roadmap({ t }: { t: Dict["roadmap"] }) {
  return (
    <section className="chapter" id="roadmap" aria-labelledby="roadmap-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="roadmap-title">
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
        <ol className={s.road}>
          {t.steps.map((st, i) => (
            <li key={st.name} className={`${s.step} reveal`} data-now={i === 0 || undefined}>
              <span className={s.node} aria-hidden="true" />
              <div className={s.card}>
                <div className={s.head}>
                  <span className={s.n}>{st.n}</span>
                  <span className={s.status}>
                    {st.status}
                    {i === 0 && <span className="tnum"> · {release.version}</span>}
                  </span>
                </div>
                <h3 className="h-2">{st.name}</h3>
                <p className={s.body}>{st.body}</p>
                <ul className={s.points}>
                  {st.points.map((p) => (
                    <li key={p}>
                      <Mask name={i === 0 ? "checkmark" : "plus"} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <p className={s.note}>{t.note}</p>
      </div>
    </section>
  );
}
