export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Language of the source CV: missing translations fall back to it. */
export const DEFAULT_LOCALE: Locale = "it";
/** Remembers the language picked with the switcher, so "/" opens it next time. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_NAMES: Record<Locale, string> = { it: "Italiano", en: "English" };

export function hasLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: unknown, fallback: Locale = DEFAULT_LOCALE): Locale {
  return hasLocale(value) ? value : fallback;
}

/**
 * Picks the first supported language from an Accept-Language header, in the
 * visitor's order of preference. Visitors who accept neither get English.
 */
export function negotiateLocale(header: string | null): Locale {
  const ranked = (header ?? "")
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { lang: tag.split("-")[0], q: Number.isFinite(q) ? q : 0, i };
    })
    .filter((x) => x.lang && x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.map((x) => x.lang).find(hasLocale) ?? "en";
}
