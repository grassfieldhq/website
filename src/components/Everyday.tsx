import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Calendar } from "./Calendar";
import { Mask } from "./Mask";
import { Wallpaper } from "./Wallpaper";
import s from "./Everyday.module.css";

export function Everyday({ t, scene, locale }: { t: Dict["everyday"]; scene: Dict["scene"]; locale: string }) {
  const cc = t.cc;
  return (
    <section className="chapter" aria-labelledby="everyday-title">
      <div className="wrap">
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="everyday-title">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
        </div>

        <div className={s.bento}>
          <article className={`${s.tile} ${s.span4} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{t.search.title}</h3>
              <p>{t.search.body}</p>
            </div>
            <div className={s.art}>
              <div className="capture">
                <img src="/shots/search.webp" width={800} height={400} alt={t.search.alt} loading="lazy" decoding="async" />
              </div>
            </div>
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
            </div>
          </article>

          <article className={`${s.tile} ${s.span3} reveal`}>
            <div className={s.head}>
              <h3 className="h-3">{t.widgets.title}</h3>
              <p>{t.widgets.body}</p>
            </div>
            <div className={s.art}>
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
            </div>
          </article>

          <article className={`${s.tile} ${s.span6} ${s.split} reveal`} id="menus">
            <div className={s.head}>
              <h3 className="h-2">
                {t.menus.title[0]}
                <br />
                {t.menus.title[1]}
              </h3>
              <p>{t.menus.body}</p>
            </div>
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
