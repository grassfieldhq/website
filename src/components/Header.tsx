import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import { Mask } from "./Mask";
import { MenuCloser } from "./MenuCloser";
import { SearchButton } from "./CommandSearch";
import { ThemeToggle } from "./ThemeToggle";
import s from "./Shell.module.css";

// The site's header: the mark and the name, the pages, then search, language, appearance and Download. It is the
// site's own navigation, not the product's interface. On a phone the pages fold into a native <details> menu, which
// opens without JavaScript.
export function Header({ t, lang, path }: { t: Dict; lang: Locale; path: string }) {
  const other = otherLocale(lang);
  const home = `/${lang}/`;
  const pages: [string, string][] = [
    ["os/", t.nav.os],
    ["desktop/", t.nav.desktop],
    ["apps/", t.nav.apps],
    ["security/", t.nav.security],
    ["tour/", t.nav.tour],
    ["faq/", t.nav.faq],
  ];
  const links = (className?: string) =>
    pages.map(([p, label]) => (
      <li key={p}>
        <a className={className} href={`${home}${p}`} aria-current={p === path ? "page" : undefined}>
          {label}
        </a>
      </li>
    ));
  return (
    <header className={s.header}>
      <div className={`wrap ${s.row}`}>
        <a className={s.brand} href={home} aria-label={t.nav.home} aria-current={path === "" ? "page" : undefined}>
          <Mask name="grassfield-logo-full" className={s.mark} />
          <span className={s.name} aria-hidden="true">
            Grassfield
          </span>
        </a>
        <nav className={s.nav} aria-label={t.nav.label}>
          <ul>{links(s.link)}</ul>
        </nav>
        <div className={s.tools}>
          <SearchButton label={t.shell.searchOpen} />
          <a className={`${s.tool} ${s.lang}`} href={`/${other}/${path}`} hrefLang={other} lang={other} title={t.shell.langLabel} aria-label={`${t.shell.lang}, ${t.shell.langLabel}`}>
            {t.shell.lang}
          </a>
          <ThemeToggle t={t.theme} />
          <a className={`btn btn-primary ${s.cta}`} href={`${home}download/`} aria-current={path === "download/" ? "page" : undefined}>
            {t.nav.download}
          </a>
          <details className={s.menu} id="site-menu">
            <summary className={s.tool} aria-label={t.nav.menu}>
              <span className={s.burger} aria-hidden="true" />
            </summary>
            <nav className={s.sheet} aria-label={t.nav.label}>
              <ul>
                {links(s.sheetLink)}
                <li>
                  <a className={s.sheetLink} href={`${home}download/`} aria-current={path === "download/" ? "page" : undefined}>
                    {t.nav.download}
                  </a>
                </li>
              </ul>
            </nav>
          </details>
          <MenuCloser selector="#site-menu" />
        </div>
      </div>
    </header>
  );
}
