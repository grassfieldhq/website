import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { Security } from "@/components/Security";
import { SecurityScene } from "@/components/SecurityScene";
import { SecurityMore } from "@/components/SecurityMore";
import { Gallery } from "@/components/Gallery";
import { Lightbox } from "@/components/Lightbox";
import { pageFeatures, used } from "@/lib/shots";

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
    <PageShell t={t} lang={lang} path="security/" sections={t.sections.security}>
      <PageHero {...t.pages.security} />
      <section className="chapter stage" id="scene" aria-label={t.scenes.security.label} style={{ paddingBlock: 0 }}>
        <SecurityScene t={t.scenes.security} locale={t.dates.locale} lang={lang} />
      </section>
      <Security t={t.security} locale={t.dates.locale} lang={lang} />
      <SecurityMore t={t.securityMore} />
      <Gallery lang={lang} t={t.shots} features={pageFeatures.security} exclude={used(lang, ["lock"])} alt />
      <Lightbox t={{ close: t.shots.close, prev: t.shots.prev, next: t.shots.next, of: t.shots.of }} />
    </PageShell>
  );
}
