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
| `npm test` | Playwright on the built site: desktop and phone, fr and en, axe accessibility, overflow, images, language routing, the Overview scrub and the glass demo |
| `npm run check` | all of the above, in order |
| `node scripts/og.mjs` | re-render `public/og.png` from the built hero |

## Layout

- `src/i18n/fr.ts` is the source text; `en.ts` must match its shape (`Dict` type). Routes: `/fr/`, `/en/`; `/` picks the
  visitor's language in the browser.
- `src/components/`: one component per chapter. Product renders (`DesktopScene`, `OverviewScrub`, the bento minis)
  are drawn in a virtual screen measured in `--u` (1/1440 of its width), so they scale like images and stay sharp.
- Product colours, radii, dock and window geometry come from `grassfield/ui/tokens/tokens.json`; the wallpaper is the
  same procedure as `GrassfieldArtwork.qml`.
- `public/shots/`: real captures from the development instance. Replace them with dedicated `just shot` captures
  before launch.

## Before the public launch

- [ ] Legal review done (owner), then set `robots` to allow and remove `noindex` in `src/app/[lang]/layout.tsx`.
- [ ] Domain chosen: set `NEXT_PUBLIC_SITE_URL` at build time (placeholder `https://grassfield.invalid`).
- [ ] Hosting chosen (static: GitHub Pages, Cloudflare Pages, Netlify…), with security headers (CSP, HSTS).
- [ ] Fresh, dedicated captures; real install instructions once packages are published.
- [ ] Licence of this repository's code (owner).

Assets and their licences: `NOTICE.md`.
