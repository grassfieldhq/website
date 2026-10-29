import type { Dict } from "@/i18n";
import s from "./Faq.module.css";

// Native <details>: keyboard and screen-reader support without script. FAQPage structured data for search engines.
export function Faq({ t }: { t: Dict["faq"] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <section className="chapter" id="faq" aria-labelledby="faq-title">
      <div className={`wrap ${s.grid}`}>
        <div className="chapter-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-1" id="faq-title">
            {t.title}
          </h2>
        </div>
        <div className={s.list}>
          {t.items.map((it) => (
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
