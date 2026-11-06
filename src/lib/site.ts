// The public origin: grassfield.site (owner decision of 2026-11-03), served by Cloudflare (wrangler.jsonc).
// NEXT_PUBLIC_SITE_URL overrides it at build time (a preview host, a test).
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://grassfield.site").replace(/\/$/, "");

export const icon = (name: string) => `/icons/symbolic/${name}.svg`;
export const appIcon = (name: string) => `/icons/apps/org.grassfield.${name}.svg`;

// The site's publisher and host, for /legal/. Null until the owner decides (the page then says they will be
// published before launch); fill every field at once.
export const publisher: null | { name: string; status: string; address: string; email: string; host: string } = null;
