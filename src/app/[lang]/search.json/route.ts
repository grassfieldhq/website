import { getDict, isLocale, locales } from "@/i18n";
import { searchIndex } from "@/lib/searchIndex";

// The search index (every page, FAQ answer and captured scene) as one static file per language, built with the site:
// Search fetches it the first time it opens, so the pages do not carry it.
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response(null, { status: 404 });
  return Response.json(searchIndex(lang, getDict(lang)));
}
