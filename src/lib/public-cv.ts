import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readCv } from "./store";
import { toPublicCv } from "./utils";

export const CV_TAG = "cv";

/** The CV as visitors see it. Cached until the admin saves (revalidateTag(CV_TAG)). */
export async function getPublicCv() {
  "use cache";
  cacheLife("max");
  cacheTag(CV_TAG);
  return toPublicCv(await readCv());
}
