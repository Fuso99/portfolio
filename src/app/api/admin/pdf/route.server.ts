import { parseLocale } from "@/i18n/config";
import { cvSchema, localizeCv, normalizeCv } from "@/lib/schema";
import { isAdmin, unauthorized } from "@/lib/server-auth";
import { toPublicCv } from "@/lib/utils";
import { parseTemplate, pdfResponse, renderCvPdf } from "@/pdf/render";

/** Renders a PDF from the unsaved draft (`?template=`, `?lang=`). Private copy: keeps the phone number. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = cvSchema.safeParse(normalizeCv(await req.json().catch(() => null)));
  if (!parsed.success) return Response.json({ error: "Bozza non valida.", issues: parsed.error.issues }, { status: 400 });
  const q = new URL(req.url).searchParams;
  const lang = parseLocale(q.get("lang"));
  const cv = localizeCv({ ...toPublicCv(parsed.data), profile: parsed.data.profile }, lang);
  const template = parseTemplate(q.get("template"), parsed.data.settings.pdfTemplate);
  return pdfResponse(await renderCvPdf(cv, [], template, lang));
}
