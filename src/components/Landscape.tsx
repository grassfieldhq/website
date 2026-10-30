import type { CSSProperties } from "react";
import s from "./Landscape.module.css";

// The Grassfield wallpaper (GrassfieldArtwork.qml) split into layers so each can move on its own.
// Hills get a soft top light instead of a flat fill. "dusk" is the evening version used to close the page.
const palettes = {
  dawn: {
    sky: ["#0F2A3F", "#2F6F7E", "#E8C98B"],
    skyEarly: ["#081624", "#1B4352", "#C99560"],
    skyNoon: ["#1E5A80", "#4F9BB0", "#CFE3D8"],
    skyDusk: ["#14122A", "#5B3A5E", "#F0A35E"],
    sun: "#FFF1C2",
    hills: ["#3E7D5A", "#2E6B3F", "#1F4F2C", "#16391F"],
  },
  dusk: {
    sky: ["#14122A", "#5B3A5E", "#F0A35E"],
    skyEarly: ["#14122A", "#5B3A5E", "#F0A35E"],
    sun: "#FFD9A0",
    hills: ["#3B4E4A", "#2B3D37", "#1D2C27", "#121D19"],
  },
};
const shapes = [
  { base: 0.62, amp: 0.1, ph: 0 },
  { base: 0.72, amp: 0.09, ph: 1.3 },
  { base: 0.82, amp: 0.08, ph: 2.6 },
  { base: 0.92, amp: 0.06, ph: 4.0 },
];

function mix(hex: string, white: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * white));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hillPath(b: number, a: number, ph: number) {
  const w = 1600;
  const h = 1000;
  const y = (k: number) => (h * (b - a * k)).toFixed(1);
  // drawn on a 1600 × 1000 grid, filled down to 1400 so a layer can rise without showing its bottom edge
  return `M0 1400 L0 ${y(Math.sin(ph))} C${w * 0.18} ${y(2)} ${w * 0.34} ${y(-1)} ${w * 0.5} ${y(Math.sin(ph + 2))} C${w * 0.68} ${y(1.8)} ${w * 0.84} ${y(-0.8)} ${w} ${y(Math.sin(ph + 4))} L${w} 1400 Z`;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * `time` is the hour of the site's day, 0 at dawn (the home page), 0.5 at noon, 1 at dusk: each page's hero sits a
 * little later than the one before. `p` is the scroll progress a parent drives (the home hero). `shared` names the
 * landscape for the view transition between pages, so the field carries over instead of fading.
 */
export function Landscape({ variant = "dawn", className = "", p, time = 0, shared = false }: { variant?: "dawn" | "dusk"; className?: string; p?: number; time?: number; shared?: boolean }) {
  const pal = palettes[variant];
  const sky = (c: string[]) => `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 55%, ${c[2]} 78%)`;
  const t = variant === "dusk" ? 1 : clamp(time);
  const noon = clamp(1 - Math.abs(t - 0.5) * 2.2);
  const dusk = clamp((t - 0.6) / 0.4);
  const vars = {
    "--t": t,
    "--sun-x": `${20 + 56 * t}%`,
    "--sun-y": `${64 - Math.sin(t * Math.PI) * 42}%`,
    "--hill-light": (1 + 0.16 * Math.sin(t * Math.PI) - 0.3 * clamp((t - 0.7) / 0.3)).toFixed(3),
    "--warm": (dusk * 0.35).toFixed(3),
    ...(p === undefined ? {} : { "--p": p }),
    ...(shared ? { viewTransitionName: "land" } : {}),
  } as CSSProperties;
  return (
    <div className={`${s.land} ${className}`} data-variant={variant} data-land aria-hidden="true" style={vars}>
      <div className={s.sky} style={{ background: sky(pal.skyEarly) }} />
      <div className={`${s.sky} ${s.skyDay}`} style={{ background: sky(pal.sky) }} />
      {variant === "dawn" && (
        <>
          <div className={s.sky} style={{ background: sky(palettes.dawn.skyNoon), opacity: noon }} />
          <div className={s.sky} style={{ background: sky(palettes.dawn.skyDusk), opacity: dusk }} />
        </>
      )}
      <div className={s.stars} />
      <div className={s.sun} style={{ ["--sun" as string]: t > 0.75 ? "#FFD9A0" : t > 0.25 ? "#FFFBE6" : pal.sun } as CSSProperties} />
      {shapes.map((sh, i) => {
        const c = pal.hills[i]!;
        const id = `${variant}-hill-${i}`;
        return (
          <div key={id} className={s.hill} style={{ ["--i" as string]: i } as CSSProperties}>
            <svg viewBox="0 0 1600 1400" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={mix(c, 0.16)} />
                  <stop offset={`${(sh.base * 1000 + 120) / 1400}`} stopColor={c} />
                  <stop offset="1" stopColor={c} />
                </linearGradient>
              </defs>
              <path d={hillPath(sh.base, sh.amp, sh.ph)} fill={`url(#${id})`} />
            </svg>
          </div>
        );
      })}
      <div className={s.warm} />
      <div className={s.grain} />
      <div className={s.night} />
    </div>
  );
}
