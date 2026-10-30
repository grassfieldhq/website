import type { Metadata } from "next";
import type { Locale } from "@/i18n";

// Canonical, language alternates and Open Graph for a page at /[lang]/<path>.
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `/${lang}/${path}`, languages: { fr: `/fr/${path}`, en: `/en/${path}`, "x-default": `/fr/${path}` } },
    openGraph: { title, description, url: `/${lang}/${path}` },
  };
}

export const pagePaths = ["", "desktop/", "apps/", "security/", "os/", "tour/", "download/", "faq/", "legal/"] as const;
