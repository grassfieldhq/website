import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Mask } from "./Mask";
import s from "./AppsDetail.module.css";

// The apps page: one chapter per app, alternating sides; Settings carries the real capture.
export function AppsDetail({ apps, settingsAlt, captureNote }: { apps: Dict["appsDetail"]; settingsAlt: string; captureNote: string }) {
  return (
    <div className={s.list}>
      {apps.map((a, i) => (
        <section key={a.icon} className={`chapter ${i % 2 ? "alt" : ""}`} id={a.icon.toLowerCase()} aria-labelledby={`app-${a.icon}`}>
          <div className={`wrap ${s.row}`} data-flip={i % 2 || undefined}>
            <div className={s.text}>
              <img src={appIcon(a.icon)} width={88} height={88} alt="" className={s.icon} />
              <p className="eyebrow">{a.name}</p>
              <h2 className="h-2" id={`app-${a.icon}`}>
                {a.tagline}
              </h2>
              <p className="copy">{a.body}</p>
            </div>
            <div className={s.side}>
              {a.icon === "Settings" ? (
                <figure className="reveal">
                  <div className="capture">
                    <img src="/shots/settings.webp" width={880} height={760} alt={settingsAlt} loading="lazy" decoding="async" />
                  </div>
                  <figcaption className="cap-note">{captureNote}</figcaption>
                </figure>
              ) : (
                <ul className={`${s.points} reveal`}>
                  {a.points.map((p) => (
                    <li key={p}>
                      <Mask name="checkmark" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {a.icon === "Settings" && (
            <div className="wrap">
              <ul className={`${s.points} ${s.wide}`}>
                {a.points.map((p) => (
                  <li key={p}>
                    <Mask name="checkmark" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
