import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { DEFAULT_PDF_TEMPLATE, type Cv, type PdfTemplate } from "@/lib/schema";
import { filterCvBySkills, fullName } from "@/lib/utils";
import { registerFonts, type TemplateProps } from "./shared";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { TraceTemplate } from "./templates/trace";

const TEMPLATES: Record<PdfTemplate, (p: TemplateProps) => React.ReactElement> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  trace: TraceTemplate,
};

/** A valid `?template=` wins; otherwise the template saved in the backoffice. */
export function parseTemplate(value: string | null | undefined, fallback: PdfTemplate = DEFAULT_PDF_TEMPLATE): PdfTemplate {
  return value && value in TEMPLATES ? (value as PdfTemplate) : fallback;
}

/** `cv` must already be localized to `lang` (see localizeCv). */
export async function renderCvPdf(
  cv: Cv,
  skillIds: string[],
  template: PdfTemplate = cv.settings.pdfTemplate,
  lang: Locale = DEFAULT_LOCALE,
) {
  registerFonts();
  const t = getDictionary(lang);
  const { cv: filtered, selected } = filterCvBySkills(cv, skillIds);
  const generatedAt = new Date().toLocaleDateString(t.meta.dateLocale, { day: "numeric", month: "long", year: "numeric" });
  const props: TemplateProps = { cv: filtered, selected, generatedAt, lang, t };
  // renderToBuffer's typings expect a <Document> element; every template renders one.
  const element = createElement(TEMPLATES[template], props) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);
  const slug = fullName(cv).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suffix = selected.length ? `-${selected.map((x) => x.id).join("-")}`.slice(0, 60) : "";
  return { buffer, filename: `cv-${slug}-${lang}${suffix}.pdf` };
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
