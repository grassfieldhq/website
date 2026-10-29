import { Dot } from "./Dot";
import { Landscape } from "./Landscape";
import s from "./PageHero.module.css";

// The head of an inner page: the same field at dawn, framed as a panel, with the page's title over the sky.
export function PageHero({ eyebrow, heading, lead }: { eyebrow: string; heading: string; lead: string }) {
  return (
    <header className={s.hero}>
      <Landscape className={s.land} p={0.55} />
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
