import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Roadmap } from "@/components/Roadmap";
import { Omarchy } from "@/components/Omarchy";
import { Install } from "@/components/Install";

export async function generateMetadata({ params }: PageProps<"/[lang]/os">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.os;
  return pageMeta(lang, "os/", p.title, p.description);
}

export default async function OsPage({ params }: PageProps<"/[lang]/os">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="os/">
      <PageHero {...t.pages.os} time={0.7} />
      <Roadmap t={t.roadmap} />
      <Omarchy t={t.omarchy} />
      <Install t={t.install} lang={lang} />
    </PageShell>
  );
}
