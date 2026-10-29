import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import s from "./Sections.module.css";

export function Footer({ t, nav, lang }: { t: Dict["footer"]; nav: Dict["nav"]; lang: Locale }) {
  const other = otherLocale(lang);
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <p>{t.note}</p>
        <div className={s.cols}>
          <nav aria-label={t.cols.discover}>
            <h2>{t.cols.discover}</h2>
            <a href="#desktop">{nav.desktop}</a>
            <a href="#overview">{nav.overview}</a>
            <a href="#glass">{nav.glass}</a>
          </nav>
          <nav aria-label={t.cols.system}>
            <h2>{t.cols.system}</h2>
            <a href="#security">{nav.security}</a>
            <a href="#apps">{nav.apps}</a>
            <a href="#menus">{t.cols.menus}</a>
          </nav>
          <nav aria-label={t.cols.install}>
            <h2>{t.cols.install}</h2>
            <a href="#omarchy">{t.cols.requirements}</a>
            <a href="#install">{t.cols.availability}</a>
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
          <a href={`/${other}/`} hrefLang={other} lang={other} title={nav.switchLangLabel}>
            {t.locale} · {nav.switchLang}
          </a>
        </div>
      </div>
    </footer>
  );
}
