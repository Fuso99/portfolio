// Writes out/index.html for the static export. On the Node server the proxy
// sends "/" to /it or /en; static hosting has no proxy, so this page does the
// same in the browser: the language picked with the switcher (NEXT_LOCALE
// cookie), else the browser's, else English. Without JavaScript: Italian.
import { writeFileSync } from "node:fs";

const base = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Portfolio</title>
<link rel="alternate" hreflang="it" href="${base}/it">
<link rel="alternate" hreflang="en" href="${base}/en">
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
// GitHub Pages: serve files as they are (no Jekyll, which would drop _next/).
writeFileSync("out/.nojekyll", "");
console.log(`out/index.html written (base path: "${base || "/"}")`);
