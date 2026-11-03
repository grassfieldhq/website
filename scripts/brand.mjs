// Brings the product's identity into the site: the mark, the symbolic and app icons the site uses, the favicon and the
// product palette (--gf-* in src/app/globals.css) from a Grassfield checkout.
//   node scripts/brand.mjs <grassfield-dir>           copy and rewrite
//   node scripts/brand.mjs <grassfield-dir> --check   change nothing, exit 1 if the site differs from the product
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const [dir, flag] = process.argv.slice(2);
if (!dir || !existsSync(join(dir, "ui/tokens/tokens.json"))) {
  console.error("usage: node scripts/brand.mjs <grassfield-dir> [--check]  (the directory holding ui/tokens/tokens.json)");
  process.exit(2);
}
const check = flag === "--check";
const site = join(import.meta.dirname, "..");
const drift = [];

async function sync(from, to, transform = (s) => s) {
  const want = transform(await readFile(from, "utf8"));
  const have = existsSync(to) ? await readFile(to, "utf8") : null;
  if (have === want) return;
  drift.push(to.slice(site.length + 1));
  if (!check) await writeFile(to, want);
}

// Icons: every file the site already carries, from the same place in the product, plus the full mark for large uses
// (the product's grassfield-logo.svg is a 16-24 px optical version, grassfield-logo-full.svg the drawing).
for (const kind of ["symbolic", "apps"]) {
  const names = new Set(await readdir(join(site, "public/icons", kind)));
  if (kind === "symbolic") names.add("grassfield-logo-full.svg");
  for (const name of names) {
    const from = join(dir, "branding/icons", kind, name);
    if (!existsSync(from)) {
      console.error(`not in the product: branding/icons/${kind}/${name}`);
      process.exitCode = 1;
      continue;
    }
    await sync(from, join(site, "public/icons", kind, name));
  }
}
// The favicon: the small mark in the green of Grassfield's app icons (#26763F, branding/icons/apps).
await sync(join(dir, "branding/icons/symbolic/grassfield-logo.svg"), join(site, "src/app/icon.svg"), (s) => s.replace(/fill="#000(000)?"/g, 'fill="#26763F"'));

// The product palette: the renders show the product in its dark appearance.
const tokens = JSON.parse(await readFile(join(dir, "ui/tokens/tokens.json"), "utf8"));
const token = (path) => {
  const v = path.split(".").reduce((o, k) => o?.[k], tokens);
  const value = v && typeof v === "object" ? v.value : v;
  if (typeof value !== "string") throw new Error(`no token ${path}`);
  return value.toLowerCase();
};
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
const palette = {
  "--gf-text": token("color.dark.text"),
  "--gf-text-2": token("color.dark.textSecondary"),
  "--gf-tint": `rgb(${channels(token("color.dark.materialTint"))} / 0.72)`,
  "--gf-tint-rgb": channels(token("color.dark.materialTint")),
  "--gf-light-tint-rgb": channels(token("color.light.materialTint")),
  "--gf-light-text": token("color.light.text"),
  "--gf-light-text-2": token("color.light.textSecondary"),
  "--gf-window": token("color.dark.windowBackground"),
  "--gf-sidebar": token("color.dark.sidebarFill"),
  "--gf-close": token("window.closeColor"),
  "--gf-min": token("window.minimizeColor"),
  "--gf-zoom": token("window.zoomColor"),
  "--gf-green": token("color.dark.accent"),
  "--gf-green-ink": token("color.dark.accentText"),
};
const cssPath = join(site, "src/app/globals.css");
await sync(cssPath, cssPath, (css) => {
  for (const [name, value] of Object.entries(palette)) {
    const re = new RegExp(`(${name}:\\s*)([^;]+);`);
    if (!re.test(css)) throw new Error(`${name} is not in globals.css`);
    css = css.replace(re, `$1${value};`);
  }
  return css;
});

if (drift.length === 0) console.log("the site matches the product");
else console.log(`${check ? "differs from the product" : "updated"}: ${drift.join(", ")}`);
if (check && drift.length > 0) process.exitCode = 1;
