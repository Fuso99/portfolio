import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/config";
import { localizeCv } from "./schema";
import { readCv } from "./store";
import { toPublicCv } from "./utils";

export const CV_TAG = "cv";

/** The CV as visitors see it, in one language. Cached until the admin saves (revalidateTag(CV_TAG)). */
export async function getPublicCv(lang: Locale) {
  "use cache";
  cacheLife("max");
  cacheTag(CV_TAG);
  return localizeCv(toPublicCv(await readCv()), lang);
}
