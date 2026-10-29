import { useId } from "react";

// The Grassfield wallpaper, drawn with the same procedure as grassfield/ui/Grassfield/Ui/GrassfieldArtwork.qml
// (sky gradient, sun, four layered hills). Artwork: CC-BY-SA-4.0.
const art = { skyTop: "#0F2A3F", skyMid: "#2F6F7E", skyLow: "#E8C98B", sun: "#FFF1C2" };
const hills = [
  { c: "#3E7D5A", base: 0.62, amp: 0.1, ph: 0 },
  { c: "#2E6B3F", base: 0.72, amp: 0.09, ph: 1.3 },
  { c: "#1F4F2C", base: 0.82, amp: 0.08, ph: 2.6 },
  { c: "#16391F", base: 0.92, amp: 0.06, ph: 4.0 },
];

export function Wallpaper({ ratio = 1.6, className = "wp" }: { ratio?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = 1600;
  const h = Math.round(w / ratio);
  const y = (b: number, a: number, k: number) => (h * (b - a * k)).toFixed(1);
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={art.skyTop} />
            <stop offset=".55" stopColor={art.skyMid} />
            <stop offset=".78" stopColor={art.skyLow} />
          </linearGradient>
          <radialGradient id={`${id}r`}>
            <stop offset="0" stopColor={art.sun} />
            <stop offset=".35" stopColor={art.sun} stopOpacity=".55" />
            <stop offset="1" stopColor={art.sun} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#${id}s)`} />
        <circle cx={w * 0.68} cy={h * 0.52} r={h * 0.25} fill={`url(#${id}r)`} />
        {hills.map(({ c, base: b, amp: a, ph }) => (
          <path
            key={c}
            fill={c}
            d={`M0 ${h} L0 ${y(b, a, Math.sin(ph))} C${w * 0.18} ${y(b, a, 2)} ${w * 0.34} ${y(b, -a, 1)} ${w * 0.5} ${y(b, a, Math.sin(ph + 2))} C${w * 0.68} ${y(b, a, 1.8)} ${w * 0.84} ${y(b, -a, 0.8)} ${w} ${y(b, a, Math.sin(ph + 4))} L${w} ${h} Z`}
          />
        ))}
      </svg>
    </div>
  );
}
