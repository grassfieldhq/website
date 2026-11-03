// Draws the site's contour lines: a topographic map of two reliefs (the Grassfield mark, "Deux reliefs", read as a
// map), as public/contours.svg. Pages use it as a CSS mask, so the lines take the theme's colour.
//   node scripts/contours.mjs
// Deterministic: the same file on every run. The field is two peaks on a gentle slope with a few long swells; the
// lines are its level sets (marching squares), joined into polylines and smoothed.
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const W = 1600;
const H = 900;
const STEP = 8; // grid cell, in drawing units
const LEVELS = 18;

const peaks = [
  { x: 1090, y: 420, h: 1.0, sx: 250, sy: 195 }, // the back relief, the larger
  { x: 540, y: 610, h: 0.8, sx: 215, sy: 160 }, // the front relief
];
function field(x, y) {
  let v = 0.12 * (1 - y / H) + 0.06 * Math.sin(x / 260 + y / 410) + 0.04 * Math.sin(x / 140 - y / 300 + 1.7);
  for (const p of peaks) v += p.h * Math.exp(-(((x - p.x) / p.sx) ** 2 + ((y - p.y) / p.sy) ** 2));
  return v;
}

const cols = Math.ceil(W / STEP) + 1;
const rows = Math.ceil(H / STEP) + 1;
const grid = Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => field(i * STEP, j * STEP)));
let min = Infinity;
let max = -Infinity;
for (const row of grid) {
  for (const v of row) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
}

// marching squares: the segments where the field crosses `level`, on the cell edges
function segments(level) {
  const out = [];
  const at = (i0, j0, i1, j1) => {
    const a = grid[j0][i0];
    const b = grid[j1][i1];
    const t = (level - a) / (b - a);
    return [(i0 + (i1 - i0) * t) * STEP, (j0 + (j1 - j0) * t) * STEP];
  };
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const c = (grid[j][i] > level ? 8 : 0) | (grid[j][i + 1] > level ? 4 : 0) | (grid[j + 1][i + 1] > level ? 2 : 0) | (grid[j + 1][i] > level ? 1 : 0);
      if (c === 0 || c === 15) continue;
      const top = () => at(i, j, i + 1, j);
      const right = () => at(i + 1, j, i + 1, j + 1);
      const bottom = () => at(i, j + 1, i + 1, j + 1);
      const left = () => at(i, j, i, j + 1);
      const pairs = {
        1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bottom, right]],
        6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bottom]], 10: [[left, bottom], [top, right]],
        11: [[top, right]], 12: [[left, right]], 13: [[bottom, right]], 14: [[left, bottom]],
      }[c];
      for (const [p, q] of pairs) out.push([p(), q()]);
    }
  }
  return out;
}

// join segments that share an end into polylines
function join_(segs) {
  const key = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const ends = new Map();
  segs.forEach((s, n) => {
    for (const e of [0, 1]) {
      const k = key(s[e]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(n);
    }
  });
  const used = new Set();
  const lines = [];
  for (let n = 0; n < segs.length; n++) {
    if (used.has(n)) continue;
    used.add(n);
    const line = [segs[n][0], segs[n][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) ?? []).find((m) => !used.has(m));
        if (next === undefined) break;
        used.add(next);
        const s = segs[next];
        const far = key(s[0]) === key(tip) ? s[1] : s[0];
        if (dir) line.push(far);
        else line.unshift(far);
      }
    }
    lines.push(line);
  }
  return lines;
}

// Chaikin smoothing, twice, keeping the ends
function smooth(line) {
  let pts = line;
  for (let r = 0; r < 2; r++) {
    const out = [pts[0]];
    for (let k = 0; k < pts.length - 1; k++) {
      const [a, b] = [pts[k], pts[k + 1]];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  // thin out points closer than 9 units: the file stays small, the line stays smooth
  const thin = [pts[0]];
  for (const p of pts.slice(1)) {
    const q = thin[thin.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= 9) thin.push(p);
  }
  if (thin[thin.length - 1] !== pts[pts.length - 1]) thin.push(pts[pts.length - 1]);
  return thin;
}

const paths = [];
for (let l = 1; l <= LEVELS; l++) {
  const level = min + ((max - min) * l) / (LEVELS + 1);
  for (const line of join_(segments(level))) {
    if (line.length < 4) continue;
    const pts = smooth(line).map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`);
    // every fifth line is an index contour, drawn heavier, as on a survey map
    paths.push({ d: `M${pts.join("L")}`, index: l % 5 === 0 });
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#000" stroke-linejoin="round" stroke-linecap="round"><path stroke-width="1.1" d="${paths.filter((p) => !p.index).map((p) => p.d).join("")}"/><path stroke-width="2" d="${paths.filter((p) => p.index).map((p) => p.d).join("")}"/></g></svg>\n`;
const out = join(import.meta.dirname, "..", "public", "contours.svg");
await writeFile(out, svg);
console.log(`public/contours.svg: ${paths.length} lines, ${(svg.length / 1024).toFixed(1)} KB`);
