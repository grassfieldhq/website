import type { Dict, Locale } from "@/i18n";
import { scenes } from "./shots";

// What ⌘K can reach: every page, every FAQ answer and every captured scene. Built on the server from the
// dictionaries and the capture data, handed to the client as plain data.
export type Hit = { group: "pages" | "faq" | "tour"; title: string; sub: string; href: string; icon: string };

export function searchIndex(lang: Locale, t: Dict): Hit[] {
  const home = `/${lang}/`;
  const pages: Hit[] = [
    { group: "pages", title: t.shell.home, sub: t.meta.description, href: home, icon: "grassfield-logo" },
    { group: "pages", title: t.nav.desktop, sub: t.pages.desktop.lead, href: `${home}desktop/`, icon: "display" },
    { group: "pages", title: t.nav.apps, sub: t.pages.apps.lead, href: `${home}apps/`, icon: "apps" },
    { group: "pages", title: t.nav.security, sub: t.pages.security.lead, href: `${home}security/`, icon: "shield" },
    { group: "pages", title: t.nav.os, sub: t.pages.os.lead, href: `${home}os/`, icon: "grassfield-logo" },
    { group: "pages", title: t.nav.tour, sub: t.pages.tour.lead, href: `${home}tour/`, icon: "camera" },
    { group: "pages", title: t.nav.download, sub: t.download.lead, href: `${home}download/`, icon: "download" },
    { group: "pages", title: t.nav.faq, sub: t.pages.faq.lead, href: `${home}faq/`, icon: "info" },
  ];
  const faq: Hit[] = t.faq.items.map((it, i) => ({ group: "faq", title: it.q, sub: it.a, href: `${home}faq/#faq-${i}`, icon: "info" }));
  const features = t.shots.features as Record<string, { title: string; body: string }>;
  const seen = new Set<string>();
  const tour: Hit[] = [];
  for (const sc of scenes(lang)) {
    if (sc.kind === "clip") continue;
    const d = sc.dark ?? sc.light;
    if (!d) continue;
    const f = features[sc.feature];
    if (f && !seen.has(sc.feature)) {
      seen.add(sc.feature);
      tour.push({ group: "tour", title: f.title, sub: f.body, href: `${home}tour/#${sc.feature}`, icon: "camera" });
    }
    tour.push({ group: "tour", title: d.title, sub: f?.title ?? "", href: `${home}tour/#shot-${sc.base}`, icon: "camera" });
  }
  return [...pages, ...faq, ...tour];
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** The hits matching every word of `q`, pages first, then titles that start with the query. */
export function search(index: Hit[], q: string, limit = 12): Hit[] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter((h) => h.group === "pages").slice(0, limit);
  const order = { pages: 0, faq: 1, tour: 2 };
  return index
    .map((h) => {
      const title = fold(h.title);
      const text = `${title} ${fold(h.sub)}`;
      if (!words.every((w) => text.includes(w))) return null;
      const rank = (title.startsWith(words[0]!) ? 0 : words.every((w) => title.includes(w)) ? 1 : 2) * 10 + order[h.group];
      return { h, rank };
    })
    .filter((x): x is { h: Hit; rank: number } => x !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((x) => x.h);
}
