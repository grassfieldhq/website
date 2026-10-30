// Content Security Policy for the static export, run after `next build`. Each page may run only its own inline scripts
// (the theme script, the root's language pick, Next's payload), allowed by hash, and script files from this origin.
// The policy goes in a <meta> at the top of each page, so any static host and the tests' server apply it.
// frame-ancestors is ignored in a <meta>: public/_headers sends it as a header.
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "out");
const charset = '<meta charSet="utf-8"/>';
const scripts = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const executable = (attrs) => !/\stype=/.test(attrs) || /\stype="(text\/javascript|module)"/.test(attrs); // not JSON-LD
const sha256 = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

function policy(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`,
    "style-src 'self' 'unsafe-inline'", // React's style attributes
    "img-src 'self' data:", // the film grain and the landscape are SVG data URIs in the CSS
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join("; ");
}

const pages = (await readdir(root, { recursive: true })).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const path = join(root, file);
  const html = (await readFile(path, "utf8")).replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
  if (!html.includes(charset)) throw new Error(`${file}: no ${charset} to put the policy after`);
  const hashes = [...new Set([...html.matchAll(scripts)].filter(([, attrs]) => executable(attrs)).map(([, , body]) => sha256(body)))];
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(hashes)}"/>`;
  await writeFile(path, html.replace(charset, charset + meta));
}
console.log(`csp: ${pages.length} pages`);
