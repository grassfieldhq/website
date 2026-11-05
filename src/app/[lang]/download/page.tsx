import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { groupedFingerprint, release } from "@/lib/release";
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
  "grassfield-store": "download",
  "grassfield-login-themes": "person",
  "grassfield-icons": "folder",
  "grassfield-wallpapers": "sun",
  "grassfield-keyring": "shield",
};

// The dictionaries mark commands, options and pacman settings with backticks: they are set as code.
const rich = (text: string) => text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));

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
  // an ISO date is midnight UTC: format it in UTC, whatever the build machine's zone
  const fmtDate = (iso: string) => new Intl.DateTimeFormat(all.dates.locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));

  return (
    <PageShell t={all} lang={lang} path="download/" sections={all.sections.download}>
      <div>
        <header className={`wrap ${s.hero}`} id="release">
          <div className={s.heroText}>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h-1">{t.title}</h1>
            <p className="lead">{t.lead}</p>
          </div>
          <section className={s.card} aria-labelledby="release-title">
            <div className={s.cardHead}>
              <Mask name="grassfield-logo-full" className={s.cardLogo} />
              <div>
                <h2 id="release-title">
                  {t.version} <span className="tnum">{release.version}</span>
                </h2>
                <span className="tag">{release.channel === "beta" ? t.channelBeta : t.channelStable}</span>
              </div>
            </div>
            <dl className={s.facts}>
              <div>
                <dt>{t.requirements[0]!.k}</dt>
                <dd>Omarchy {release.omarchyMin}+</dd>
              </div>
              <div>
                <dt>{t.requirements[1]!.k}</dt>
                <dd>{release.arch}</dd>
              </div>
              <div>
                <dt>{t.published}</dt>
                <dd>{fmtDate(pub.date)}</dd>
              </div>
            </dl>
            <p className={`${s.notice} ${s.rich}`}>{rich(t.betaNote)}</p>
            <a className={`btn btn-primary ${s.cardCta}`} href="#install-steps">
              {t.cta}
            </a>
          </section>
        </header>

        <section className={`wrap ${s.block}`} id="requirements" aria-labelledby="req-title">
          <h2 className="h-2" id="req-title">
            {t.requirementsTitle}
          </h2>
          <p className="copy" style={{ marginTop: 12 }}>
            {t.requirementsLead}
          </p>
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
                <div className={s.rich}>
                  <b>{st.title}</b>
                  <p>{rich(st.body)}</p>
                  {i === 0 && (
                    <>
                      <div className={s.form}>
                        <p className={s.formHead}>{t.oneLineTitle}</p>
                        <Command cmd={pub.oneLine} copy={t.copy} copied={t.copied} />
                        <p>{t.oneLineNote}</p>
                      </div>
                      <div className={s.form}>
                        <p className={s.formHead}>{t.checkedTitle}</p>
                        <Command cmd={pub.checked} copy={t.copy} copied={t.copied} />
                        <p>{t.checkedNote}</p>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className={`${s.script} ${s.rich}`}>
            <div>
              <h3 className="h-3">{t.orderTitle}</h3>
              <ol className={s.order}>
                {t.order.map((o) => (
                  <li key={o}>{rich(o)}</li>
                ))}
              </ol>
              <p className={s.aside}>
                {t.log} <code>{pub.log}</code>.
              </p>
            </div>
            <div>
              <h3 className="h-3">{t.optionsTitle}</h3>
              <dl className={s.options}>
                {pub.options.map((o) => (
                  <div key={o}>
                    <dt>
                      <code>{o}</code>
                    </dt>
                    <dd>{rich(t.options[o]!)}</dd>
                  </div>
                ))}
              </dl>
              <p className={s.aside}>{rich(t.channelNote)}</p>
            </div>
          </div>
        </section>

        <section className={`wrap ${s.block}`} id="packages" aria-labelledby="pkg-title">
          <h2 className="h-2" id="pkg-title">
            {t.packagesTitle}
          </h2>
          <p className="copy" style={{ marginTop: 12 }}>
            {t.packagesLead}
          </p>
          <ul className={`${s.pkgs} ${s.rich}`}>
            {release.packages.map((p) => (
              <li key={p.name}>
                <span className={s.pkgIcon}>
                  <Mask name={pkgIcons[p.name]!} />
                </span>
                <div>
                  <code>{p.name}</code>
                  <p>{rich(t.packages[p.name]!)}</p>
                </div>
                <span className={p.role === "installed" ? s.req : s.opt}>{t.roles[p.role]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`wrap ${s.block} ${s.trio} ${s.rich}`} aria-label={`${t.verifyTitle}, ${t.updatesTitle}, ${t.uninstallTitle}`}>
          <article>
            <Mask name="shield" className={s.trioIcon} />
            <h3 className="h-3">{t.verifyTitle}</h3>
            <p>{t.verifyBody}</p>
            <p className={s.fpr}>
              <code>{groupedFingerprint(release.key.fingerprint)}</code>
              <span>{release.key.uid}</span>
            </p>
            <p>{rich(t.verifyAfter)}</p>
            <a className={`btn-link ${s.keyLink}`} href={release.key.file}>
              {t.keyFile}
            </a>
          </article>
          <article>
            <Mask name="download" className={s.trioIcon} />
            <h3 className="h-3">{t.updatesTitle}</h3>
            <p>{t.updatesBody}</p>
          </article>
          <article>
            <Mask name="trash" className={s.trioIcon} />
            <h3 className="h-3">{t.uninstallTitle}</h3>
            <p>{rich(t.uninstallBody)}</p>
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
