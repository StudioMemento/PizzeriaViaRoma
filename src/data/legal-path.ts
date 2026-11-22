import type { Language } from "../i18n";
export type LegalSlug = "privacy" | "cookie" | "note-legali";
export const legalPath = (language: Language, slug: LegalSlug) =>
  language === "it" ? `/${slug}.html` : `/${language}/${slug}.html`;
