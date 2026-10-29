"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Dict } from "@/i18n";
import { appIcon } from "@/lib/site";
import { Dock } from "./Dock";
import { MenuBar } from "./DesktopScene";
import { Wallpaper } from "./Wallpaper";
import s from "./Overview.module.css";

// Window boxes in screen units (1440 × 900): x, y, width on the desktop (0) and in Overview (1).
const boxes = [
  { x0: 150, y0: 80, w0: 760, x1: 250, y1: 205, w1: 440 },
  { x0: 560, y0: 140, w0: 640, x1: 760, y1: 215, w1: 420 },
  { x0: 250, y0: 390, w0: 560, x1: 330, y1: 572, w1: 330 },
  { x0: 700, y0: 330, w0: 620, x1: 760, y1: 548, w1: 380 },
];

const ease = (p: number) => p * p * (3 - 2 * p);

export function OverviewScrub({ t, scene, locale }: { t: Dict["overview"]; scene: Dict["scene"]; locale: string }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    const st = stage.current;
    if (!el || !st) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      let p = 1;
      if (!reduce.matches) {
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      }
      // hold the start for the first 15 %, finish at 85 %
      const q = Math.min(1, Math.max(0, (p - 0.15) / 0.7));
      st.style.setProperty("--e", ease(q).toFixed(4));
      st.dataset.step = q < 0.08 ? "0" : q < 0.92 ? "1" : "2";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, []);

  const vars = (b: (typeof boxes)[number]) =>
    ({ "--x0": b.x0, "--y0": b.y0, "--w0": b.w0, "--x1": b.x1, "--y1": b.y1, "--w1": b.w1 }) as CSSProperties;
  const first = boxes[0]!;

  return (
    <div className={s.track} ref={track}>
      <div className={s.sticky} ref={stage} data-step="0" style={{ "--e": 0 } as CSSProperties}>
        <div className={s.steps} aria-live="off">
          {t.steps.map((step, i) => (
            <p key={step} data-i={i}>
              {step}
            </p>
          ))}
        </div>
        <div className={`display ${s.display}`}>
          <div className="screen" role="img" aria-label={t.sceneLabel}>
            <Wallpaper />
            <div className={s.veil} />
            <div className={s.strip}>
              <div className={s.desk} data-on>
                <Wallpaper ratio={1.6} />
                <span>{t.desktop}</span>
              </div>
              <div className={s.desk}>
                <Wallpaper ratio={1.6} />
                <span>{t.desktop2}</span>
              </div>
              <span className={s.plus}>+</span>
            </div>
            <MenuBar t={scene} locale={locale} app={t.windows[1]!} />

            <div className={`${s.w} ${s.files}`} style={vars(boxes[0]!)}>
              <WinBar title={t.windows[0]!} />
              <div className={s.filesBody}>
                <div className={s.filesSide}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} />
                  ))}
                </div>
                <div className={s.filesGrid}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <img key={i} src={appIcon("Files")} alt="" />
                  ))}
                </div>
              </div>
            </div>
            <div className={`${s.w} ${s.notes}`} style={vars(boxes[1]!)}>
              <WinBar title={t.windows[1]!} light />
              <div className={s.notesBody}>
                <b />
                {[92, 100, 84, 96, 60, 0, 88, 100, 72].map((w, i) =>
                  w ? <i key={i} style={{ width: `${w}%` }} /> : <span key={i} />,
                )}
              </div>
            </div>
            <div className={`${s.w} ${s.term}`} style={vars(boxes[2]!)}>
              <WinBar title={t.windows[2]!} />
              <pre className={s.termBody}>
                {t.terminal}
                <span className={s.caret} />
              </pre>
            </div>
            <div className={`${s.w} ${s.preview}`} style={vars(boxes[3]!)}>
              <WinBar title={t.windows[3]!} />
              <div className={s.previewBody}>
                <Wallpaper ratio={1.5} />
              </div>
            </div>

            <span
              className={s.pill}
              style={{ left: `calc(var(--u) * ${first.x1 + first.w1 / 2})`, top: `calc(var(--u) * ${first.y1 + first.w1 * 0.66 + 16})` }}
            >
              <img src={appIcon("Files")} alt="" />
              {t.windows[0]}
            </span>
            <Dock t={scene.dock} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WinBar({ title, light }: { title: string; light?: boolean }) {
  return (
    <div className={s.winbar} data-light={light || undefined}>
      <span className={s.lights}>
        <i />
        <i />
        <i />
      </span>
      <b>{title}</b>
    </div>
  );
}
