import type { ReactNode } from "react";
import type { Dict, Locale } from "@/i18n";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

// Every page: skip link, nav, main, footer. `path` is the page's path under /[lang]/ ("" for home).
export function PageShell({ t, lang, path, children }: { t: Dict; lang: Locale; path: string; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Nav t={t.nav} theme={t.theme} lang={lang} path={path} />
      <main id="main">{children}</main>
      <Footer t={t.footer} nav={t.nav} lang={lang} path={path} privacy={t.privacy.statement} />
    </>
  );
}
