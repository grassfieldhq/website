import type { Dict, Locale } from "@/i18n";
import { Dot } from "./Dot";
import s from "./Teasers.module.css";

// Home's table of contents: one numbered row per page, between hairlines, as the contents of a survey.
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
        <ol className={s.list}>
          {t.items.map((it, i) => (
            <li key={it.href}>
              <a href={`/${lang}/${it.href}`} className={s.row}>
                <span className={s.n} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <b className={s.title}>{it.title}</b>
                <span className={s.body}>{it.body}</span>
                <span className={s.more} aria-hidden="true">
                  {more}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
