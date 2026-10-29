import fr from "./fr";
import en from "./en";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Dict = Widen<typeof fr>;

const dicts: Record<Locale, Dict> = { fr, en };

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export function getDict(lang: Locale): Dict {
  return dicts[lang];
}

export const otherLocale = (lang: Locale): Locale => (lang === "fr" ? "en" : "fr");
