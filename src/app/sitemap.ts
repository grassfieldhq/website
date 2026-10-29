import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((lang) => ({
    url: `${siteUrl}/${lang}/`,
    changeFrequency: "monthly",
    priority: lang === "fr" ? 1 : 0.9,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}/`])) },
  }));
}
