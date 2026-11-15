import { pdf } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/config";
import type { Cv } from "@/lib/schema";
import { withBase } from "@/lib/utils";
import { buildCvDocument } from "./document";
import { registerFonts } from "./shared";

/**
 * Renders the public CV PDF in the browser, so the static site needs no
 * server. Loaded with import() on click: react-pdf is heavy.
 * `cv` is the public, localized CV (no phone number).
 */
export async function renderCvPdf(cv: Cv, skillIds: string[], lang: Locale) {
  registerFonts((file) => new URL(withBase(`/pdf-fonts/${file}`), window.location.origin).href);
  const { element, filename } = buildCvDocument(cv, skillIds, cv.settings.pdfTemplate, lang);
  return { blob: await pdf(element).toBlob(), filename };
}
