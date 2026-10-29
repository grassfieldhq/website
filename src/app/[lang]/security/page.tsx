import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Security } from "@/components/Security";
import { SecurityMore } from "@/components/SecurityMore";

export async function generateMetadata({ params }: PageProps<"/[lang]/security">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.security;
  return pageMeta(lang, "security/", p.title, p.description);
}

export default async function SecurityPage({ params }: PageProps<"/[lang]/security">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="security/">
      <PageHero {...t.pages.security} />
      <Security t={t.security} locale={t.dates.locale} />
      <SecurityMore t={t.securityMore} />
    </PageShell>
  );
}
