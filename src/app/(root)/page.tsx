import type { Metadata } from "next";
import Link from "next/link";

// Static export has no server redirect: the root picks a language in the browser, with a plain link as fallback.
export const metadata: Metadata = { title: "Grassfield Desktop", robots: { index: false } };

const pick = `try{var l=(navigator.languages||[navigator.language||"fr"]).find(function(x){return/^(fr|en)/i.test(x)})||"fr";location.replace("/"+(/^en/i.test(l)?"en":"fr")+"/")}catch(e){location.replace("/fr/")}`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: pick }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/fr/" />
      </noscript>
      <p style={{ padding: 24 }}>
        <Link href="/fr/">Français</Link> · <Link href="/en/">English</Link>
      </p>
    </>
  );
}
