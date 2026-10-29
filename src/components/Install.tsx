import type { Dict, Locale } from "@/i18n";
import { release } from "@/lib/release";
import { Dot } from "./Dot";
import { Landscape } from "./Landscape";
import { Mask } from "./Mask";
import s from "./Sections.module.css";

// The finale: the same field at dusk, closing the page.
export function Install({ t, lang }: { t: Dict["install"]; lang: Locale }) {
  return (
    <section className={`chapter finale ${s.install}`} id="install" aria-labelledby="install-title">
      <Landscape variant="dusk" className={s.finaleLand} />
      <div className={`wrap ${s.finaleInner}`}>
        <Mask name="grassfield-logo" className={s.bigLogo} />
        <h2 className="h-1" id="install-title">
          <Dot>{t.title}</Dot>
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
