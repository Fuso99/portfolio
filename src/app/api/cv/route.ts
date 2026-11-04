import { getPublicCv } from "@/lib/public-cv";

/** Public, visibility-filtered CV as JSON. */
export async function GET() {
  return Response.json(await getPublicCv());
}
