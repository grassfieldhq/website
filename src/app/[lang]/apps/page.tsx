import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { AppsDetail } from "@/components/AppsDetail";
import { AppsScene } from "@/components/AppsScene";
import { Gallery } from "@/components/Gallery";
import { Lightbox } from "@/components/Lightbox";
import { pageFeatures } from "@/lib/shots";

export async function generateMetadata({ params }: PageProps<"/[lang]/apps">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.apps;
  return pageMeta(lang, "apps/", p.title, p.description);
}

export default async function AppsPage({ params }: PageProps<"/[lang]/apps">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="apps/" sections={t.sections.apps}>
      <PageHero {...t.pages.apps} time={0.36} />
      <section className="chapter stage" id="scene" aria-label={t.scenes.apps.label} style={{ paddingBlock: 0 }}>
        <AppsScene t={t.scenes.apps} names={t.appsDetail.map((a) => a.name)} lang={lang} />
      </section>
      <AppsDetail apps={t.appsDetail} captureNote={t.overview.captureNote} lang={lang} shots={t.shots} />
      <Gallery lang={lang} t={t.shots} features={pageFeatures.appsMore} />
      <Lightbox t={{ close: t.shots.close, prev: t.shots.prev, next: t.shots.next, of: t.shots.of }} />
    </PageShell>
  );
}
