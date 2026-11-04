import type { NextRequest } from "next/server";
import { getPublicCv } from "@/lib/public-cv";
import { pdfResponse, renderCvPdf } from "@/pdf/render";

/** GET /api/cv/pdf?skills=java,spring-boot — CV PDF, optionally filtered by skill ids. */
export async function GET(req: NextRequest) {
  const skills = (req.nextUrl.searchParams.get("skills") ?? "").split(",").filter(Boolean).slice(0, 30);
  const cv = await getPublicCv();
  return pdfResponse(await renderCvPdf(cv, skills));
}
