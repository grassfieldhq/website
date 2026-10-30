import type { ReactNode } from "react";
import type { Dict, Locale } from "@/i18n";
import { searchIndex } from "@/lib/searchIndex";
import { scenes } from "@/lib/shots";
import { SectionNav } from "./SectionNav";
import { CommandSearch } from "./CommandSearch";
import { DockNav } from "./DockNav";
import { Footer } from "./Footer";
import { MenuBar } from "./MenuBar";

// Every page lives inside the shell: skip link, the menu bar, the content, the footer, the Dock and Search.
// `path` is the page's path under /[lang]/ ("" for home); `pageName` is what the menu bar shows as the app's name.
export function PageShell({ t, lang, path, pageName, sections, children }: { t: Dict; lang: Locale; path: string; pageName?: string; sections?: string[][]; children: ReactNode }) {
  const name = pageName ?? pageNameFor(t, path);
  // the tour's chapters, for the footer's site map: the features the capture set actually has
  const have = new Set(scenes(lang).map((sc) => sc.feature));
  const features = t.shots.features as Record<string, { title: string }>;
  const tour = Object.entries(features).filter(([f]) => have.has(f)).map(([f, v]) => [f, v.title] as [string, string]);
  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <MenuBar t={t} lang={lang} path={path} pageName={name} />
      {/* the Dock comes right after the menu bar in the document: a keyboard reaches the navigation in a few tabs */}
      <DockNav
        t={{ dock: t.shell.dockLabel, home: t.shell.home, desktop: t.nav.desktop, apps: t.nav.apps, security: t.nav.security, os: t.nav.os, tour: t.nav.tour, download: t.nav.download, faq: t.nav.faq }}
        lang={lang}
        path={path}
      />
      {sections && <SectionNav label={t.sections.label} items={sections} />}
      <main id="main">{children}</main>
      <Footer t={t.footer} nav={t.nav} lang={lang} path={path} privacy={t.privacy.statement} tour={tour} />
      <CommandSearch t={t.shell} index={searchIndex(lang, t)} />
    </>
  );
}

function pageNameFor(t: Dict, path: string): string {
  const names: Record<string, string> = {
    "": "Grassfield",
    "desktop/": t.nav.desktop,
    "apps/": t.nav.apps,
    "security/": t.nav.security,
    "os/": t.nav.os,
    "tour/": t.nav.tour,
    "download/": t.nav.download,
    "faq/": t.nav.faq,
    "legal/": t.nav.legal,
  };
  return names[path] ?? "Grassfield";
}
