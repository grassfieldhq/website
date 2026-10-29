import type { NextConfig } from "next";

// Static export: the site is plain files, hostable on any static host (no server, no runtime).
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;
