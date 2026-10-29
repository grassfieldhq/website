"use client";

import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n";
import { otherLocale } from "@/i18n";
import { Mask } from "./Mask";
import { ThemeToggle } from "./ThemeToggle";
import s from "./Nav.module.css";

export function Nav({ t, theme, lang, path = "" }: { t: Dict["nav"]; theme: Dict["theme"]; lang: Locale; path?: string }) {
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

  const home = `/${lang}/`;
  const links: [string, string, string][] = [
    [`${home}desktop/`, t.desktop, "desktop/"],
    [`${home}apps/`, t.apps, "apps/"],
    [`${home}security/`, t.security, "security/"],
    [`${home}os/`, t.os, "os/"],
    [`${home}faq/`, t.faq, "faq/"],
  ];
  const other = otherLocale(lang);

  return (
    <nav className={s.nav} data-scrolled={scrolled} data-open={open} aria-label={t.label}>
      <div className={s.row}>
        <a className={s.brand} href={home} aria-label={t.home}>
          <Mask name="grassfield-logo" className={s.logo} />
          <span>Grassfield</span>
        </a>
        <div className={s.links} id="nav-links">
          {links.map(([href, label, p]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} aria-current={p === path ? "page" : undefined}>
              {label}
            </a>
          ))}
          <a className={s.lang} href={`/${other}/${path}`} hrefLang={other} lang={other} title={t.switchLangLabel}>
            {t.switchLang}
          </a>
        </div>
        <ThemeToggle t={theme} />
        <a className={`btn btn-primary ${s.cta}`} href={`${home}download/`}>
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
