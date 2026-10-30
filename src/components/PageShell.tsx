import type { ReactNode } from "react";
import type { Dict, Locale } from "@/i18n";
import { searchIndex } from "@/lib/searchIndex";
import { CommandSearch } from "./CommandSearch";
import { DockNav } from "./DockNav";
import { Footer } from "./Footer";
import { MenuBar } from "./MenuBar";

// Every page lives inside the shell: skip link, the menu bar, the content, the footer, the Dock and Search.
// `path` is the page's path under /[lang]/ ("" for home); `pageName` is what the menu bar shows as the app's name.
export function PageShell({ t, lang, path, pageName, children }: { t: Dict; lang: Locale; path: string; pageName?: string; children: ReactNode }) {
  const name = pageName ?? pageNameFor(t, path);
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
      <main id="main">{children}</main>
      <Footer t={t.footer} nav={t.nav} lang={lang} path={path} privacy={t.privacy.statement} />
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
  };
  return names[path] ?? "Grassfield";
}
