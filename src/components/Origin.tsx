import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import { Landscape } from "./Landscape";
import s from "./Origin.module.css";

// Where the name comes from: the Grassfields, the highlands of western Cameroon, told over the Grassfield field
// in the late morning (the drawing, not a photograph).
export function Origin({ t }: { t: Dict["origin"] }) {
  return (
    <section className={`chapter ${s.origin}`} id="origin" aria-labelledby="origin-title">
      <Landscape className={s.land} time={0.32} />
      <div className={`wrap ${s.inner}`}>
        <p className={`eyebrow ${s.eyebrow}`}>{t.eyebrow}</p>
        <h2 className="h-1" id="origin-title">
          <Dot>{t.title}</Dot>
        </h2>
        <p className={`lead ${s.lead}`}>{t.body}</p>
      </div>
    </section>
  );
}
