import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Statement } from "@/components/Statement";
import { Overview } from "@/components/Overview";
import { Everyday } from "@/components/Everyday";
import { Glass } from "@/components/Glass";
import { Security } from "@/components/Security";
import { Apps } from "@/components/Apps";
import { Omarchy } from "@/components/Omarchy";
import { Install } from "@/components/Install";
import { Footer } from "@/components/Footer";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const locale = t.dates.locale;
  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Nav t={t.nav} lang={lang} />
      <main id="main">
        <Hero t={t.hero} scene={t.scene} locale={locale} />
        <Statement t={t.statement} />
        <Overview t={t.overview} scene={t.scene} locale={locale} />
        <Everyday t={t.everyday} scene={t.scene} locale={locale} />
        <Glass t={t.glass} />
        <Security t={t.security} locale={locale} />
        <Apps t={t.apps} captureNote={t.overview.captureNote} />
        <Omarchy t={t.omarchy} />
        <Install t={t.install} />
      </main>
      <Footer t={t.footer} nav={t.nav} lang={lang} />
    </>
  );
}
