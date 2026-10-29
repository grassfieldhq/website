import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  // Icons and captures are static SVG/WebP files served as-is by the static export: plain <img> is intended.
  { rules: { "@next/next/no-img-element": "off" } },
  { ignores: [".next/**", "out/**", "playwright-report/**", "test-results/**", "next-env.d.ts"] },
];

export default config;
