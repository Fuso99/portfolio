import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { DEFAULT_PDF_TEMPLATE, type Cv, type PdfTemplate } from "@/lib/schema";
import { filterCvBySkills, fullName } from "@/lib/utils";
import type { TemplateProps } from "./shared";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { TraceTemplate } from "./templates/trace";

/** Shared by the server renderer (render.ts) and the browser one (client.ts). */
const TEMPLATES: Record<PdfTemplate, (p: TemplateProps) => React.ReactElement> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  trace: TraceTemplate,
};

/** A valid `?template=` wins; otherwise the template saved in the backoffice. */
export function parseTemplate(value: string | null | undefined, fallback: PdfTemplate = DEFAULT_PDF_TEMPLATE): PdfTemplate {
  return value && value in TEMPLATES ? (value as PdfTemplate) : fallback;
}

/** `cv` must already be localized to `lang` (see localizeCv). Fonts must be registered first. */
export function buildCvDocument(
  cv: Cv,
  skillIds: string[],
  template: PdfTemplate = cv.settings.pdfTemplate,
  lang: Locale = DEFAULT_LOCALE,
) {
  const t = getDictionary(lang);
  const { cv: filtered, selected } = filterCvBySkills(cv, skillIds);
  const generatedAt = new Date().toLocaleDateString(t.meta.dateLocale, { day: "numeric", month: "long", year: "numeric" });
  const props: TemplateProps = { cv: filtered, selected, generatedAt, lang, t };
  // react-pdf's typings expect a <Document> element; every template renders one.
  const element = createElement(TEMPLATES[template], props) as unknown as React.ReactElement<DocumentProps>;
  const slug = fullName(cv).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suffix = selected.length ? `-${selected.map((x) => x.id).join("-")}`.slice(0, 60) : "";
  return { element, filename: `cv-${slug}-${lang}${suffix}.pdf` };
}
