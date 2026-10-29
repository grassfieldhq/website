"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ShotData } from "@/lib/shots";
import { Picture } from "./Shot";
import s from "./Clip.module.css";

const noop = () => () => {};

/**
 * A short motion clip. The poster is a lazy, responsive picture under the video (visible without JavaScript, and
 * not fetched until near the viewport, unlike a `poster` attribute). Without JavaScript the video keeps its native
 * controls. With it, the clip plays muted and looped while at least half visible, pauses when it leaves, and never
 * starts by itself when the visitor prefers reduced motion; the button plays or pauses it at any time.
 * preload="none": no video byte is fetched before it plays.
 */
export function Clip({ shot, sizes, t }: { shot: ShotData; sizes: string; t: { play: string; pause: string } }) {
  const video = useRef<HTMLVideoElement>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [playing, setPlaying] = useState(false);
  const chosen = useRef<"play" | "pause" | null>(null); // the visitor's own choice wins over visibility

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const want = visible && (chosen.current === "play" || (chosen.current === null && !reduce.matches));
      if (want && v.paused) v.play().catch(() => {});
      else if (!want && !v.paused) v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e && e.isIntersecting && e.intersectionRatio >= 0.5;
        sync();
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(v);
    reduce.addEventListener("change", sync);
    return () => {
      io.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      chosen.current = "play";
      v.play().catch(() => {});
    } else {
      chosen.current = "pause";
      v.pause();
    }
  };

  const vid = shot.video;
  return (
    <div className={`capture ${s.clip}`} style={{ aspectRatio: `${shot.width} / ${shot.height}` }} data-playing={playing || undefined}>
      <Picture shot={shot} sizes={sizes} decorative />
      <video
        ref={video}
        className={s.video}
        muted
        playsInline
        loop
        preload="none"
        controls={!hydrated}
        width={shot.width}
        height={shot.height}
        aria-label={shot.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {vid?.webm && <source src={vid.webm} type="video/webm" />}
        {vid?.mp4 && <source src={vid.mp4} type="video/mp4" />}
      </video>
      {hydrated && (
        <button type="button" className={s.toggle} onClick={toggle} aria-label={playing ? t.pause : t.play} data-playing={playing || undefined}>
          <span aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
