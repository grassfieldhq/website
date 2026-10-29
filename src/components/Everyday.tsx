import type { Dict, Locale } from "@/i18n";
import { Dot } from "./Dot";
import { appIcon } from "@/lib/site";
import { slot } from "@/lib/shots";
import { Calendar } from "./Calendar";
import { Mask } from "./Mask";
import { Shot } from "./Shot";
import { Wallpaper } from "./Wallpaper";
import s from "./Everyday.module.css";

// Tile widths for `sizes` (bento of 6 columns in the 1120px wrap; one column under 900px).
const TILE = { span4: "(max-width: 900px) calc(100vw - 92px), 660px", span3: "(max-width: 900px) calc(100vw - 92px), 470px", split: "(max-width: 900px) calc(100vw - 92px), 580px" };

// Each tile shows a real capture when the set has one (see slots in lib/shots.ts), else its code-drawn render.
export function Everyday({ t, scene, locale, lang }: { t: Dict["everyday"]; scene: Dict["scene"]; locale: string; lang: Locale }) {
  const cc = t.cc;
  const shot = {
    search: slot(lang, "search"),
    cc: slot(lang, "controlcenter"),
    notifications: slot(lang, "notifications"),
    menus: slot(lang, "menus"),
    tiling: slot(lang, "tiling"),
  };
  return (
    <section className="chapter" aria-labelledby="everyday-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="everyday-title">
            {t.title[0]}
            <br />
            <Dot>{t.title[1]}</Dot>
          </h2>
        </div>

        <div className={s.bento}>
          <article className={`${s.tile} ${s.span4} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{t.search.title}</h3>
              <p>{t.search.body}</p>
            </div>
            {shot.search && (
              <div className={s.art}>
                <Shot scene={shot.search.scene} focus={shot.search.focus} sizes={TILE.span4} />
              </div>
            )}
          </article>

          <article className={`${s.tile} ${s.span2} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{t.corners.title}</h3>
              <p>{t.corners.body}</p>
            </div>
            <div className={s.art}>
              <div className="mini" style={{ ["--ar" as string]: "4 / 3" }}>
                <Wallpaper ratio={4 / 3} />
                <div className={s.corners}>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </article>

          <article className={`${s.tile} ${s.span3} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{cc.title}</h3>
              <p>{cc.body}</p>
            </div>
            <div className={s.art}>
              {shot.cc ? (
                <Shot scene={shot.cc.scene} focus={shot.cc.focus} sizes={TILE.span3} />
              ) : (
              <div className="mini" style={{ ["--ar" as string]: "1 / 1", ["--base" as string]: 1000 }} role="img" aria-label={cc.title}>
                <Wallpaper ratio={1} />
                <div className={s.cc}>
                  <Toggle on icon="wifi-3" title={cc.wifi} value={cc.wifiValue} />
                  <Toggle icon="moon" title={cc.focus} value={cc.off} />
                  <Toggle on icon="bluetooth" title={cc.bluetooth} value={cc.on} />
                  <Toggle icon="sun" title={cc.appearance} value={cc.dark} />
                  <Toggle icon="airplane" title={cc.airplane} value={cc.airplaneOff} wide />
                  <div className={s.slider}>
                    <b>{cc.display}</b>
                    <div className={s.track} style={{ ["--v" as string]: "62%" }} />
                  </div>
                  <div className={s.slider}>
                    <b>{cc.sound}</b>
                    <div className={s.track} style={{ ["--v" as string]: "45%" }} />
                  </div>
                </div>
              </div>
              )}
            </div>
          </article>

          <article className={`${s.tile} ${s.span3} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{t.widgets.title}</h3>
              <p>{t.widgets.body}</p>
            </div>
            <div className={s.art}>
              {shot.notifications ? (
                <Shot scene={shot.notifications.scene} focus={shot.notifications.focus} sizes={TILE.span3} />
              ) : (
              <div className="mini" style={{ ["--ar" as string]: "1 / 1", ["--base" as string]: 1000 }} role="img" aria-label={t.widgets.title}>
                <Wallpaper ratio={1} />
                <div className={s.wd}>
                  <div className={s.notif}>
                    <img src={appIcon("Settings")} alt="" />
                    <div>
                      <b>{t.widgets.notifTitle}</b>
                      <span>{t.widgets.notifBody}</span>
                    </div>
                    <time>{scene.now}</time>
                  </div>
                  <div className={s.widget}>
                    <Calendar locale={locale} weekdays={t.widgets.weekdays} />
                  </div>
                </div>
              </div>
              )}
            </div>
          </article>

          {shot.tiling && (
            <article className={`${s.tile} ${s.span6} ${s.split} ${s.splitRev} reveal`}>
              <div>
                <Shot scene={shot.tiling.scene} focus={shot.tiling.focus} sizes={TILE.split} />
              </div>
              <div className={s.head}>
                <h3 className="h-2">
                  {t.tiling.title[0]}
                  <br />
                  {t.tiling.title[1]}
                </h3>
                <p>{t.tiling.body}</p>
              </div>
            </article>
          )}

          <article className={`${s.tile} ${s.span6} ${s.split} reveal`} id="menus">
            <div className={s.head}>
              <h3 className="h-2">
                {t.menus.title[0]}
                <br />
                {t.menus.title[1]}
              </h3>
              <p>{t.menus.body}</p>
            </div>
            {shot.menus ? (
              <div>
                <Shot scene={shot.menus.scene} focus={shot.menus.focus} sizes={TILE.split} />
              </div>
            ) : (
            <div className="mini" style={{ ["--ar" as string]: "16 / 10", ["--base" as string]: 1440 }} role="img" aria-label={t.menus.title.join(" ")}>
              <Wallpaper />
              <div className={s.gmBar}>
                <Mask name="grassfield-logo" className={s.gmLogo} />
                <span>
                  <b>{scene.app}</b>
                </span>
                {scene.menus.map((m, i) => (
                  <span key={m} data-open={i === 0 || undefined}>
                    {m}
                  </span>
                ))}
              </div>
              <div className={s.menu}>
                {t.menus.items.map((it, i) =>
                  it ? (
                    <div key={i} data-hl={i === 1 || undefined}>
                      {it[0]}
                      <kbd>{it[1]}</kbd>
                    </div>
                  ) : (
                    <hr key={i} />
                  ),
                )}
              </div>
            </div>
            )}
          </article>

          <article className={`${s.tile} ${s.span6} ${s.split} ${s.splitRev} reveal`}>
            <div className="mini" style={{ ["--ar" as string]: "16 / 9" }} role="img" aria-label={t.stages.title}>
              <Wallpaper ratio={16 / 9} />
              <div className={s.stg}>
                <div className={s.strip}>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={s.front}>
                  <span />
                </div>
              </div>
            </div>
            <div className={s.head}>
              <span className="tag">{t.stages.tag}</span>
              <h3 className="h-2">{t.stages.title}</h3>
              <p>{t.stages.body}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Toggle({ on, icon, title, value, wide }: { on?: boolean; icon: string; title: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? s.wide : undefined}>
      <span className={s.dot} data-on={on || undefined}>
        <Mask name={icon} />
      </span>
      <div>
        <b>{title}</b>
        <small>{value}</small>
      </div>
    </div>
  );
}
