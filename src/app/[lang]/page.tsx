import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { Statement } from "@/components/Statement";
import { Teasers } from "@/components/Teasers";
import { Roadmap } from "@/components/Roadmap";
import { Faq } from "@/components/Faq";
import { Install } from "@/components/Install";

// Home: the showcase. Each subject has its own page; this one gives the vision and an index.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <PageShell t={t} lang={lang} path="">
      <Hero t={t.hero} scene={t.scene} locale={t.dates.locale} lang={lang} />
      <Statement t={t.statement} />
      <Teasers t={t.teasers} more={t.more} lang={lang} />
      <Roadmap t={t.roadmap} />
      <Faq t={t.faq} limit={4} all={{ href: `/${lang}/faq/`, label: t.faqShort.all }} />
      <Install t={t.install} lang={lang} />
    </PageShell>
  );
}
