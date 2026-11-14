import type { NextConfig } from "next";

/**
 * Two builds from the same code:
 * - `npm run build`: Node server with backoffice, API and proxy.
 * - `npm run export` (STATIC_EXPORT=1): public site only, as static files in `out/`.
 *   Files named `*.server.ts(x)` (backoffice, API routes, proxy) are left out
 *   because only the server build lists `server.tsx`/`server.ts` among the page extensions.
 */
const isExport = process.env.STATIC_EXPORT === "1";
/** Subpath the static site is served from, e.g. "/portfolio" on GitHub Pages (set by the workflow). */
const basePath = isExport ? (process.env.BASE_PATH ?? "").replace(/\/$/, "") : "";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components (PPR) is not available in a static export; there every page is fully static anyway.
  cacheComponents: !isExport,
  partialPrefetching: !isExport,
  pageExtensions: isExport ? ["tsx", "ts"] : ["server.tsx", "server.ts", "tsx", "ts"],
  ...(isExport ? { output: "export" as const, basePath } : {}),
  // Leaves out the route types written by `next dev`, which list the backoffice too.
  ...(isExport ? { typescript: { tsconfigPath: "tsconfig.export.json" } } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? "",
  },
  experimental: {
    // Unmatched URLs: the app has several root layouts (/[lang] and /admin).
    globalNotFound: true,
  },
  turbopack: {
    // See public-cv.static.ts.
    ...(isExport ? { resolveAlias: { "@/lib/public-cv": "./src/lib/public-cv.static.ts" } } : {}),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
