import type { Locale } from "@/i18n/config";
import type { Cv } from "@/lib/schema";
import { absoluteUrl, fullName } from "@/lib/utils";

/**
 * schema.org Person: tells search engines that this site, LinkedIn and GitHub
 * belong to the same person, which helps searches on the name.
 * `cv` is the public CV, already in the page's language.
 */
export function PersonJsonLd({ cv, lang }: { cv: Cv; lang: Locale }) {
  const p = cv.profile;
  // "Cologno Monzese (MI)" → "Cologno Monzese"
  const locality = p.location.replace(/\s*\(.*\)\s*$/, "").trim();
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName(cv),
    // "Fuso Nerini" is one compound surname, not a middle name plus a surname.
    givenName: p.firstName,
    familyName: p.lastName,
    jobTitle: p.title,
    description: p.tagline,
    url: absoluteUrl(`/${lang}`),
    ...(p.email ? { email: `mailto:${p.email}` } : {}),
    ...(locality
      ? { address: { "@type": "PostalAddress", addressLocality: locality, addressCountry: "IT" } }
      : {}),
    knowsAbout: cv.skills.filter((s) => (s.category === "backend" || s.category === "ai") && s.level >= 4).map((s) => s.name),
    sameAs: [p.linkedin, p.github].filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      // "<" escaped so a value can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
