import "server-only";
import type { Locale } from "@/i18n/config";
import { localizeCv } from "./schema";
import { readCv } from "./store";
import { toPublicCv } from "./utils";

/**
 * Stand-in for public-cv.ts in the static export (aliased in next.config.ts):
 * "use cache" needs Cache Components, which a static export cannot enable.
 * Each page is rendered once at build time, so there is nothing to cache.
 */
export const CV_TAG = "cv";

export async function getPublicCv(lang: Locale) {
  return localizeCv(toPublicCv(await readCv()), lang);
}
