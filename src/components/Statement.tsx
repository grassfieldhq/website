import type { Dict, Locale } from "@/i18n";
import { WordReveal } from "./WordReveal";

// The statement, then three numbers measured in the Grassfield repository (where they come from in the note, all of
// them on the Download page).
export function Statement({ t, lang }: { t: Dict["statement"]; lang: Locale }) {
  return (
    <section className="chapter glow" id="desktop" aria-label={t.parts[0]?.text}>
      <div className="wrap">
        <WordReveal parts={t.parts} />
        <div className="stats">
          {t.stats.map((st) => (
            <div className="stat reveal" key={st.value}>
              <b>{st.value}</b>
              <span>{st.label}</span>
            </div>
          ))}
        </div>
        <p className="stats-note">
          {t.note}{" "}
          <a className="btn-link" href={`/${lang}/download/#numbers`}>
            {t.more}
          </a>
        </p>
      </div>
    </section>
  );
}
