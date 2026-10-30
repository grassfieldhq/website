// The public origin is not decided yet (owner decision: domain). Set NEXT_PUBLIC_SITE_URL at build time.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://grassfield.invalid").replace(/\/$/, "");

export const icon = (name: string) => `/icons/symbolic/${name}.svg`;
export const appIcon = (name: string) => `/icons/apps/org.grassfield.${name}.svg`;

// The site's publisher and host, for /legal/. Null until the owner decides (the page then says they will be
// published before launch); fill every field at once.
export const publisher: null | { name: string; status: string; address: string; email: string; host: string } = null;
