import type { Dict } from "@/i18n";
import s from "./Statement.module.css";

export function Statement({ t }: { t: Dict["statement"] }) {
  return (
    <section className="chapter" id="desktop" aria-label={t.parts[0]?.text}>
      <div className="wrap">
        <p className={`${s.statement} reveal`}>
          {t.parts.map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
        </p>
        <div className="stats">
          {t.stats.map((st) => (
            <div className="stat reveal" key={st.value}>
              <b>{st.value}</b>
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
