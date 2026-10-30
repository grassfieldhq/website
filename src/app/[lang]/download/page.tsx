import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { release } from "@/lib/release";
import { PageShell } from "@/components/PageShell";
import { Command } from "@/components/Command";
import { Mask } from "@/components/Mask";
import { Numbers } from "@/components/Numbers";
import { Reversible } from "@/components/Reversible";
import { InstallScene } from "@/components/InstallScene";
import s from "@/components/Download.module.css";

const pkgIcons: Record<string, string> = {
  "grassfield-desktop": "display",
  "grassfield-compositor": "apps",
  "grassfield-icons": "folder",
  "grassfield-store": "download",
};

export async function generateMetadata({ params }: PageProps<"/[lang]/download">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang).download;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/${lang}/download/`, languages: { fr: "/fr/download/", en: "/en/download/", "x-default": "/fr/download/" } },
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: `/${lang}/download/` },
  };
}

export default async function DownloadPage({ params }: PageProps<"/[lang]/download">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const all = getDict(lang);
  const t = all.download;
  const pub = release.publish;
  const fmtDate = (iso: string) => new Intl.DateTimeFormat(all.dates.locale, { dateStyle: "long" }).format(new Date(iso));

  return (
    <PageShell t={all} lang={lang} path="download/">
      <div>
        <header className={`wrap ${s.hero}`}>
          <div className={s.heroText}>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h-1">{t.title}</h1>
            <p className="lead">{t.lead}</p>
          </div>
          <section className={s.card} aria-labelledby="release-title">
            <div className={s.cardHead}>
              <Mask name="grassfield-logo" className={s.cardLogo} />
              <div>
                <h2 id="release-title">
                  {t.version} <span className="tnum">{release.version}</span>
                </h2>
                <span className="tag">{release.channel === "beta" ? t.channelBeta : t.channelStable}</span>
              </div>
            </div>
            <dl className={s.facts}>
              <div>
                <dt>{all.download.requirements[0]!.k}</dt>
                <dd>Omarchy 4</dd>
              </div>
              <div>
                <dt>{all.download.requirements[1]!.k}</dt>
                <dd>{release.arch}</dd>
              </div>
              <div>
                <dt>{pub ? t.published : t.notPublished}</dt>
                <dd>{pub ? fmtDate(pub.date) : "—"}</dd>
              </div>
            </dl>
            {pub ? (
              <a className="btn btn-primary" href="#install-steps">
                {t.installTitle}
              </a>
            ) : (
              <>
                <p className={s.notice}>{t.notPublishedBody}</p>
                <span className={`btn ${s.disabled}`} aria-disabled="true">
                  {t.cta}
                </span>
              </>
            )}
          </section>
        </header>

        <section className={`wrap ${s.block}`} aria-labelledby="req-title">
          <h2 className="h-2" id="req-title">
            {t.requirementsTitle}
          </h2>
          <ul className={s.reqs}>
            {t.requirements.map((r) => (
              <li key={r.k}>
                <span className={s.check}>
                  <Mask name="checkmark" />
                </span>
                <div>
                  <span className={s.k}>{r.k}</span>
                  <b>{r.v}</b>
                  <p>{r.p}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={`wrap ${s.block}`} aria-labelledby="pkg-title">
          <h2 className="h-2" id="pkg-title">
            {t.packagesTitle}
          </h2>
          <p className="copy" style={{ marginTop: 12 }}>
            {t.packagesLead}
          </p>
          <ul className={s.pkgs}>
            {release.packages.map((p) => (
              <li key={p.name}>
                <span className={s.pkgIcon}>
                  <Mask name={pkgIcons[p.name]!} />
                </span>
                <div>
                  <code>{p.name}</code>
                  <p>{t.packages[p.name]}</p>
                </div>
                <span className={p.required ? s.req : s.opt}>{p.required ? t.required : t.optional}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`wrap ${s.block}`} id="install-steps" aria-labelledby="install-title">
          <h2 className="h-2" id="install-title">
            {t.installTitle}
          </h2>
          <div className="stage" style={{ borderRadius: "var(--r-tile)", margin: "28px 0 8px", padding: "4px 0" }}>
            <InstallScene t={all.scenes.install} lang={lang} />
          </div>
          <ol className={s.steps}>
            {t.installSteps.map((st, i) => (
              <li key={st.title}>
                <span className={s.n} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <b>{st.title}</b>
                  <p>{st.body}</p>
                  {pub && i === 0 && pub.setup.map((c) => <Command key={c} cmd={c} copy={t.copy} copied={t.copied} />)}
                  {pub && i === 1 && <Command cmd={pub.install} copy={t.copy} copied={t.copied} />}
                </div>
              </li>
            ))}
          </ol>
          {!pub && <p className={s.soon}>{t.commandsSoon}</p>}
        </section>

        <section className={`wrap ${s.block} ${s.trio}`} aria-label={`${t.verifyTitle}, ${t.updatesTitle}, ${t.uninstallTitle}`}>
          <article>
            <Mask name="shield" className={s.trioIcon} />
            <h3 className="h-3">{t.verifyTitle}</h3>
            <p>{t.verifyBody}</p>
          </article>
          <article>
            <Mask name="download" className={s.trioIcon} />
            <h3 className="h-3">{t.updatesTitle}</h3>
            <p>{t.updatesBody}</p>
          </article>
          <article>
            <Mask name="trash" className={s.trioIcon} />
            <h3 className="h-3">{t.uninstallTitle}</h3>
            <p>{t.uninstallBody}</p>
            <Command cmd={release.uninstall} copy={t.copy} copied={t.copied} />
          </article>
        </section>

        <Reversible t={all.reversible} copy={t.copy} copied={t.copied} />
        <Numbers t={all.numbers} />
        <p className={`wrap ${s.back}`}>
          <a className="btn btn-link" href={`/${lang}/`}>
            {t.back}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
