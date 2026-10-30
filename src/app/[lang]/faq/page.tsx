import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Faq } from "@/components/Faq";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.faq;
  return pageMeta(lang, "faq/", p.title, p.description);
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="faq/">
      <PageHero {...t.pages.faq} time={0.8} />
      <Faq t={t.faq} head={false} />
    </PageShell>
  );
}
