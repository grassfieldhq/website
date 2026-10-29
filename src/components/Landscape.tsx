import type { CSSProperties } from "react";
import s from "./Landscape.module.css";

// The Grassfield wallpaper (GrassfieldArtwork.qml) split into layers so each can move on its own.
// Hills get a soft top light instead of a flat fill. "dusk" is the evening version used to close the page.
const palettes = {
  dawn: {
    sky: ["#0F2A3F", "#2F6F7E", "#E8C98B"],
    skyEarly: ["#081624", "#1B4352", "#C99560"],
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

export function Landscape({ variant = "dawn", className = "", p }: { variant?: "dawn" | "dusk"; className?: string; p?: number }) {
  const pal = palettes[variant];
  const sky = (c: string[]) => `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 55%, ${c[2]} 78%)`;
  return (
    <div className={`${s.land} ${className}`} data-variant={variant} aria-hidden="true" style={p === undefined ? undefined : ({ "--p": p } as CSSProperties)}>
      <div className={s.sky} style={{ background: sky(pal.skyEarly) }} />
      <div className={`${s.sky} ${s.skyDay}`} style={{ background: sky(pal.sky) }} />
      <div className={s.sun} style={{ ["--sun" as string]: pal.sun } as CSSProperties} />
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
      <div className={s.grain} />
    </div>
  );
}
