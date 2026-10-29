"use client";

import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import { Mask } from "./Mask";
import s from "./Nav.module.css";

export function Nav({ t, lang }: { t: Dict["nav"]; lang: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links: [string, string][] = [
    ["#desktop", t.desktop],
    ["#overview", t.overview],
    ["#glass", t.glass],
    ["#security", t.security],
    ["#apps", t.apps],
    ["#omarchy", t.omarchy],
  ];
  const other = otherLocale(lang);

  return (
    <nav className={s.nav} data-scrolled={scrolled} data-open={open} aria-label={t.label}>
      <div className={`wrap ${s.row}`}>
        <a className={s.brand} href="#top" aria-label={t.home}>
          <Mask name="grassfield-logo" className={s.logo} />
          <span>Grassfield</span>
        </a>
        <div className={s.links} id="nav-links">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className={s.lang} href={`/${other}/`} hrefLang={other} lang={other} title={t.switchLangLabel}>
            {t.switchLang}
          </a>
        </div>
        <a className={`btn btn-primary ${s.cta}`} href="#install">
          {t.cta}
        </a>
        <button
          type="button"
          className={s.burger}
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? t.close : t.menu}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
