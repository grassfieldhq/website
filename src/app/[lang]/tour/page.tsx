import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { byFeature } from "@/lib/shots";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { FeatureBlock, featureText } from "@/components/Gallery";
import { Lightbox } from "@/components/Lightbox";
import s from "@/components/Tour.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/tour">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).pages.tour;
  return pageMeta(lang, "tour/", p.title, p.description);
}

// The guided tour: every capture, feature by feature, with an index of in-page anchors. Images are lazy and sized
// (no layout shift); the page is complete without JavaScript, which only adds the lightbox and plays the clips.
export default async function TourPage({ params }: PageProps<"/[lang]/tour">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const groups = byFeature(lang, Object.keys(t.shots.features));
  return (
    <PageShell t={t} lang={lang} path="tour/">
      <PageHero {...t.pages.tour} />
      <div className={`wrap ${s.body}`}>
        {groups.length ? (
          <>
            <nav className={s.index} id="tour-index" aria-label={t.tour.index}>
              <ul>
                {groups.map((g) => (
                  <li key={g.feature}>
                    <a href={`#${g.feature}`}>
                      {featureText(t.shots, g.feature).title}
                      <span className={s.count}>{t.tour.count(g.scenes.length)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <p className={`cap-note ${s.note}`}>{t.shots.note}</p>
            <div className={s.stack}>
              {groups.map((g) => (
                <div key={g.feature} className={s.part}>
                  <FeatureBlock feature={g.feature} scenes={g.scenes} t={t.shots} level={2} anchors id={g.feature} />
                  <a className={s.top} href="#tour-index">
                    {t.tour.top}
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="lead">{t.tour.empty}</p>
        )}
      </div>
      <Lightbox t={{ close: t.shots.close, prev: t.shots.prev, next: t.shots.next, of: t.shots.of }} />
    </PageShell>
  );
}
