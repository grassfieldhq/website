import type { Dict } from "@/i18n";
import { Mask } from "./Mask";
import s from "./Sections.module.css";

export function Install({ t }: { t: Dict["install"] }) {
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
        <p className={s.status}>{t.status}</p>
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
      </div>
    </section>
  );
}
