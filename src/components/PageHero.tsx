import { Dot } from "./Dot";
import { Landscape } from "./Landscape";
import s from "./PageHero.module.css";

// The head of an inner page: the same field, framed as a panel, with the page's title over the sky. `time` is the
// hour of the site's day this page sits at (0 dawn, 1 dusk): the sun advances from page to page.
export function PageHero({ eyebrow, heading, lead, time = 0.3 }: { eyebrow: string; heading: string; lead: string; time?: number }) {
  return (
    <header className={s.hero}>
      <Landscape className={s.land} p={0.55} time={time} shared />
      <div className={`wrap ${s.copy}`}>
        <p className={`eyebrow ${s.eyebrow}`}>{eyebrow}</p>
        <h1 className="h-1">
          <Dot>{heading}</Dot>
        </h1>
        <p className={`lead ${s.lead}`}>{lead}</p>
      </div>
    </header>
  );
}
