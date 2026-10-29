import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import { Clock } from "./Clock";
import { Mask } from "./Mask";
import { SearchButton } from "./CommandSearch";
import { ThemeToggle } from "./ThemeToggle";
import s from "./Shell.module.css";

// The site's menu bar, as Grassfield's: the logo, the page's name where the app's name goes, then the status
// items (search, language, appearance, clock). Fixed, glass, the landscape runs under it.
export function MenuBar({ t, lang, path, pageName }: { t: Dict; lang: Locale; path: string; pageName: string }) {
  const other = otherLocale(lang);
  return (
    <header className={s.menubar} aria-label={t.shell.menubarLabel}>
      <a className={s.logoLink} href={`/${lang}/`} aria-label={t.nav.home}>
        <Mask name="grassfield-logo" className={s.logo} />
      </a>
      <b className={s.appName}>{pageName}</b>
      <a className={s.barItem} href={`/${lang}/download/`}>
        {t.nav.download}
      </a>
      <div className={s.status}>
        <SearchButton label={t.shell.searchOpen} />
        <a className={`${s.barItem} ${s.lang}`} href={`/${other}/${path}`} hrefLang={other} lang={other} title={t.shell.langLabel}>
          {t.shell.lang}
        </a>
        <ThemeToggle t={t.theme} />
        <span className={s.clock}>
          <Clock variant="bar" locale={t.dates.locale} placeholder="" />
        </span>
      </div>
    </header>
  );
}
