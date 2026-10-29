// The public origin is not decided yet (owner decision: domain). Set NEXT_PUBLIC_SITE_URL at build time.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://grassfield.invalid").replace(/\/$/, "");

export const icon = (name: string) => `/icons/symbolic/${name}.svg`;
export const appIcon = (name: string) => `/icons/apps/org.grassfield.${name}.svg`;
