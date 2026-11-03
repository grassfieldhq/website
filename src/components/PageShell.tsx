import type { ReactNode } from "react";
import type { Dict, Locale } from "@/i18n";
import { scenes } from "@/lib/shots";
import { SectionNav } from "./SectionNav";
import { CommandSearch } from "./CommandSearch";
import { Footer } from "./Footer";
import { Header } from "./Header";

// Every page lives inside the shell: skip link, the header, the page's table of contents, the content, the footer
// and Search. `path` is the page's path under /[lang]/ ("" for home).
export function PageShell({ t, lang, path, sections, children }: { t: Dict; lang: Locale; path: string; sections?: string[][]; children: ReactNode }) {
  // the tour's chapters, for the footer's site map: the features the capture set actually has
  const have = new Set(scenes(lang).map((sc) => sc.feature));
  const features = t.shots.features as Record<string, { title: string }>;
  const tour = Object.entries(features).filter(([f]) => have.has(f)).map(([f, v]) => [f, v.title] as [string, string]);
  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Header t={t} lang={lang} path={path} />
      {sections && <SectionNav label={t.sections.label} items={sections} />}
      <main id="main">{children}</main>
      <Footer t={t.footer} nav={t.nav} lang={lang} path={path} privacy={t.privacy.statement} tour={tour} />
      <CommandSearch t={t.shell} lang={lang} />
    </>
  );
}
