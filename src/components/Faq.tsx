import type { Dict } from "@/i18n";
import { Dot } from "./Dot";
import s from "./Faq.module.css";

// Native <details>: keyboard and screen-reader support without script. FAQPage structured data for search engines.
export function Faq({ t, limit, all, head = true }: { t: Dict["faq"]; limit?: number; all?: { href: string; label: string }; head?: boolean }) {
  const items = limit ? t.items.slice(0, limit) : t.items;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <section className="chapter" id="faq" aria-labelledby={head ? "faq-title" : undefined}>
      <div className={`wrap ${s.grid}`}>
        <div className="chapter-head">
          {head && (
            <>
              <p className="eyebrow">{t.eyebrow}</p>
              <h2 className="h-1" id="faq-title">
                <Dot>{t.title}</Dot>
              </h2>
            </>
          )}
          {all && (
            <a className="btn btn-link" href={all.href}>
              {all.label}
            </a>
          )}
        </div>
        <div className={s.list}>
          {items.map((it) => (
            <details key={it.q} className={s.item}>
              <summary>
                <span>{it.q}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}
