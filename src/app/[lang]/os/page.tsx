import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SystemMap } from "@/components/SystemMap";
import { Stack } from "@/components/Stack";
import { Roadmap } from "@/components/Roadmap";
import { Origin } from "@/components/Origin";
import { Omarchy } from "@/components/Omarchy";
import { Install } from "@/components/Install";

export async function generateMetadata({ params }: PageProps<"/[lang]/os">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.os;
  return pageMeta(lang, "os/", p.title, p.description);
}

// The flagship page: what the system contains, how it is built, where it is going, then where to try it today.
export default async function OsPage({ params }: PageProps<"/[lang]/os">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="os/" sections={t.sections.os}>
      <PageHero {...t.pages.os} />
      <SystemMap t={t.system} lang={lang} />
      <Stack t={t.stack} />
      <Roadmap t={t.roadmap} />
      <Origin t={t.origin} />
      <Omarchy t={t.omarchy} />
      <Install t={t.install} lang={lang} />
    </PageShell>
  );
}
