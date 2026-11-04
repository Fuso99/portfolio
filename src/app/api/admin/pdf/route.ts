import { cvSchema } from "@/lib/schema";
import { isAdmin, unauthorized } from "@/lib/server-auth";
import { toPublicCv } from "@/lib/utils";
import { pdfResponse, renderCvPdf } from "@/pdf/render";

/** Renders a PDF from the unsaved draft sent by the editor. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = cvSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bozza non valida.", issues: parsed.error.issues }, { status: 400 });
  return pdfResponse(await renderCvPdf(toPublicCv(parsed.data), []));
}
