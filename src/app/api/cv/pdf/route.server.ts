import type { NextRequest } from "next/server";
import { parseLocale } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";
import { parseTemplate, pdfResponse, renderCvPdf } from "@/pdf/render";

/**
 * GET /api/cv/pdf?lang=en&skills=java,spring-boot — CV PDF in Italian (default)
 * or English, optionally filtered by skill ids. Uses the template chosen in
 * the backoffice; `&template=` overrides it (for previews).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const skills = (q.get("skills") ?? "").split(",").filter(Boolean).slice(0, 30);
  const lang = parseLocale(q.get("lang"));
  const cv = await getPublicCv(lang);
  const template = parseTemplate(q.get("template"), cv.settings.pdfTemplate);
  return pdfResponse(await renderCvPdf(cv, skills, template, lang));
}
