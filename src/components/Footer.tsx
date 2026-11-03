import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import { publisher } from "@/lib/site";
import { Mask } from "./Mask";
import s from "./Sections.module.css";

// The footer is the colophon and the site map: the mark, the privacy promise, every page, the tour's chapters, the
// install anchors, about this site.
export function Footer({ t, nav, lang, path = "", privacy, tour }: { t: Dict["footer"]; nav: Dict["nav"]; lang: Locale; path?: string; privacy: string; tour: [string, string][] }) {
  const other = otherLocale(lang);
  const home = `/${lang}/`;
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.colophon}>
          <a className={s.footBrand} href={home} aria-label={nav.home}>
            <Mask name="grassfield-logo-full" className={s.footMark} />
            <span aria-hidden="true">Grassfield</span>
          </a>
          <div>
            <p className={s.privacy}>{privacy}</p>
            <p>{t.note}</p>
          </div>
        </div>
        <div className={s.cols}>
          <nav aria-label={t.cols.discover}>
            <h2>{t.cols.discover}</h2>
            <a href={`${home}desktop/`}>{nav.desktop}</a>
            <a href={`${home}apps/`}>{nav.apps}</a>
            <a href={`${home}security/`}>{nav.security}</a>
            <a href={`${home}os/`}>{nav.os}</a>
            <a href={`${home}tour/`}>{nav.tour}</a>
          </nav>
          <nav aria-label={t.cols.tour} className={s.tourCol}>
            <h2>{t.cols.tour}</h2>
            {tour.map(([feature, title]) => (
              <a key={feature} href={`${home}tour/#${feature}`}>
                {title}
              </a>
            ))}
          </nav>
          <nav aria-label={t.cols.install}>
            <h2>{t.cols.install}</h2>
            <a href={`${home}download/`}>{nav.download}</a>
            <a href={`${home}download/#requirements`}>{t.cols.requirements}</a>
            <a href={`${home}download/#reversible`}>{t.cols.reversible}</a>
            <a href={`${home}faq/`}>{nav.faq}</a>
          </nav>
          <nav aria-label={t.cols.about}>
            <h2>{t.cols.about}</h2>
            <a href={`${home}legal/`}>{t.cols.legal}</a>
            {publisher && <a href={`${home}legal/#contact`}>{t.cols.contact}</a>}
            {t.licences.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </nav>
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
