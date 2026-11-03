import s from "./Ridge.module.css";

// The plateau's ridge line: the hills of the Grassfield wallpaper (GrassfieldArtwork.qml), without its sky, as a band
// a capture can stand on. Drawn on a 1600 × 400 grid; `dusk` is the evening palette that closes a page.
const palettes = {
  day: ["#3e7d5a", "#2e6b3f", "#1f4f2c", "#16391f"],
  dusk: ["#3b4e4a", "#2b3d37", "#1d2c27", "#121d19"],
};
const shapes = [
  { base: 0.34, amp: 0.16, ph: 0.4 },
  { base: 0.5, amp: 0.13, ph: 1.7 },
  { base: 0.66, amp: 0.11, ph: 3.0 },
  { base: 0.82, amp: 0.08, ph: 4.4 },
];

function hill(b: number, a: number, ph: number) {
  const w = 1600;
  const h = 400;
  const y = (k: number) => (h * (b - a * k)).toFixed(1);
  return `M0 ${h} L0 ${y(Math.sin(ph))} C${w * 0.18} ${y(2)} ${w * 0.34} ${y(-1)} ${w * 0.5} ${y(Math.sin(ph + 2))} C${w * 0.68} ${y(1.8)} ${w * 0.84} ${y(-0.8)} ${w} ${y(Math.sin(ph + 4))} L${w} ${h} Z`;
}

export function Ridge({ variant = "day", className = "" }: { variant?: "day" | "dusk"; className?: string }) {
  const pal = palettes[variant];
  return (
    <svg className={`${s.ridge} ${className}`} viewBox="0 0 1600 400" preserveAspectRatio="none" aria-hidden="true">
      {shapes.map((sh, i) => (
        <path key={i} d={hill(sh.base, sh.amp, sh.ph)} fill={pal[i]} />
      ))}
    </svg>
  );
}
