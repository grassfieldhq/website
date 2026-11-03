import localFont from "next/font/local";

// Inter (SIL OFL 1.1, src/fonts/OFL.txt), variable on weight and optical size: the Grassfield session font, the
// site's text.
export const inter = localFont({
  src: "../fonts/inter-latin-opsz-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  fallback: ["Noto Sans", "system-ui", "sans-serif"],
});

// Fraunces (SIL OFL 1.1, src/fonts/OFL-Fraunces.txt), variable on weight and optical size: the headlines. The roman
// is preloaded; the italic (accent lines only) comes when a page uses it.
export const fraunces = localFont({
  src: "../fonts/fraunces-latin-opsz-normal.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  fallback: ["Georgia", "Noto Serif", "serif"],
});
export const frauncesItalic = localFont({
  src: "../fonts/fraunces-latin-opsz-italic.woff2",
  variable: "--font-fraunces-italic",
  weight: "100 900",
  style: "italic",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Noto Serif", "serif"],
});
