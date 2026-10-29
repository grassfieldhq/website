import type { Dict } from "@/i18n";
import { release } from "@/lib/release";
import { Command } from "./Command";
import { Mask } from "./Mask";
import s from "./Reversible.module.css";

export function Reversible({ t, copy, copied }: { t: Dict["reversible"]; copy: string; copied: string }) {
  return (
    <section className="chapter" id="reversible" aria-labelledby="reversible-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="reversible-title">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
          <p className="lead">{t.lead}</p>
        </div>
        <div className={s.lists}>
          <div className="reveal">
            <h3 className="h-3">{t.addedTitle}</h3>
            <ul>
              {t.added.map((x) => (
                <li key={x}>
                  <Mask name="plus" className={s.plus} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <h3 className="h-3">{t.neverTitle}</h3>
            <ul>
              {t.never.map((x) => (
                <li key={x}>
                  <Mask name="lock-fill" className={s.lock} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <h3 className={`h-2 ${s.backTitle}`}>{t.backTitle}</h3>
        <div className={s.ways}>
          <article className="reveal">
            <b>{t.switchTitle}</b>
            <p>{t.switchBody}</p>
            <Command cmd={t.switchCmd} copy={copy} copied={copied} />
          </article>
          <article className="reveal">
            <b>{t.removeTitle}</b>
            <p>{t.removeBody}</p>
            <Command cmd={release.uninstall} copy={copy} copied={copied} />
          </article>
        </div>
      </div>
    </section>
  );
}
