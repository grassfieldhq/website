import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { AppsDetail } from "@/components/AppsDetail";

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
    <PageShell t={t} lang={lang} path="apps/">
      <PageHero {...t.pages.apps} />
      <AppsDetail apps={t.appsDetail} settingsAlt={t.apps.settingsAlt} captureNote={t.overview.captureNote} />
    </PageShell>
  );
}
