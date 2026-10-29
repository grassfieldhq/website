import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Closed to crawlers until the public launch (after the legal review). Flip `disallow` to `allow` then.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }], sitemap: `${siteUrl}/sitemap.xml` };
}
