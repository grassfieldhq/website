# Grassfield website

The presentation site of Grassfield Desktop, in French and English. Next.js 16 (App Router), React 19, TypeScript,
CSS Modules, exported as static files (`out/`): no server, any static host works.

**Private until the public launch.** The Grassfield brief keeps everything private until the legal review (master
prompt §14). Crawlers are refused (`robots.txt`, `noindex`) until then.

## Commands

| | |
|---|---|
| `npm ci` | install (Node 22, see `.nvmrc`) |
| `npm run dev` | local dev server |
| `npm run lint` · `npm run typecheck` | ESLint (next/core-web-vitals + TS) · `tsc` |
| `npm run build` | static export to `out/` |
| `node scripts/serve.mjs` | serve `out/` on http://localhost:4321 |
| `npm test` | Playwright on the built site, desktop and phone, fr and en, home and Download: axe accessibility, overflow, images, language routing, the Overview scrub, the glass demo, the theme toggle (no flash), the FAQ and its structured data, the copy button |
| `npm run check` | all of the above, in order |
| `node scripts/og.mjs` | re-render `public/og.png` from the built hero |

## Layout

- `src/i18n/fr.ts` is the source text; `en.ts` must match its shape (`Dict` type). Routes: `/fr/`, `/en/`; `/` picks the
  visitor's language in the browser.
- `src/components/`: one component per chapter. Product renders (`DesktopScene`, `OverviewScrub`, the bento minis)
  are drawn in a virtual screen measured in `--u` (1/1440 of its width), so they scale like images and stay sharp.
- Visual direction "Aube" (dawn): the hero is the Grassfield wallpaper split into layers (`Landscape`) that move
  at their own pace on scroll (`ParallaxHero`, `useScrollProgress`); the page closes on the same field at dusk.
  Signature: a headline's full stop becomes a small sun (`Dot`). Chapters are rounded panels; the nav is a floating
  glass pill; the statement lights up word by word (`WordReveal`); a light film grain covers the page.
- Product colours, radii, dock and window geometry come from `grassfield/ui/tokens/tokens.json`; the wallpaper is the
  same procedure as `GrassfieldArtwork.qml`.
- `src/lib/release.ts`: the Download page's facts (version, packages, uninstall command). Fill `publish` (date,
  repository setup and install commands) when the `[grassfield]` repository is published; the page then shows them
  with copy buttons instead of "not released yet".
- Site appearance: automatic, light or dark (`ThemeToggle`), kept in `localStorage` and applied before first paint by
  the inline script in `src/lib/theme.ts`.
- `public/shots/`: real captures from the development instance. Replace them with dedicated `just shot` captures
  before launch.

## Before the public launch

- [ ] Legal review done (owner), then set `robots` to allow and remove `noindex` in `src/app/[lang]/layout.tsx`.
- [ ] Domain chosen: set `NEXT_PUBLIC_SITE_URL` at build time (placeholder `https://grassfield.invalid`).
- [ ] Hosting chosen (static: GitHub Pages, Cloudflare Pages, Netlify…), with security headers (CSP, HSTS).
- [ ] Fresh, dedicated captures.
- [ ] Fill `publish` in `src/lib/release.ts` with the published repository's setup and install commands.
- [ ] Licence of this repository's code (owner).

Assets and their licences: `NOTICE.md`.
