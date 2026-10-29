import localFont from "next/font/local";

// Inter (SIL OFL 1.1, src/fonts/OFL.txt), variable on weight and optical size: the Grassfield session font.
export const inter = localFont({
  src: "../fonts/inter-latin-opsz-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  fallback: ["Noto Sans", "system-ui", "sans-serif"],
});
