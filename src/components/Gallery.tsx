import type { Dict, Locale } from "@/i18n";
import { byFeature, type Scene } from "@/lib/shots";
import { Clip } from "./Clip";
import { Dot } from "./Dot";
import { Frame, variantProps, variants } from "./Shot";
import s from "./Gallery.module.css";

type T = Dict["shots"];

// Widths the browser can count on (see globals.css: .wrap is 1120px + 2 × 22px, 16px gutters under 480px).
const SIZES = {
  wide: "(max-width: 480px) calc(100vw - 32px), (max-width: 1164px) calc(100vw - 44px), 1120px",
  half: "(max-width: 480px) calc(100vw - 32px), (max-width: 700px) calc(100vw - 44px), (max-width: 1164px) calc(50vw - 32px), 550px",
};

export const featureText = (t: T, feature: string) => (t.features as Record<string, { title: string; body: string }>)[feature] ?? t.other;

/**
 * One feature's captures: its screens (the first one wide), its close-ups, then its clips. Each capture links to
 * its full-size image (opened in the Lightbox when the page has one). With `anchors`, every scene gets an id
 * (`shot-<base>`) so other pages can link to it.
 */
export function FeatureBlock({ feature, scenes, t, level = 3, anchors = false, id, bare = false }: { feature: string; scenes: Scene[]; t: T; level?: 2 | 3; anchors?: boolean; id?: string; bare?: boolean }) {
  const text = featureText(t, feature);
  const H = level === 2 ? "h2" : "h3";
  const screens = scenes.filter((sc) => sc.kind === "screen");
  const details = scenes.filter((sc) => sc.kind === "detail");
  const clips = scenes.filter((sc) => sc.kind === "clip");
  const headId = `${id ?? feature}-title`;
  const anchor = (sc: Scene) => (anchors ? `shot-${sc.base}` : undefined);
  const caption = (title: string, body: string) => (
    <figcaption className={s.caption}>
      <b>{title}</b> {body}
    </figcaption>
  );
  // `bare`: inside a chapter that already names the feature (an app's section), no head of its own
  return (
    <section className={s.feature} id={id} aria-labelledby={bare ? undefined : headId} aria-label={bare ? text.title : undefined}>
      {!bare && (
        <div className={s.head}>
          <H className={level === 2 ? "h-2" : "h-3"} id={headId}>
            {text.title}
          </H>
          <p>{text.body}</p>
        </div>
      )}
      {screens.length > 0 && (
        <ul className={s.screens}>
          {screens.map((sc, i) => (
            <li key={sc.key} id={anchor(sc)} className={i === 0 && screens.length !== 2 ? s.wide : undefined}>
              {variants(sc, "auto").map(({ shot, v }) => (
                <figure key={shot.id} {...variantProps(v)}>
                  <Frame shot={shot} sizes={i === 0 && screens.length !== 2 ? SIZES.wide : SIZES.half} href label={t.enlarge} />
                  {caption(shot.title, shot.caption)}
                </figure>
              ))}
            </li>
          ))}
        </ul>
      )}
      {details.length > 0 && (
        <>
          <p className={s.sub}>{t.details}</p>
          <ul className={s.details}>
            {details.map((sc) => (
              <li key={sc.key} id={anchor(sc)}>
                {variants(sc, "auto").map(({ shot, v }) => {
                  const css = Math.round(shot.width / shot.scale); // never shown larger than its own pixels
                  return (
                    <figure key={shot.id} {...variantProps(v)}>
                      <Frame shot={shot} sizes={`(max-width: 480px) min(calc(100vw - 32px), ${css}px), ${Math.min(css, 360)}px`} className={s.detail} style={{ maxWidth: css }} href label={t.enlarge} />
                      {caption(shot.title, shot.caption)}
                    </figure>
                  );
                })}
              </li>
            ))}
          </ul>
        </>
      )}
      {clips.length > 0 && (
        <>
          <p className={s.sub}>{t.clips}</p>
          <ul className={s.clips}>
            {clips.map((sc) => (
              <li key={sc.key} id={anchor(sc)}>
                {variants(sc, "auto").map(({ shot, v }) => (
                  <figure key={shot.id} {...variantProps(v)}>
                    <Clip shot={shot} sizes={SIZES.half} t={{ play: t.play, pause: t.pause }} />
                    {caption(shot.title, shot.caption)}
                  </figure>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** A page's gallery chapter: the given features' captures not already shown by the page's chapters. */
export function Gallery({ lang, t, features, exclude, id = "captures", alt = false }: { lang: Locale; t: T; features: readonly string[]; exclude?: Set<string>; id?: string; alt?: boolean }) {
  const groups = byFeature(lang, Object.keys(t.features), { only: features, exclude });
  if (!groups.length) return null;
  return (
    <section className={`chapter ${alt ? "alt" : ""}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h2 className="h-1" id={`${id}-title`}>
            <Dot>{t.gallery.title}</Dot>
          </h2>
        </div>
        <div className={s.stack}>
          {groups.map((g) => (
            <FeatureBlock key={g.feature} feature={g.feature} scenes={g.scenes} t={t} id={`${id}-${g.feature}`} />
          ))}
        </div>
        <p className="cap-note">{t.note}</p>
      </div>
    </section>
  );
}
