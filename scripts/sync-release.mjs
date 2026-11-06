// Keeps src/lib/published.json (the version and date the Download page shows) equal to what the beta channel serves.
// Source: the channel's grassfield-notes.json at packages.grassfield.site, written by grassfield-packages' publish run;
// its newest release is the one the install script and Software Update install. Run by .github/workflows/release-sync.yml
// (hourly and on demand) and by hand: `node scripts/sync-release.mjs`. Exit 0: up to date or updated (the workflow commits
// the change); exit 1: the server's answer is not usable, or the install script's SHA-256 no longer matches the copy in
// src/lib/release.ts.
//
// The script's SHA-256 is NOT synced: ADR-0043 IN8 wants the site to hold a copy independent of the package server, so a
// change there must be checked and copied by a person. This script only reports the mismatch.
import { readFile, writeFile } from "node:fs/promises";

const base = "https://packages.grassfield.site";
const notesUrl = `${base}/beta/x86_64/grassfield-notes.json`;
const shaUrl = `${base}/install/grassfield-install.sh.sha256`;
const dataPath = new URL("../src/lib/published.json", import.meta.url);
const releasePath = new URL("../src/lib/release.ts", import.meta.url);

// A pacman version of a Grassfield build: 1.0.0rc6-1, 1.0.0beta2-1, 1.0.0-1 (ADR-0033: the tag's hyphen is dropped).
const pkgPattern = /^(\d+\.\d+\.\d+)((?:rc|beta)\d+)?-\d+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "grassfield-website-release-sync" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > 64 * 1024) throw new Error(`${url}: larger than 64 KiB`);
  return text;
}

function fail(message) {
  console.error(`sync-release: ${message}`);
  process.exit(1);
}

let notes;
try {
  notes = JSON.parse(await fetchText(notesUrl));
} catch (e) {
  fail(`cannot read the beta channel's notes: ${e.message}`);
}
const newest = Array.isArray(notes?.releases) ? notes.releases[0] : undefined;
const m = typeof newest?.version === "string" ? pkgPattern.exec(newest.version) : null;
if (!m) fail(`the newest release has no usable version: ${JSON.stringify(newest?.version)}`);
if (typeof newest.date !== "string" || !datePattern.test(newest.date) || Number.isNaN(Date.parse(newest.date))) {
  fail(`the newest release has no usable date: ${JSON.stringify(newest.date)}`);
}
const published = {
  version: m[2] ? `${m[1]}-${m[2]}` : m[1],
  pkgver: `${m[1]}${m[2] ?? ""}`,
  date: newest.date,
};

const current = JSON.parse(await readFile(dataPath, "utf8"));
if (current.version === published.version && current.pkgver === published.pkgver && current.date === published.date) {
  console.log(`sync-release: up to date (${published.version}, ${published.date})`);
} else {
  await writeFile(dataPath, `${JSON.stringify(published, null, 2)}\n`);
  console.log(`sync-release: ${current.version} (${current.date}) -> ${published.version} (${published.date})`);
}

// The install script's checksum: reported, never copied (IN8).
let live;
try {
  live = (await fetchText(shaUrl)).trim().split(/\s+/)[0];
} catch (e) {
  fail(`cannot read the install script's checksum: ${e.message}`);
}
const site = /sha256:\s*"([0-9a-f]{64})"/.exec(await readFile(releasePath, "utf8"))?.[1];
if (live !== site) {
  fail(
    `the install script's SHA-256 changed on the package server (${live}); the site still shows ${site}. Check the new ` +
      "script against grassfield's rendered copy (just render-install), then copy its hash into src/lib/release.ts by hand.",
  );
}
