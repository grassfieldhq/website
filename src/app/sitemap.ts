import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { siteUrl } from "@/lib/site";
import { pagePaths } from "@/lib/meta";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return pagePaths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}/${path}`,
      changeFrequency: "monthly" as const,
      priority: path ? 0.8 : 1,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}/${path}`])) },
    })),
  );
}
