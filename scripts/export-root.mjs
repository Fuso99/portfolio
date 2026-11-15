// Writes out/index.html for the static export. On the Node server the proxy
// sends "/" to /it or /en; static hosting has no proxy, so this page does the
// same in the browser: the language picked with the switcher (NEXT_LOCALE
// cookie), else the browser's, else English. Without JavaScript: Italian.
import { writeFileSync } from "node:fs";

const base = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
// Keep in step with LOCALES and DEFAULT_LOCALE in src/i18n/config.ts.
const locales = ["it", "en"];
const defaultLocale = "it";

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Portfolio</title>
<link rel="alternate" hreflang="it" href="${base}/it">
<link rel="alternate" hreflang="en" href="${base}/en">
<link rel="alternate" hreflang="x-default" href="${base}/${defaultLocale}">
<script>
(function () {
  var m = document.cookie.match(/(?:^|; )NEXT_LOCALE=(it|en)(?:;|$)/);
  var lang = m ? m[1] : null;
  if (!lang) {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < prefs.length && !lang; i++) {
      var l = String(prefs[i]).toLowerCase().split("-")[0];
      if (l === "it" || l === "en") lang = l;
    }
  }
  location.replace("${base}/" + (lang || "en") + location.hash);
})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=${base}/it"></noscript>
<style>body{background:#06070d;color:#e8e9f3;font:16px system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}a{color:#8f8cff}</style>
</head>
<body>
<p><a href="${base}/it">Italiano</a> · <a href="${base}/en" lang="en">English</a></p>
</body>
</html>
`;

writeFileSync("out/index.html", html);

// out/sitemap.xml: the two language versions, each listing the others as
// alternates. Not at the domain root on GitHub Pages, so robots.txt cannot
// point to it: it is submitted in Search Console. Written here and not with
// app/sitemap.ts, which a static export requires to be "force-static", a
// setting the server build (Cache Components) rejects.
if (site) {
  const url = (lang) => `${site}${base}/${lang}`;
  const alternates = [...locales.map((l) => [l, url(l)]), ["x-default", url(defaultLocale)]]
    .map(([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${locales.map((l) => `  <url>\n    <loc>${url(l)}</loc>\n${alternates}\n  </url>`).join("\n")}
</urlset>
`;
  writeFileSync("out/sitemap.xml", sitemap);
} else {
  console.warn("SITE_URL not set: out/sitemap.xml skipped (it needs absolute URLs)");
}
// GitHub Pages: serve files as they are (no Jekyll, which would drop _next/).
writeFileSync("out/.nojekyll", "");
console.log(`out/index.html written (base path: "${base || "/"}")`);
