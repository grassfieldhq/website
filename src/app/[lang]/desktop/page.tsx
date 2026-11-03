import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Overview } from "@/components/Overview";
import { Proof } from "@/components/Proof";
import { Everyday } from "@/components/Everyday";
import { Glass } from "@/components/Glass";
import { Gallery } from "@/components/Gallery";
import { Lightbox } from "@/components/Lightbox";
import { pageFeatures, themePair, used } from "@/lib/shots";

export async function generateMetadata({ params }: PageProps<"/[lang]/desktop">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.desktop;
  return pageMeta(lang, "desktop/", p.title, p.description);
}

// the captures the chapters above already show, so the gallery does not repeat them
const desktopShown = (lang: Locale) => {
  const set = used(lang, ["overview", "search", "controlcenter", "notifications", "menus", "tiling"]);
  const pair = themePair(lang);
  if (pair) set.add(pair.key);
  return set;
};

export default async function DesktopPage({ params }: PageProps<"/[lang]/desktop">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const locale = t.dates.locale;
  return (
    <PageShell t={t} lang={lang} path="desktop/" sections={t.sections.desktop}>
      <PageHero {...t.pages.desktop} />
      <Overview t={t.overview} scene={t.scene} locale={locale} lang={lang} />
      <Proof t={t.proof} />
      <Everyday t={t.everyday} scene={t.scene} locale={locale} lang={lang} />
      <Glass t={t.glass} lang={lang} shots={t.shots} />
      <Gallery lang={lang} t={t.shots} features={pageFeatures.desktop} exclude={desktopShown(lang)} />
      <Lightbox t={{ close: t.shots.close, prev: t.shots.prev, next: t.shots.next, of: t.shots.of }} />
    </PageShell>
  );
}
