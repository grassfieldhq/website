import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { pageMeta } from "@/lib/meta";
import { publisher } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import s from "@/components/Legal.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/legal">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDict(lang).legal;
  return pageMeta(lang, "legal/", p.title, p.description);
}

// Legal notice and privacy. Everything factual is stated; the publisher and host read `publisher` in
// src/lib/site.ts and, until the owner fills it, say they will be published before launch.
export default async function LegalPage({ params }: PageProps<"/[lang]/legal">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const l = t.legal;
  return (
    <PageShell t={t} lang={lang} path="legal/">
      <PageHero eyebrow={l.eyebrow} heading={l.heading} lead={l.lead} />
      <div className={`wrap ${s.legal}`}>
        <section aria-labelledby="pub">
          <h2 id="pub" className="h-3">
            {l.publisher.title}
          </h2>
          {publisher ? (
            <p>
              {publisher.name}, {publisher.status}
              <br />
              {publisher.address}
            </p>
          ) : (
            <p className={s.pending}>{l.publisher.pending}</p>
          )}
        </section>
        <section aria-labelledby="host">
          <h2 id="host" className="h-3">
            {l.hosting.title}
          </h2>
          {publisher ? <p>{publisher.host}</p> : <p className={s.pending}>{l.hosting.pending}</p>}
        </section>
        <section aria-labelledby="priv">
          <h2 id="priv" className="h-3">
            {l.privacy.title}
          </h2>
          <ul>
            {l.privacy.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="lic">
          <h2 id="lic" className="h-3">
            {l.licences.title}
          </h2>
          <ul>
            {l.licences.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="marks">
          <h2 id="marks" className="h-3">
            {l.marks.title}
          </h2>
          <p>{l.marks.body}</p>
        </section>
        {publisher && (
          <section aria-labelledby="contact">
            <h2 id="contact" className="h-3">
              {l.contact.title}
            </h2>
            <p>{publisher.email}</p>
          </section>
        )}
      </div>
    </PageShell>
  );
}
