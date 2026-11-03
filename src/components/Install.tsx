import type { Dict, Locale } from "@/i18n";
import { release } from "@/lib/release";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import { Ridge } from "./Ridge";
import s from "./Sections.module.css";

// The finale: night on the plateau, the ridge at dusk, the three steps of the install.
export function Install({ t, lang }: { t: Dict["install"]; lang: Locale }) {
  return (
    <section className={`chapter stage ${s.install}`} id="install" aria-labelledby="install-title">
      <div className="contours" aria-hidden="true" />
      <div className={`wrap ${s.finaleInner}`}>
        <div className="chapter-head">
          <Mask name="grassfield-logo-full" className={s.bigLogo} />
          <h2 className="h-1" id="install-title">
            <Dot>{t.title}</Dot>
          </h2>
          <p className="lead">{t.lead}</p>
          <p className={s.status}>
            Version {release.version} {t.status}
          </p>
        </div>
        <ol className={s.steps}>
          {t.steps.map((st, i) => (
            <li key={st.title}>
              <span className={s.n} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b>{st.title}</b>
              <p>{st.body}</p>
            </li>
          ))}
        </ol>
        <p className={s.finaleCta}>
          <a className="btn btn-primary" href={`/${lang}/download/`}>
            {t.cta}
          </a>
        </p>
      </div>
      <Ridge variant="dusk" className={s.finaleRidge} />
    </section>
  );
}
