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

// The media box per layout: its width as [vw, px] and its shape (width / height; the box is 220 px tall up to 320 px).
// A capture covers the box, so one wider than the box is drawn wider than it: `sizes` asks for that width (the
// zoom is applied on top by Picture).
type Box = { max: number; vw: number; px: number; shape: number };
const BOXES: Record<"one" | "wide", Box[]> = {
  one: [
    { max: 560, vw: 100, px: -72, shape: 1.4 },
    { max: 1000, vw: 50, px: -72, shape: 1.45 },
    { max: 0, vw: 0, px: 320, shape: 1 },
  ],
  wide: [
    { max: 560, vw: 100, px: -72, shape: 1.4 },
    { max: 1000, vw: 100, px: -104, shape: 3.1 },
    { max: 0, vw: 0, px: 700, shape: 2.2 },
  ],
};
const len = (vw: number, px: number) => (vw ? `calc(${+vw.toFixed(1)}vw - ${-+px.toFixed(0)}px)` : `${Math.round(px)}px`);
function sizesFor(ratio: number, wide: boolean, fill: boolean) {
  return BOXES.one
    .map((b, i) => {
      const box = wide || (fill && b.max === 1000) ? BOXES.wide[i]! : b;
      const f = Math.max(1, ratio / box.shape);
      const l = len(box.vw * f, box.px * f);
      return b.max ? `(max-width: ${b.max}px) ${l}` : l;
    })
    .join(", ");
}

/** Two columns between 561 and 1000 px: a group with an odd number of cells widens its last narrow tile there. */
function fillers(list: ResolvedTile[]) {
  const cells = list.reduce((n, tile) => n + (tile.wide ? 2 : 1), 0);
  const last = cells % 2 ? list.findLast((tile) => !tile.wide) : undefined;
  return new Set(last ? [last.id] : []);
}

function Tile({ tile, t, dark, fill }: { tile: ResolvedTile; t: T; dark: boolean; fill: boolean }) {
  const words = t.tiles[tile.id as keyof T["tiles"]];
  if (!words) return null;
  // the link is named by its words (title, tag, line); the capture only illustrates them, so it stays out of the name
  return (
    <li className={`${s.item} reveal`} data-wide={tile.wide || undefined} data-fill={fill || undefined}>
      <a className={s.tile} href={tile.link}>
        <span className={s.text}>
          <b>{words.title}</b> {tile.soon && <span className="tag">{t.soon}</span>} <span className={s.body}>{words.body}</span>
        </span>
        <span className={s.media} aria-hidden="true">
          {tile.scene && tile.frame
            ? variants(tile.scene, dark ? "dark" : "auto").map(({ shot, v }) => (
                <span key={shot.id} {...variantProps(v, s.frame)}>
                  <Picture shot={shot} sizes={sizesFor(shot.width / shot.height, !!tile.wide, fill)} focus={tile.frame} />
                </span>
              ))
            : tile.icon && (
                <span className={s.icon}>
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
            {tiles.map((tile, _, all) => (
              <Tile key={tile.id} tile={tile} t={t} dark fill={fillers(all).has(tile.id)} />
            ))}
          </ul>
        ) : (
          tileGroups.map((g) => {
            const list = tiles.filter((tile) => tile.group === g);
            if (!list.length) return null;
            const fill = fillers(list);
            return (
              <div className={s.group} key={g}>
                <h3 className={`h-3 ${s.groupTitle}`}>{t.groups[g]}</h3>
                <ul className={s.grid}>
                  {list.map((tile) => (
                    <Tile key={tile.id} tile={tile} t={t} dark={false} fill={fill.has(tile.id)} />
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
