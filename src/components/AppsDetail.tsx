import type { Dict, Locale } from "@/i18n";
import { appIcon } from "@/lib/site";
import { byFeature, pageFeatures, slot } from "@/lib/shots";
import { FeatureBlock } from "./Gallery";
import { Mask } from "./Mask";
import { Shot } from "./Shot";
import s from "./AppsDetail.module.css";

// The apps page: one chapter per app, alternating sides; Settings carries a real capture beside its text, and every
// app shows the captures of its features below (see pageFeatures in lib/shots.ts).
export function AppsDetail({ apps, captureNote, lang, shots }: { apps: Dict["appsDetail"]; captureNote: string; lang: Locale; shots: Dict["shots"] }) {
  const settings = slot(lang, "settings");
  const exclude = new Set(settings ? [settings.scene.key] : []);
  const order = Object.keys(shots.features);
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
              {a.icon === "Settings" && settings ? (
                <figure className="reveal">
                  <Shot scene={settings.scene} sizes="(max-width: 900px) calc(100vw - 44px), 600px" />
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
          {a.icon === "Settings" && settings && (
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
          {byFeature(lang, order, { only: pageFeatures.apps[a.icon] ?? [], exclude }).map((g) => (
            <div key={g.feature} className="wrap" style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
              <FeatureBlock feature={g.feature} scenes={g.scenes} t={shots} bare={g.feature === pageFeatures.apps[a.icon]?.[0]} id={`${a.icon.toLowerCase()}-${g.feature}`} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
