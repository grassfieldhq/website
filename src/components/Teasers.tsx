import type { Dict, Locale } from "@/i18n";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import s from "./Teasers.module.css";

// Home: one card per page, as an index of the system.
export function Teasers({ t, more, lang }: { t: Dict["teasers"]; more: string; lang: Locale }) {
  return (
    <section className="chapter" aria-labelledby="teasers-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="teasers-title">
            {t.title[0]}
            <br />
            <span className="grad">
              <Dot>{t.title[1]}</Dot>
            </span>
          </h2>
        </div>
        <ul className={s.grid}>
          {t.items.map((it) => (
            <li key={it.href} className="reveal">
              <a href={`/${lang}/${it.href}`} className={s.card}>
                <span className={s.icon}>
                  <Mask name={it.icon} />
                </span>
                <b>{it.title}</b>
                <p>{it.body}</p>
                <span className={s.more}>{more}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
