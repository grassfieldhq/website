import type { Dict, Locale } from "@/i18n";
import { release } from "@/lib/release";
import { Mask } from "./Mask";
import s from "./Sections.module.css";

export function Install({ t, lang }: { t: Dict["install"]; lang: Locale }) {
  return (
    <section className={`chapter ${s.install}`} id="install" aria-labelledby="install-title">
      <div className="wrap">
        <Mask name="grassfield-logo" className={s.bigLogo} />
        <h2 className="h-1" id="install-title">
          {t.title}
        </h2>
        <p className="lead" style={{ margin: "18px auto 0" }}>
          {t.lead}
        </p>
        <p className={s.status}>
          Version {release.version} {t.status}
        </p>
        <ol className={s.steps}>
          {t.steps.map((st, i) => (
            <li key={st.title} className="reveal">
              <span className={s.n} aria-hidden="true">
                {i + 1}
              </span>
              <b>{st.title}</b>
              <p>{st.body}</p>
            </li>
          ))}
        </ol>
        <p style={{ marginTop: 40 }}>
          <a className="btn btn-primary" href={`/${lang}/download/`}>
            {t.cta}
          </a>
        </p>
      </div>
    </section>
  );
}
