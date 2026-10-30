import type { Dict, Locale } from "@/i18n";
import { appIcon } from "@/lib/site";
import { resolveTiles, tileGroups, type ResolvedTile } from "@/lib/system";
import { Dot } from "./Dot";
import { Mask } from "./Mask";
import { Picture, variantProps, variants } from "./Shot";
import s from "./SystemMap.module.css";

// "Everything in the system": the surfaces of Grassfield OS as a grid of tiles, each a real close-up that opens its
// capture in the guided tour. `summary` is the home page's short version (a dark stage that leads to the OS page);
// the full version groups every tile as the desktop, the apps and the system.
type T = Dict["system"];

// the media box is as tall on both widths; the image covers it, so it needs about the box's width (zoom aside)
const SIZES = {
  one: "(max-width: 560px) calc(100vw - 72px), (max-width: 1000px) calc(50vw - 72px), 340px",
  wide: "(max-width: 560px) calc(100vw - 72px), (max-width: 1000px) calc(100vw - 104px), 720px",
};

function Tile({ tile, t, dark }: { tile: ResolvedTile; t: T; dark: boolean }) {
  const words = t.tiles[tile.id as keyof T["tiles"]];
  if (!words) return null;
  const id = `tile-${tile.id}`;
  return (
    <li className={`${s.item} reveal`} data-wide={tile.wide || undefined}>
      <a className={s.tile} href={tile.link} aria-labelledby={`${id}-t`} aria-describedby={`${id}-b`}>
        <span className={s.text}>
          <b id={`${id}-t`}>{words.title}</b>
          {tile.soon && <span className="tag">{t.soon}</span>}
          <span className={s.body} id={`${id}-b`}>
            {words.body}
          </span>
        </span>
        <span className={s.media}>
          {tile.scene && tile.frame
            ? variants(tile.scene, dark ? "dark" : "auto").map(({ shot, v }) => (
                <span key={shot.id} {...variantProps(v, s.frame)}>
                  <Picture shot={shot} sizes={tile.wide ? SIZES.wide : SIZES.one} focus={tile.frame} />
                </span>
              ))
            : tile.icon && (
                <span className={s.icon} aria-hidden="true">
                  {tile.icon.app ? <img src={appIcon(tile.icon.app)} alt="" width={112} height={112} /> : <Mask name={tile.icon.symbolic ?? "info"} />}
                </span>
              )}
        </span>
      </a>
    </li>
  );
}

export function SystemMap({ t, lang, summary = false }: { t: T; lang: Locale; summary?: boolean }) {
  const tiles = resolveTiles(lang, { home: summary });
  if (!tiles.length) return null;
  const head = summary ? t.summary : t.full;
  const titleId = summary ? "system-summary-title" : "system-title";
  return (
    <section className={`chapter ${summary ? "stage" : ""}`} id="system" aria-labelledby={titleId}>
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2 className="h-1" id={titleId}>
            {head.title[0]}
            <br />
            <span className="grad">
              <Dot>{head.title[1]}</Dot>
            </span>
          </h2>
          <p className="lead">{head.lead}</p>
        </div>
        {summary ? (
          <ul className={s.grid}>
            {tiles.map((tile) => (
              <Tile key={tile.id} tile={tile} t={t} dark />
            ))}
          </ul>
        ) : (
          tileGroups.map((g) => {
            const list = tiles.filter((tile) => tile.group === g);
            if (!list.length) return null;
            return (
              <div className={s.group} key={g}>
                <h3 className={`h-3 ${s.groupTitle}`}>{t.groups[g]}</h3>
                <ul className={s.grid}>
                  {list.map((tile) => (
                    <Tile key={tile.id} tile={tile} t={t} dark={false} />
                  ))}
                </ul>
              </div>
            );
          })
        )}
        <p className={s.cta}>
          {summary && (
            <a className="btn btn-primary" href={`/${lang}/os/#system`}>
              {t.summary.cta}
            </a>
          )}
          <a className="btn btn-link" href={`/${lang}/tour/`}>
            {t.tourCta}
          </a>
        </p>
        <p className={`small ${s.note}`}>{t.note}</p>
      </div>
    </section>
  );
}
