import { revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { CV_TAG } from "@/lib/public-cv";
import { readCv, writeCv } from "@/lib/store";
import { isAdmin, unauthorized } from "@/lib/server-auth";

/** Full CV, hidden items included. `?download=1` serves it as a file. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const cv = await readCv();
  const download = new URL(req.url).searchParams.has("download");
  return new Response(JSON.stringify(cv, null, 2), {
    headers: {
      "Content-Type": "application/json",
      ...(download ? { "Content-Disposition": 'attachment; filename="cv-data.json"' } : {}),
    },
  });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Content-Type deve essere application/json" }, { status: 415 });
  }
  try {
    const saved = await writeCv(await req.json());
    revalidateTag(CV_TAG, { expire: 0 });
    return Response.json(saved);
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ error: "Dati non validi.", issues: err.issues }, { status: 400 });
    }
    if (err instanceof SyntaxError) return Response.json({ error: "JSON non valido." }, { status: 400 });
    throw err;
  }
}
