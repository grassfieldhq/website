import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fraunces, frauncesItalic, inter } from "@/lib/fonts";
import { getDict, isLocale, locales } from "@/i18n";
import { siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}/`,
      languages: { fr: "/fr/", en: "/en/", "x-default": "/fr/" },
    },
    openGraph: {
      type: "website",
      siteName: "Grassfield",
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "fr" ? "fr_FR" : "en_GB",
      url: `/${lang}/`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/og.png"] },
    robots: { index: false, follow: false }, // flipped on at public launch, after the legal review
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${inter.variable} ${fraunces.variable} ${frauncesItalic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
