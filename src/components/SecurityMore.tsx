import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import s from "./SecurityMore.module.css";

export function SecurityMore({ t }: { t: Dict["securityMore"] }) {
  return (
    <section className="chapter" aria-labelledby="secmore-title">
      <div className="wrap">
        <h2 className="h-1" id="secmore-title" style={{ marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <Dot>{t.title}</Dot>
        </h2>
        <ul className={s.grid}>
          {t.items.map((it) => (
            <li key={it.title} className="reveal">
              <span className={s.icon}>
                <Mask name={it.icon} />
              </span>
              <b>{it.title}</b>
              <p>{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
