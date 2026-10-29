import type { Dict } from "@/i18n";
import { MinimiseDemo } from "./MinimiseDemo";
import s from "./Proof.module.css";

export function Proof({ t }: { t: Dict["proof"] }) {
  return (
    <section className="chapter alt" id="proof" aria-labelledby="proof-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="proof-title">
            {t.title[0]}
            <br />
            <span className="grad">{t.title[1]}</span>
          </h2>
          <p className="lead">
            {t.lead}
            <strong>{t.leadStrong}</strong>
          </p>
        </div>
        <MinimiseDemo t={t} />
        <ul className={s.items}>
          {t.items.map((it) => (
            <li key={it.title} className="reveal">
              <b>{it.title}</b>
              <p>{it.body}</p>
              <code>{it.how}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
