import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import s from "./Sections.module.css";

export function Apps({ t, captureNote }: { t: Dict["apps"]; captureNote: string }) {
  return (
    <section className="chapter" id="apps" aria-labelledby="apps-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="apps-title">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
        </div>
        <ul className={s.apps}>
          {t.list.map((a) => (
            <li key={a.icon} className="reveal">
              <img src={appIcon(a.icon)} width={76} height={76} alt="" />
              <b>{a.name}</b>
              <p>{a.body}</p>
              {a.tag && <span className="tag">{a.tag}</span>}
            </li>
          ))}
        </ul>
        <div className={s.split}>
          <div>
            <h3 className="h-2">
              {t.settingsTitle}
              <br />
              <span className="grad">{t.settingsTitle2}</span>
            </h3>
            <p className="copy" style={{ marginTop: 18 }}>
              {t.settingsBody}
            </p>
          </div>
          <figure className="reveal">
            <div className="capture">
              <img src="/shots/settings.webp" width={880} height={760} alt={t.settingsAlt} loading="lazy" decoding="async" />
            </div>
            <figcaption className="cap-note">{captureNote}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
