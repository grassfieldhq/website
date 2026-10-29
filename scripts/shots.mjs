// Capture pipeline: turns a capture manifest into optimized images, clips and src/lib/shots.generated.ts.
//
//   node scripts/shots.mjs <manifest-dir> [--tier=0|1|2] [--budget-screens=MB] [--budget-details=MB] [--clip-max=MB]
//
// <manifest-dir>/manifest.json is an array, one object per capture and language:
//   { id, lang: "fr"|"en", kind?: "screen"|"detail"|"clip", theme: "dark"|"light", file, width, height, scale?,
//     feature, title, caption, alt, demo_data, parent? (details: the scene id), poster? and video?: { webm?, mp4? } (clips) }
// Paths are relative to <manifest-dir>. A light and a dark capture of the same scene share an id up to a final
// "-light" / "-dark"; the site shows the one that matches its own appearance.
//
// public/shots/ belongs to this script: it writes AVIF and WebP at a few widths (never upscaled), copies clips, and
// deletes every file there that the current manifest did not produce. File names carry a hash of the source and the
// encoder settings, so a rerun on the same input re-encodes nothing and writes the same bytes and the same data file.
// Needs ImageMagick 7 (`magick`) and libavif (`avifenc`); `ffprobe` is optional (clip sizes and durations).
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "public", "shots");
const dataFile = join(root, "src", "lib", "shots.generated.ts");
const urlPrefix = "/shots/";
const MB = 1024 * 1024;

// Encoding plans. Screens step down a tier (quality first, then the largest widths) when they exceed their budget.
// WebP is the fallback for browsers without AVIF, so it gets fewer widths.
const SCREEN_TIERS = [
  { avif: { q: 55, widths: [960, 1600, 2880] }, webp: { q: 74, widths: [960, 1600] } },
  { avif: { q: 48, widths: [960, 1600, 2400] }, webp: { q: 70, widths: [1600] } },
  { avif: { q: 42, widths: [800, 1440, 2048] }, webp: { q: 66, widths: [1440] } },
];
const DETAIL_PLAN = { avif: { q: 60, widths: [480, 960, 1600] }, webp: { q: 76, widths: [480, 960] } };
const POSTER_PLAN = { avif: { q: 52, widths: [960, 1600] }, webp: { q: 72, widths: [960, 1600] } };
const ENCODER = "avifenc-s6-yuv444-d8/webp-m6-sharpyuv/v1"; // part of every hash: change it to force a re-encode

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split("=")[1]) : fallback;
};
const srcDir = args.find((a) => !a.startsWith("--"));
if (!srcDir) {
  console.error("usage: node scripts/shots.mjs <manifest-dir> [--tier=N] [--budget-screens=MB] [--budget-details=MB] [--clip-max=MB]");
  process.exit(64);
}
const budget = { screen: opt("budget-screens", 30) * MB, detail: opt("budget-details", 8) * MB, clipEach: opt("clip-max", 1.5) * MB };
const startTier = Math.min(Math.max(opt("tier", 0), 0), SCREEN_TIERS.length - 1);
const base = resolve(srcDir);

// ---------------------------------------------------------------- validation
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function inside(where, rel) {
  if (!isStr(rel)) return fail(where, "missing path"), null;
  const abs = resolve(base, normalize(rel));
  const r = relative(base, abs);
  if (isAbsolute(rel) || r === ".." || r.startsWith(`..${sep}`)) {
    return fail(where, `path leaves the manifest directory: ${rel}`), null;
  }
  return abs;
}

async function exists(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function imageSize(p) {
  const { stdout } = await exec("magick", ["identify", "-ping", "-format", "%w %h", `${p}[0]`]);
  const [w, h] = stdout.trim().split(" ").map(Number);
  return { w, h };
}

async function videoInfo(p) {
  try {
    const { stdout } = await exec("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", p]);
    const j = JSON.parse(stdout);
    return { w: j.streams?.[0]?.width, h: j.streams?.[0]?.height, duration: Math.round(Number(j.format?.duration ?? 0) * 10) / 10 };
  } catch {
    return null;
  }
}

const sha = (...parts) => {
  const h = createHash("sha256");
  for (const p of parts) h.update(p);
  return h.digest("hex");
};

for (const tool of ["magick", "avifenc"]) {
  try {
    await exec(tool, ["--version"]);
  } catch {
    console.error(`missing tool: ${tool}`);
    process.exit(69);
  }
}

let manifest;
try {
  manifest = JSON.parse(await readFile(join(base, "manifest.json"), "utf8"));
} catch (e) {
  console.error(`cannot read ${join(base, "manifest.json")}: ${e.message}`);
  process.exit(66);
}
if (!Array.isArray(manifest)) {
  console.error("manifest.json must be an array");
  process.exit(65);
}

const seen = new Set();
const entries = [];
for (const [i, m] of manifest.entries()) {
  const where = `manifest[${i}]${m && m.id ? ` ${m.id}.${m.lang}` : ""}`;
  if (!m || typeof m !== "object") {
    fail(where, "not an object");
    continue;
  }
  const kind = m.kind ?? "screen";
  if (!["screen", "detail", "clip"].includes(kind)) fail(where, `kind must be screen, detail or clip, not ${kind}`);
  if (!isStr(m.id) || !ID.test(m.id)) fail(where, `id must be lowercase words joined by "-": ${m.id}`);
  if (!["fr", "en"].includes(m.lang)) fail(where, `lang must be fr or en: ${m.lang}`);
  if (!["dark", "light"].includes(m.theme)) fail(where, `theme must be dark or light: ${m.theme}`);
  if (!isStr(m.feature) || !ID.test(m.feature)) fail(where, `feature must be lowercase words joined by "-": ${m.feature}`);
  for (const k of ["title", "alt"]) if (!isStr(m[k])) fail(where, `${k} is required`);
  if (m.caption !== undefined && typeof m.caption !== "string") fail(where, "caption must be a string");
  if (m.scale !== undefined && !(Number(m.scale) > 0)) fail(where, `scale must be a positive number: ${m.scale}`);
  const key = `${m.id}.${m.lang}`;
  if (seen.has(key)) fail(where, "duplicate id for this language");
  seen.add(key);

  const image = inside(where, kind === "clip" ? (m.poster ?? m.file) : m.file);
  if (image && !(await exists(image))) fail(where, `file not found: ${kind === "clip" ? (m.poster ?? m.file) : m.file}`);
  const video = {};
  if (kind === "clip") {
    if (!m.video || (!m.video.webm && !m.video.mp4)) fail(where, "a clip needs video.webm and/or video.mp4");
    for (const f of ["webm", "mp4"]) {
      if (!m.video?.[f]) continue;
      const p = inside(where, m.video[f]);
      if (p && !(await exists(p))) fail(where, `video not found: ${m.video[f]}`);
      else if (p && extname(p).toLowerCase() !== `.${f}`) fail(where, `video.${f} must be a .${f} file`);
      else if (p) video[f] = p;
    }
  }
  if (kind === "detail" && m.parent !== undefined && !isStr(m.parent)) fail(where, "parent must be a scene id");
  entries.push({ m, kind, image, video, where });
}
if (errors.length) {
  console.error(`manifest has ${errors.length} error(s):\n  ${errors.join("\n  ")}`);
  process.exit(65);
}
const byKey = new Set(entries.map((e) => `${e.m.id}.${e.m.lang}`));
for (const e of entries) {
  const other = e.m.lang === "fr" ? "en" : "fr";
  if (!byKey.has(`${e.m.id}.${other}`)) warnings.push(`${e.m.id}: no ${other} version, shown in ${e.m.lang} only`);
  if (e.kind === "detail" && e.m.parent && !byKey.has(`${e.m.parent}.${e.m.lang}`)) warnings.push(`${e.m.id}.${e.m.lang}: parent ${e.m.parent} not in the manifest`);
}

// ---------------------------------------------------------------- encoding
await mkdir(outDir, { recursive: true });
const tmpDir = join(outDir, `.tmp-${process.pid}`);
await mkdir(tmpDir, { recursive: true });

const jobs = new Map(); // output name -> async job (deduplicated: fr and en may share a source)
const sourceHash = new Map();
async function hashOf(p) {
  if (!sourceHash.has(p)) sourceHash.set(p, readFile(p).then((b) => sha(b)));
  return sourceHash.get(p);
}

const widthsFor = (targets, w) => {
  const out = targets.filter((t) => t < w);
  const top = Math.min(w, Math.max(...targets));
  if (!out.includes(top)) out.push(top);
  return out.sort((a, b) => a - b);
};

// A tiny worker pool: avifenc is itself multi-threaded, so half the cores run jobs.
const slots = Math.max(1, Math.floor(availableParallelism() / 2));
let running = 0;
const waiting = [];
async function limited(fn) {
  if (running >= slots) await new Promise((r) => waiting.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

let encoded = 0;
function encode(src, srcW, name, format, q, w) {
  if (!jobs.has(name)) {
    jobs.set(
      name,
      (async () => {
        const dest = join(outDir, name);
        if (await exists(dest)) return;
        await limited(async () => {
          const part = join(tmpDir, name);
          if (format === "webp") {
            const resize = w < srcW ? ["-resize", `${w}x`] : [];
            await exec("magick", [src, "-strip", ...resize, "-quality", String(q), "-define", "webp:method=6", "-define", "webp:use-sharp-yuv=true", `webp:${part}`]);
          } else {
            // avifenc reads PNG and JPEG: anything else, and every smaller width, goes through a PNG first
            let input = src;
            if (w < srcW || !/\.(png|jpe?g)$/i.test(src)) {
              input = join(tmpDir, `${name}.png`);
              const resize = w < srcW ? ["-resize", `${w}x`] : [];
              await exec("magick", [src, "-strip", ...resize, "-define", "png:exclude-chunks=date,time", "-define", "png:compression-level=1", `png:${input}`]);
            }
            await exec("avifenc", ["-q", String(q), "-s", "6", "-j", "2", "-d", "8", "-y", "444", "--ignore-exif", "--ignore-xmp", "--ignore-icc", input, part]);
            if (input !== src) await rm(input, { force: true });
          }
          await rename(part, dest);
          encoded++;
        });
      })(),
    );
  }
  return jobs.get(name);
}

async function images(e, plan) {
  const { w, h } = await imageSize(e.image);
  if (e.m.width && e.m.height && (e.m.width !== w || e.m.height !== h)) warnings.push(`${e.m.id}.${e.m.lang}: declared ${e.m.width}×${e.m.height}, file is ${w}×${h}`);
  const hash = await hashOf(e.image);
  const out = { width: w, height: h, avif: [], webp: [] };
  const work = [];
  for (const format of ["avif", "webp"]) {
    const { q, widths } = plan[format];
    const tag = sha(hash, format, String(q), ENCODER).slice(0, 10);
    for (const width of widthsFor(widths, w)) {
      const name = `${e.m.id}-${tag}-${width}.${format}`;
      out[format].push({ w: width, src: urlPrefix + name });
      work.push(encode(e.image, w, name, format, q, width));
    }
  }
  await Promise.all(work);
  return out;
}

async function clipFiles(e) {
  const out = {};
  for (const [f, p] of Object.entries(e.video)) {
    const name = `${e.m.id}-${(await hashOf(p)).slice(0, 10)}.${f}`;
    if (!jobs.has(name)) jobs.set(name, (async () => !(await exists(join(outDir, name))) && copyFile(p, join(outDir, name)))());
    await jobs.get(name);
    const bytes = (await stat(p)).size;
    if (bytes > budget.clipEach) warnings.push(`${e.m.id}.${f}: ${(bytes / MB).toFixed(2)} MB, over the ${(budget.clipEach / MB).toFixed(1)} MB per clip budget`);
    out[f] = urlPrefix + name;
  }
  const info = await videoInfo(e.video.webm ?? e.video.mp4);
  return { ...out, duration: info?.duration ?? null, vw: info?.w ?? null, vh: info?.h ?? null };
}

const sizeOf = async (urls) => {
  let n = 0;
  for (const u of new Set(urls)) n += (await stat(join(outDir, u.slice(urlPrefix.length)))).size;
  return n;
};
const urlsOf = (records) => records.flatMap((r) => [...r.avif, ...r.webp].map((s) => s.src).concat(r.video ? [r.video.webm, r.video.mp4].filter(Boolean) : []));

const t0 = Date.now();
const records = new Map(); // manifest index -> record
for (const [i, e] of entries.entries()) {
  if (e.kind === "detail") records.set(i, { e, ...(await images(e, DETAIL_PLAN)) });
  if (e.kind === "clip") {
    const [img, video] = await Promise.all([images(e, POSTER_PLAN), clipFiles(e)]);
    if (video.vw && video.vh && Math.abs(video.vw / video.vh - img.width / img.height) > 0.01) warnings.push(`${e.m.id}.${e.m.lang}: poster and video aspect ratios differ`);
    records.set(i, { e, ...img, video });
  }
}
let tier = startTier;
// Project the screens' weight from a sample first, so an over-budget set costs a few encodes, not a whole pass.
const screenIdx = entries.flatMap((e, i) => (e.kind === "screen" ? [i] : []));
const bySource = new Map();
for (const i of screenIdx) bySource.set(await hashOf(entries[i].image), i);
const sample = [...bySource.values()].slice(0, 6);
while (sample.length && tier < SCREEN_TIERS.length - 1) {
  const recs = await Promise.all(sample.map((i) => images(entries[i], SCREEN_TIERS[tier])));
  const projected = ((await sizeOf(urlsOf(recs))) / sample.length) * bySource.size;
  if (projected <= budget.screen) break;
  console.log(`screens: about ${(projected / MB).toFixed(1)} MB projected at tier ${tier}, over ${(budget.screen / MB).toFixed(1)} MB: trying tier ${tier + 1}`);
  tier++;
}
for (;;) {
  const plan = SCREEN_TIERS[tier];
  await Promise.all(entries.map(async (e, i) => e.kind === "screen" && records.set(i, { e, ...(await images(e, plan)) })));
  const screenBytes = await sizeOf(urlsOf([...records.values()].filter((r) => r.e.kind === "screen")));
  if (screenBytes <= budget.screen || tier === SCREEN_TIERS.length - 1) {
    if (screenBytes > budget.screen) warnings.push(`screens: ${(screenBytes / MB).toFixed(1)} MB, still over the ${(budget.screen / MB).toFixed(1)} MB budget at the last tier`);
    break;
  }
  console.log(`screens: ${(screenBytes / MB).toFixed(1)} MB at tier ${tier}, over ${(budget.screen / MB).toFixed(1)} MB: trying tier ${tier + 1}`);
  tier++;
}
await rm(tmpDir, { recursive: true, force: true });

// ---------------------------------------------------------------- data file
const variantBase = (id) => id.replace(/-(dark|light)$/, "");
const data = [...records.keys()]
  .sort((a, b) => a - b)
  .map((i) => {
    const { e, width, height, avif, webp, video } = records.get(i);
    const m = e.m;
    const o = {
      id: m.id,
      base: variantBase(m.id),
      lang: m.lang,
      kind: e.kind,
      theme: m.theme,
      feature: m.feature,
      parent: e.kind === "detail" && m.parent ? variantBase(m.parent) : null,
      title: m.title.trim(),
      caption: (m.caption ?? "").trim(),
      alt: m.alt.trim(),
      demo: m.demo_data !== false,
      width,
      height,
      scale: Number(e.m.scale ?? 1),
      avif,
      webp,
    };
    if (video) o.video = { webm: video.webm ?? null, mp4: video.mp4 ?? null, duration: video.duration };
    return o;
  });

const ts = `// Generated by scripts/shots.mjs from a capture manifest: do not edit, rerun the script.
import type { ShotData } from "./shots";

export const shotData: readonly ShotData[] = ${JSON.stringify(data, null, 2)};
`;
await writeFile(dataFile, ts);

// ---------------------------------------------------------------- cleanup and report
const keep = new Set(urlsOf([...records.values()]).map((u) => u.slice(urlPrefix.length)));
let removed = 0;
for (const f of await readdir(outDir)) {
  if (keep.has(f)) continue;
  await rm(join(outDir, f), { recursive: true, force: true });
  removed++;
}

const kinds = ["screen", "detail", "clip"];
const fmt = (n) => `${(n / MB).toFixed(2)} MB`;
const rows = [];
let total = 0;
for (const k of kinds) {
  const rs = [...records.values()].filter((r) => r.e.kind === k);
  if (!rs.length) continue;
  const bytes = { avif: 0, webp: 0, video: 0 };
  const seenUrl = new Set();
  for (const r of rs) {
    for (const f of ["avif", "webp"]) for (const s of r[f]) if (!seenUrl.has(s.src) && seenUrl.add(s.src)) bytes[f] += (await stat(join(outDir, s.src.slice(urlPrefix.length)))).size;
    for (const u of r.video ? [r.video.webm, r.video.mp4] : []) if (u && !seenUrl.has(u) && seenUrl.add(u)) bytes.video += (await stat(join(outDir, u.slice(urlPrefix.length)))).size;
  }
  const sum = bytes.avif + bytes.webp + bytes.video;
  total += sum;
  const lim = k === "screen" ? ` (budget ${fmt(budget.screen)}, tier ${tier})` : k === "detail" ? ` (budget ${fmt(budget.detail)})` : ` (max ${fmt(budget.clipEach)} per clip file)`;
  if (k === "detail" && sum > budget.detail) warnings.push(`details: ${fmt(sum)}, over the ${fmt(budget.detail)} budget`);
  rows.push(`  ${k.padEnd(7)} ${String(rs.length).padStart(4)} entries  ${fmt(sum).padStart(10)}  avif ${fmt(bytes.avif)} · webp ${fmt(bytes.webp)}${bytes.video ? ` · video ${fmt(bytes.video)}` : ""}${lim}`);
}
const files = (await readdir(outDir)).length;
console.log(`shots: ${data.length} entries (${data.filter((d) => d.lang === "fr").length} fr, ${data.filter((d) => d.lang === "en").length} en), ${files} files in public/shots/, ${encoded} encoded, ${removed} stale removed, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(rows.join("\n"));
console.log(`  total           ${fmt(total).padStart(10)}`);
console.log(`data: ${relative(root, dataFile)}`);
const warned = [...new Set(warnings)]; // a screen is measured again at each tier
if (warned.length) console.log(`warnings (${warned.length}):\n  ${warned.join("\n  ")}`);
