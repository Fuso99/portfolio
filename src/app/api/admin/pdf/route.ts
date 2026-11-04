import { cvSchema, normalizeCv } from "@/lib/schema";
import { isAdmin, unauthorized } from "@/lib/server-auth";
import { toPublicCv } from "@/lib/utils";
import { parseTemplate, pdfResponse, renderCvPdf } from "@/pdf/render";

/** Renders a PDF from the unsaved draft. Private copy: keeps the phone number. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = cvSchema.safeParse(normalizeCv(await req.json().catch(() => null)));
  if (!parsed.success) return Response.json({ error: "Bozza non valida.", issues: parsed.error.issues }, { status: 400 });
  const cv = toPublicCv(parsed.data);
  const template = parseTemplate(new URL(req.url).searchParams.get("template"), parsed.data.settings.pdfTemplate);
  return pdfResponse(await renderCvPdf({ ...cv, profile: parsed.data.profile }, [], template));
}
