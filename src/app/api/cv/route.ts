import type { NextRequest } from "next/server";
import { parseLocale } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";

/** Public, visibility-filtered CV as JSON, in one language: `?lang=it` (default) or `?lang=en`. */
export async function GET(req: NextRequest) {
  return Response.json(await getPublicCv(parseLocale(req.nextUrl.searchParams.get("lang"))));
}
