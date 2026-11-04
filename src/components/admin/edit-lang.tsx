"use client";

import { createContext, use } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

/** Which language the translatable fields of the editor (and the preview) show. */
export const EditLangContext = createContext<Locale>(DEFAULT_LOCALE);

export function useEditLang() {
  return use(EditLangContext);
}
