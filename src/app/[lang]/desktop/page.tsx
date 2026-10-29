import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Overview } from "@/components/Overview";
import { Proof } from "@/components/Proof";
import { Everyday } from "@/components/Everyday";
import { Glass } from "@/components/Glass";

export async function generateMetadata({ params }: PageProps<"/[lang]/desktop">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.desktop;
  return pageMeta(lang, "desktop/", p.title, p.description);
}

export default async function DesktopPage({ params }: PageProps<"/[lang]/desktop">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const locale = t.dates.locale;
  return (
    <PageShell t={t} lang={lang} path="desktop/">
      <PageHero {...t.pages.desktop} />
      <Overview t={t.overview} scene={t.scene} locale={locale} />
      <Proof t={t.proof} />
      <Everyday t={t.everyday} scene={t.scene} locale={locale} />
      <Glass t={t.glass} />
    </PageShell>
  );
}
