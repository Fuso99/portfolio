import "server-only";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { Cv, PdfTemplate } from "@/lib/schema";
import { buildCvDocument } from "./document";
import { registerFonts } from "./shared";

export { parseTemplate } from "./document";

const FONT_DIR = path.join(process.cwd(), "public/pdf-fonts");

/** `cv` must already be localized to `lang` (see localizeCv). */
export async function renderCvPdf(
  cv: Cv,
  skillIds: string[],
  template: PdfTemplate = cv.settings.pdfTemplate,
  lang: Locale = DEFAULT_LOCALE,
) {
  registerFonts((file) => path.join(FONT_DIR, file));
  const { element, filename } = buildCvDocument(cv, skillIds, template, lang);
  return { buffer: await renderToBuffer(element), filename };
}

export function pdfResponse({ buffer, filename }: { buffer: Buffer; filename: string }, inline = false) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
