import path from "node:path";
import { Font } from "@react-pdf/renderer";
import { SKILL_CATEGORIES, type Cv, type Skill } from "@/lib/schema";
import { fullName } from "@/lib/utils";

/** Every font is SIL Open Font License (Merriweather, Open Sans, Geist, Bricolage Grotesque). */
const dir = path.join(process.cwd(), "src/pdf/fonts");
const f = (file: string) => path.join(dir, file);

let registered = false;
export function registerFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "Merriweather",
    fonts: [
      { src: f("MerriweatherLight-regular.ttf"), fontWeight: 300 },
      { src: f("Merriweather-regular.ttf"), fontWeight: 400 },
      { src: f("Merriweather-italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: f("Merriweather-bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Open Sans",
    fonts: [
      { src: f("OpenSans-regular.ttf"), fontWeight: 400 },
      { src: f("OpenSans-italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: f("OpenSans-bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Geist",
    fonts: [400, 500, 600, 700].map((w) => ({ src: f(`geist-sans-latin-${w}-normal.woff`), fontWeight: w })),
  });
  Font.register({
    family: "Geist Mono",
    fonts: [400, 500].map((w) => ({ src: f(`geist-mono-latin-${w}-normal.woff`), fontWeight: w })),
  });
  Font.register({
    family: "Bricolage",
    fonts: [600, 700].map((w) => ({ src: f(`bricolage-grotesque-latin-${w}-normal.woff`), fontWeight: w })),
  });
  // The default hyphenation is English and splits Italian words badly.
  Font.registerHyphenationCallback((word) => [word]);
}

export type TemplateProps = { cv: Cv; selected: Skill[]; generatedAt: string };

export function contactItems(cv: Cv) {
  const p = cv.profile;
  return [
    p.location && { label: p.location },
    p.email && { label: p.email, href: `mailto:${p.email}` },
    p.phone && { label: p.phone, href: `tel:${p.phone.replace(/\s+/g, "")}` },
    p.linkedin && { label: p.linkedin.replace(/^https?:\/\/(www\.|it\.)?/, ""), href: p.linkedin },
    p.github && { label: p.github.replace(/^https?:\/\/(www\.)?/, ""), href: p.github },
  ].filter(Boolean) as { label: string; href?: string }[];
}

export function skillGroups(cv: Cv) {
  return SKILL_CATEGORIES.map((c) => ({ ...c, skills: cv.skills.filter((s) => s.category === c.id) })).filter(
    (g) => g.skills.length > 0,
  );
}

export function docMeta(cv: Cv) {
  return { title: `CV ${fullName(cv)}`, author: fullName(cv), subject: cv.profile.title, language: "it" };
}
