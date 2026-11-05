# Grassfield website

The presentation site of Grassfield OS, in French and English. Positioning: Grassfield OS is the product (an
operating system based on Arch Linux, planned as M6 of the master plan); Grassfield Desktop, in beta on Omarchy 4, is
its first step. The roadmap chapter states what exists and what is planned, with no date. Next.js 16 (App Router), React 19, TypeScript,
CSS Modules, exported as static files (`out/`): no server, any static host works.

**Private until the public launch.** The Grassfield brief keeps everything private until the legal review (master
prompt §14). Crawlers are refused (`robots.txt`, `noindex`) until then.

## Commands

| | |
|---|---|
| `npm ci` | install (Node 22, see `.nvmrc`) |
| `npm run dev` | local dev server |
| `npm run lint` · `npm run typecheck` | ESLint (next/core-web-vitals + TS) · `tsc` |
| `npm run build` | static export to `out/`, then a Content Security Policy in each page (`scripts/csp.mjs`) |
| `node scripts/serve.mjs` | serve `out/` on http://localhost:4321 |
| `npm test` | Playwright on the built site, desktop and phone, fr and en, every page: axe accessibility, overflow, images, language routing, the Overview scrub, the glass demo, the theme toggle (no flash), the FAQ and its structured data, the copy button; captures: alt text in the page's language, every file served, no oversized image for the screen, no layout shift, light/dark variants, the lightbox, clips (poster, reduced motion), the tour without JavaScript |
| `npm run check` | all of the above, in order |
| `node scripts/og.mjs` | re-render `public/og.png` from the built hero |
| `node scripts/brand.mjs <grassfield-dir> [--check]` | bring the product's mark, icons, favicon and palette (`--gf-*`) into the site; `--check` exits 1 if the site drifted from the product |
| `node scripts/contours.mjs` | redraw `public/contours.svg`, the contour map of the two reliefs |
| `node scripts/shots.mjs <dir>` | turn a capture manifest into `public/shots/` and `src/lib/shots.generated.ts` (see Captures) |

## Layout

- Pages (`src/app/[lang]/`): home (Grassfield OS at a glance, then an index), `desktop/`, `apps/`, `security/`,
  `os/` (the flagship: the whole system, its layers, the roadmap, the name, today on Omarchy),
  `tour/` (every capture), `download/`, `faq/`, `legal/` (publisher and host from `publisher` in `src/lib/site.ts`,
  privacy, licences, marks); same paths in both languages. Each inner page opens on `PageHero` inside `PageShell`.
- `src/i18n/fr.ts` is the source text; `en.ts` must match its shape (`Dict` type). Routes: `/fr/`, `/en/`; `/` picks the
  visitor's language in the browser.
- `src/components/`: one component per chapter. Product renders (`DesktopScene`, `OverviewScrub`, the bento minis)
  are drawn in a virtual screen measured in `--u` (1/1440 of its width), so they scale like images and stay sharp.
- Visual direction "Hauts plateaux" (the highlands): paper and ink by day, "night on the plateau" in dark and in
  `.stage` sections; headlines in Fraunces (OFL, optical size follows the size), the text in Inter (the Grassfield
  session font), accent lines in Fraunces italic in the field's green (`.grad`). The ground is a contour map of the
  two reliefs of the mark (`public/contours.svg`, drawn by `scripts/contours.mjs`, applied as a CSS mask so it takes
  the theme's colour: `.contours`). The real captures stand on the plateau's ridge (`Ridge`, the wallpaper's hills
  without their sky) as figures with captions. Signature: a headline's full stop is the sun in ochre (`Dot`). Sections
  run full bleed between hairlines; numbers are set like a survey's table; the statement lights up word by word
  (`WordReveal`); a light paper grain covers the page. No gradient text, no rounded panels, no app-like cards.
- Product colours, radii, dock and window geometry come from `grassfield/ui/tokens/tokens.json` and the mark and icons
  from `grassfield/branding` (`scripts/brand.mjs` copies them and checks for drift); the wallpaper is the same
  procedure as `GrassfieldArtwork.qml`.
- `src/lib/release.ts`: the Download page's facts: version and channel, the stack it was tested on, the install
  script (`publish`: date, the one-liner first, then the download-check-run commands, the script's SHA-256, its
  options and log), the signing key, the packages and the uninstall command. The SHA-256 changes with every
  render of the script (`just render-install` in grassfield): compare it with the live `.sha256` before a release.
  The dictionaries quote its versions and host: a new release is one edit there. The commands come from the
  grassfield repository (`docs/install.md`, ADR-0043).
- Long pages carry a table of contents (`SectionNav`, a strip pinned under the header, the chapter on screen
  highlighted; `sections` per page in the dictionaries). The footer is the site map: pages, the tour's chapters,
  the install anchors, about this site.
- The shell (`PageShell`): a classic site header (`Header`: the mark and the name, the pages, Search, language,
  appearance, Download), the site's own navigation rather than the product's interface. Below 1080 px the pages fold
  into a native `<details>` menu, which opens without JavaScript. Search (`CommandSearch`, ⌘K / Ctrl+K or the loupe)
  reaches every page, FAQ answer and captured scene; its index is a static file per language
  (`app/[lang]/search.json`, from `src/lib/searchIndex.ts`) fetched the first time Search opens, so the pages do not
  carry it.
- Continuity: moving between pages is a cross-document view transition (`@view-transition`, a crossfade; off under
  reduced motion).
- Scenes (`Stage`): a tall track pins a screen and `--e` (0..1, eased) drives the scene's CSS while one caption per
  step crossfades; reduced motion shows the final frame unpinned. Security: the desktop capture blurs into the lock
  screen, then a drawn polkit sheet. Apps: four windows open in cascade (Files, Settings, Preview captures; the
  Store drawn). Download: terminal → restart → login → the desktop capture. The roadmap's sun (`RoadSun`) travels
  from step 1 towards step 2 and stops at the release candidate.
- Site appearance: automatic, light or dark (`ThemeToggle`), kept in `localStorage` and applied before first paint by
  the inline script in `src/lib/theme.ts`.
- `public/shots/`: real captures from the development instance, generated by `scripts/shots.mjs` (see Captures).

## Before the public launch

- [ ] Legal review done (owner), then set `robots` to allow, remove `noindex` in `src/app/[lang]/layout.tsx` and the
  `X-Robots-Tag` header in `public/_headers`.
- [x] Domain: grassfield.site (owner decision of 2026-11-03), the default of `siteUrl` in `src/lib/site.ts`.
- [x] Hosting: Cloudflare (owner decision of 2026-11-05), static files, with security headers (CSP, HSTS). See
  Deployment for the one-time setup.
- [ ] Fresh, dedicated captures: run `node scripts/shots.mjs` on the final set (see Captures).
- [x] Fill `publish` in `src/lib/release.ts`: the install script and its commands (1.0.0-rc3, beta channel,
  published 2026-11-05).
- [ ] Licence of this repository's code (owner).
- [ ] Fill `publisher` in `src/lib/site.ts` (name, status, address, e-mail, host): /legal/ and the footer's Contact
  then show them.

## Deployment

Cloudflare, static files only: the Workers project `website` serves the export in `out/` as static assets, with no Worker
code (`wrangler.jsonc`). Cloudflare's Git integration (Workers Builds) runs `npx wrangler deploy` on every push to
`main`; wrangler first runs the build in `wrangler.jsonc` (`npm ci && npm run build`). So merging into `main` publishes.
CI's checks run on the pull request beside the "Workers Builds: website" check.

- **Headers** (`public/_headers`, copied to `out/_headers`): HSTS, `frame-ancestors 'none'`, nosniff, referrer and
  permissions policies, COOP, `X-Robots-Tag: noindex` until the launch; a year's immutable cache for `/_next/static/`
  and `/shots/`, whose names carry a hash. `html_handling: auto-trailing-slash` sends `/fr/os` to `/fr/os/`, like the
  export's folders; a missing page gets `404.html`. The Content Security Policy is a `<meta>` that `scripts/csp.mjs`
  writes into each page at the end of `npm run build`: scripts from this origin plus the page's own inline scripts by
  hash, nothing from other origins. A new inline script needs nothing; a new origin (fonts, analytics, a video host)
  needs a line in its `policy()`.
- **By hand**: `npx wrangler deploy` from a checkout, with `CLOUDFLARE_ACCOUNT_ID` set and a logged-in wrangler.
- **Setup, once** (owner):
  1. Workers & Pages › `website` › Settings › Domains & Routes › Add › Custom domain: `grassfield.site`, then
     `www.grassfield.site`. If the dashboard reports an existing DNS record for a name, remove that record (and the
     redirect rule that sends `grassfield.site` to `www`), then add the domain again.
  2. Workers & Pages › `website` › Settings › Builds: the repository `grassfieldhq/website`, branch `main`, deploy
     command `npx wrangler deploy` (the default), build command empty (wrangler runs the build).
  3. Private until the launch: `noindex` keeps the site out of search engines, not out of reach.

## Captures

Every capture on the site goes through one command:

```sh
node scripts/shots.mjs <dir>          # <dir>/manifest.json, paths in it relative to <dir>
npm run check                         # then look at /fr/tour/ and /en/tour/
```

It needs ImageMagick 7 (`magick`) and libavif (`avifenc`); `ffprobe` is optional (clip durations).

- **Manifest**: an array, one object per capture and language: `{ id, lang: "fr"|"en", kind?: "screen"|"detail"|"clip",
  theme: "dark"|"light", file, width, height, scale?, feature, title, caption, alt, demo_data, parent?, poster?,
  video?: { webm?, mp4? } }`. `kind` defaults to `screen`; a `detail` is a close-up cut from the scene `parent`; a
  `clip` has `video` and an image `poster` (or `file`). `title`, `caption` and `alt` are in the capture's language.
- **Light and dark**: two captures of one scene share their id up to a final `-dark` / `-light`
  (`files-columns-dark`, `files-columns-light`). Where both exist the site shows the one matching its own appearance
  (system or toggle), without JavaScript; the other one is `display: none` and never downloaded.
- **Output**: AVIF (4:4:4) and WebP at a few widths, never upscaled; screens AVIF 960/1600/2880 and WebP 960/1600,
  close-ups AVIF 480/960/1600 and WebP 480/960, clip posters both at 960/1600. Clips are copied as given. Names carry a
  hash of the source and the settings: a rerun on the same input encodes nothing and writes identical files, and every
  file in `public/shots/` the manifest did not produce is deleted (the directory belongs to the script).
- **Weight**: printed per kind and format. Screens have a budget (`--budget-screens=30`, MB): over it, the script
  steps down to lower qualities, then smaller top widths (`--tier=0|1|2` forces a tier); close-ups have
  `--budget-details=8`; each clip file should stay under `--clip-max=1.5`. Time, measured on 8 cores: 17 screens at
  1920 px plus 3 close-ups and a clip encode in 100 to 170 s; one 2880 px AVIF takes about 7 s. Estimate, not measured:
  10 to 20 minutes for 200 screens at 2880 px. A rerun on unchanged captures takes seconds.
- **Data**: `src/lib/shots.generated.ts` (do not edit), read through `src/lib/shots.ts`: scenes per language, `slot()`
  for the captures a chapter shows, `byFeature()` for galleries.
- **Components**: `Shot` (a `<picture>` with AVIF then WebP, `srcset`/`sizes`, intrinsic size, lazy unless `eager`,
  optional zoom on a region, light/dark variants), `Clip` (muted, looped, `preload="none"`, a lazy poster under the
  video, native controls without JavaScript, autoplay only while half visible and never under reduced motion, a
  play/pause button), `Gallery` / `FeatureBlock` (screens, then close-ups at their own size, then clips), `Lightbox`
  (gallery links open the full-size image; with JavaScript, a `<dialog>` with ← → and Escape), `SystemMap` (the
  system's surfaces as tiles: a summary on home, every tile grouped on `os/`; tiles in `src/lib/system.ts`).
- **Where they show** (a missing capture is skipped; a chapter with a drawn render keeps it):

  | Place | Slot or features | Ids looked for (base id, then the feature) |
  |---|---|---|
  | Desktop › Overview | `overview` | `overview`, then feature `overview` |
  | Desktop › Every day: Search, Quick Settings, Notifications tiles | `search`, `controlcenter`, `notifications` | `search`, `controlcenter`, `notifications`, then the same features (zoomed on the panel) |
  | Desktop › Every day: menus in the menu bar | `menus` | `menubar-app-menu`, `menubar-menu`, `app-menu`, `global-menu` (no feature fallback) |
  | Desktop › Every day: window layouts (tile appears with it) | `tiling` | `tiling`, then feature `tiling` |
  | Desktop › Glass: light and dark side by side | pair | `settings-appearance`, `files-settings`, `desktop`, then any scene in both appearances |
  | Desktop › gallery | features | `desktop` `widgets` `menubar` `dock` `controlcenter` `notifications` `search` `overview` `tiling` `apps` |
  | Apps › Settings | `settings` | `settings-appearance`, `settings`, `files-settings`, then feature `settings` |
  | Apps › each app, then gallery | features | Files `files`; Settings `settings` `update`; Preview `preview`; Store `store`; then `activity` `dialogs` |
  | Security › lock screen | `lock` | `lock`, then feature `lock` |
  | Security › gallery | features | `lock` `polkit` |
  | Home and OS › the system's tiles | `systemTiles` (`src/lib/system.ts`) | per tile, its bases in order (close-ups first); a tile without a match is left out, an icon tile always shows |
  | Tour | everything | by feature, in the order of `shots.features` in `src/i18n/fr.ts`; unknown features go under "And more" |

  Slots, their framing and the page features are in `src/lib/shots.ts`; feature names and descriptions in
  `shots.features` of `src/i18n/fr.ts` and `en.ts`.

Assets and their licences: `NOTICE.md`.
