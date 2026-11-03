import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import { Ridge } from "./Ridge";
import s from "./Origin.module.css";

// Where the name comes from: the Grassfields, the highlands of western Cameroon. Beside the words, the plate of the
// two reliefs: the Grassfield mark read as a contour map (a drawing, not a photograph).
export function Origin({ t }: { t: Dict["origin"] }) {
  return (
    <section className={`chapter alt ${s.origin}`} id="origin" aria-labelledby="origin-title">
      <div className={`wrap ${s.inner}`}>
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="origin-title">
            <Dot>{t.title}</Dot>
          </h2>
          <p className="lead">{t.body}</p>
        </div>
        <figure className={s.plate}>
          <div className={s.map} aria-hidden="true" />
          <Mask name="grassfield-logo-full" className={s.mark} />
          <figcaption className="cap-note">{t.legend}</figcaption>
        </figure>
      </div>
      <Ridge className={s.ridge} />
    </section>
  );
}
