import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import s from "./Sections.module.css";

export function Footer({ t, nav, lang, path = "", privacy }: { t: Dict["footer"]; nav: Dict["nav"]; lang: Locale; path?: string; privacy: string }) {
  const other = otherLocale(lang);
  const home = `/${lang}/`;
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <p className={s.privacy}>{privacy}</p>
        <p>{t.note}</p>
        <div className={s.cols}>
          <nav aria-label={t.cols.discover}>
            <h2>{t.cols.discover}</h2>
            <a href={`${home}desktop/`}>{nav.desktop}</a>
            <a href={`${home}apps/`}>{nav.apps}</a>
            <a href={`${home}security/`}>{nav.security}</a>
            <a href={`${home}os/`}>{nav.os}</a>
          </nav>
          <nav aria-label={t.cols.install}>
            <h2>{t.cols.install}</h2>
            <a href={`${home}download/`}>{nav.download}</a>
            <a href={`${home}download/#reversible`}>{t.cols.reversible}</a>
            <a href={`${home}faq/`}>{nav.faq}</a>
          </nav>
          <div>
            <h2>{t.cols.licences}</h2>
            {t.licences.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
        <div className={s.legal}>
          <span>
            © 2026 Grassfield. {t.copyright}
          </span>
          <span>{t.marks}</span>
          <a href={`/${other}/${path}`} hrefLang={other} lang={other} title={nav.switchLangLabel}>
            {t.locale} · {nav.switchLang}
          </a>
        </div>
      </div>
    </footer>
  );
}
