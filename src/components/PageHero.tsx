import { Dot } from "./Dot";
import s from "./PageHero.module.css";

// The head of an inner page: the eyebrow on its rule, the title, the lead, over the contour map of the two reliefs.
export function PageHero({ eyebrow, heading, lead }: { eyebrow: string; heading: string; lead: string }) {
  return (
    <header className={s.hero}>
      <div className="contours" aria-hidden="true" />
      <div className={`wrap ${s.copy}`}>
        <p className={`eyebrow ${s.eyebrow}`}>{eyebrow}</p>
        <h1 className={`h-1 ${s.title}`}>
          <Dot>{heading}</Dot>
        </h1>
        <p className="lead">{lead}</p>
      </div>
    </header>
  );
}
