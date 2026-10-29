import type { Dict } from "@/i18n";
import { WordReveal } from "./WordReveal";

export function Statement({ t }: { t: Dict["statement"] }) {
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
      </div>
    </section>
  );
}
