import type { NextRequest } from "next/server";
import { getPublicCv } from "@/lib/public-cv";
import { parseTemplate, pdfResponse, renderCvPdf } from "@/pdf/render";

/**
 * GET /api/cv/pdf?skills=java,spring-boot — CV PDF, optionally filtered by skill ids.
 * Uses the template chosen in the backoffice; `&template=` overrides it (for previews).
 */
export async function GET(req: NextRequest) {
  const skills = (req.nextUrl.searchParams.get("skills") ?? "").split(",").filter(Boolean).slice(0, 30);
  const cv = await getPublicCv();
  const template = parseTemplate(req.nextUrl.searchParams.get("template"), cv.settings.pdfTemplate);
  return pdfResponse(await renderCvPdf(cv, skills, template));
}
