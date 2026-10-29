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
            <a href={`${home}#roadmap`}>{nav.roadmap}</a>
            <a href={`${home}#desktop`}>{nav.desktop}</a>
            <a href={`${home}#overview`}>{nav.overview}</a>
            <a href={`${home}#glass`}>{nav.glass}</a>
          </nav>
          <nav aria-label={t.cols.system}>
            <h2>{t.cols.system}</h2>
            <a href={`${home}#security`}>{nav.security}</a>
            <a href={`${home}#apps`}>{nav.apps}</a>
            <a href={`${home}#menus`}>{t.cols.menus}</a>
            <a href={`${home}#proof`}>{t.cols.proof}</a>
          </nav>
          <nav aria-label={t.cols.install}>
            <h2>{t.cols.install}</h2>
            <a href={`${home}#omarchy`}>{t.cols.requirements}</a>
            <a href={`${home}#reversible`}>{t.cols.reversible}</a>
            <a href={`${home}download/`}>{nav.download}</a>
            <a href={`${home}#faq`}>{nav.faq}</a>
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
