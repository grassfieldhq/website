import type { CSSProperties, ReactNode } from "react";
// Types only: Clip (a client component) imports this file, and the capture data must stay out of client bundles.
import type { Focus, Scene, ShotData, ShotSrc } from "@/lib/shots";
import s from "./Shot.module.css";

export type ShotMode = "auto" | "dark" | "light";

/** The capture to show alone (no site-theme switch): the requested appearance when it exists. */
export const primary = (sc: Scene, prefer: "dark" | "light" = "dark"): ShotData => (sc[prefer] ?? sc.dark ?? sc.light)!;

/** The largest WebP: the full-size image a gallery links to, and the fallback src. */
export const fullSize = (d: ShotData): ShotSrc => d.webp[d.webp.length - 1] ?? d.avif[d.avif.length - 1]!;

const srcset = (list: ShotSrc[]) => list.map((x) => `${x.src} ${x.w}w`).join(", ");

// `sizes` entries are "[(media)] length"; a zoomed frame needs `zoom` times more pixels than its box.
function zoomSizes(sizes: string, zoom: number) {
  if (zoom === 1) return sizes;
  return sizes
    .split(/,(?![^(]*\))/)
    .map((entry) => {
      const e = entry.trim();
      const m = e.match(/^(\(.*\))\s+(.+)$/);
      return m ? `${m[1]} calc(${zoom} * ${m[2]})` : `calc(${zoom} * ${e})`;
    })
    .join(", ");
}

/** One capture as a responsive <picture>: AVIF, then WebP, intrinsic size set, lazy unless `eager`. */
export function Picture({ shot, sizes, eager, focus, decorative }: { shot: ShotData; sizes: string; eager?: boolean; focus?: Focus; decorative?: boolean }) {
  const sz = zoomSizes(sizes, focus?.zoom ?? 1);
  const img = (
    <picture>
      {shot.avif.length > 0 && <source type="image/avif" srcSet={srcset(shot.avif)} sizes={sz} />}
      {shot.webp.length > 0 && <source type="image/webp" srcSet={srcset(shot.webp)} sizes={sz} />}
      <img
        src={fullSize(shot).src}
        width={shot.width}
        height={shot.height}
        alt={decorative ? "" : shot.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        data-zoom={focus?.zoom}
      />
    </picture>
  );
  if (!focus) return img;
  const style = { aspectRatio: focus.ar, "--fx": `${focus.x * 100}%`, "--fy": `${focus.y * 100}%`, "--z": focus.zoom } as CSSProperties;
  return (
    <div className={s.focus} style={style}>
      {img}
    </div>
  );
}

/**
 * The light and dark captures of a scene. `auto` renders both and lets CSS show the one matching the site's
 * appearance (system or toggle, no JavaScript needed); the hidden one is display:none, so its lazy image is not
 * fetched. `dark` / `light` force one appearance (chapters that are always dark).
 */
export function variants(sc: Scene, mode: ShotMode): { shot: ShotData; v?: "dark" | "light" }[] {
  if (mode === "auto" && sc.dark && sc.light) return [{ shot: sc.dark, v: "dark" }, { shot: sc.light, v: "light" }];
  return [{ shot: primary(sc, mode === "light" ? "light" : "dark") }];
}

/** Props that make an element follow the site's appearance when it holds one of two variants. */
export const variantProps = (v?: "dark" | "light", className = "") =>
  v ? { className: `${s.variant} ${className}`, "data-v": v } : { className: className || undefined };

type FrameProps = { sizes: string; eager?: boolean; focus?: Focus; className?: string; style?: CSSProperties; href?: boolean; label?: string };

/** A capture in the site's frame (rounded, rim, shadow); with `href`, a link to the full-size image (lightbox). */
export function Frame({ shot, sizes, eager, focus, className = "", style, href, label }: FrameProps & { shot: ShotData }) {
  const pic = <Picture shot={shot} sizes={sizes} eager={eager} focus={focus} />;
  if (!href)
    return (
      <div className={`capture ${className}`} style={style}>
        {pic}
      </div>
    );
  const full = fullSize(shot);
  return (
    <a
      className={`capture ${s.link} ${className}`}
      style={style}
      href={full.src}
      data-lightbox=""
      data-title={shot.title}
      data-caption={shot.caption}
      data-avif={srcset(shot.avif)}
      data-w={shot.width}
      data-h={shot.height}
    >
      {pic}
      {label && <span className="sr-only">{label}</span>}
    </a>
  );
}

/** A scene in a chapter: one frame, or two that follow the site's appearance. */
export function Shot({ scene, mode = "auto", ...frame }: FrameProps & { scene: Scene; mode?: ShotMode }): ReactNode {
  return variants(scene, mode).map(({ shot, v }) =>
    v ? (
      <div key={shot.id} {...variantProps(v)}>
        <Frame shot={shot} {...frame} />
      </div>
    ) : (
      <Frame key={shot.id} shot={shot} {...frame} />
    ),
  );
}
