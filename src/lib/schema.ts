import { z } from "zod";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

/** "YYYY-MM" month string. */
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Formato atteso AAAA-MM");
/** End month, or "" when the activity is ongoing. */
const endMonth = z.union([month, z.literal("")]);
const id = z.string().min(1).max(80);
const tags = z.array(z.string().trim().min(1)).max(60);

/**
 * Translatable value. Italian is the source language and may be required;
 * English is optional and falls back to Italian when empty.
 */
function loc<T extends z.ZodType<string | string[]>>(base: T, required?: T) {
  return z.object({ it: required ?? base, en: base });
}
const text = loc(z.string().trim());
const requiredText = loc(z.string().trim(), z.string().trim().min(1, "Obbligatorio"));
const textMax = (n: number) => loc(z.string().trim().max(n));
const tagList = loc(tags);

export const SKILL_CATEGORIES = [
  { id: "backend", label: "Backend" },
  { id: "ai", label: "AI e agenti" },
  { id: "cloud", label: "Cloud e container" },
  { id: "devops", label: "DevOps" },
  { id: "database", label: "Database" },
  { id: "frontend", label: "Frontend" },
] as const;

export const skillCategory = z.enum(["backend", "ai", "cloud", "devops", "database", "frontend"]);

export const STATUS_STATES = [
  { id: "open", label: "Aperto a proposte" },
  { id: "employed", label: "Impegnato su un progetto" },
  { id: "unavailable", label: "Non disponibile" },
] as const;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Obbligatorio"),
  lastName: z.string().trim().min(1, "Obbligatorio"),
  title: requiredText,
  roles: tagList,
  tagline: textMax(240),
  summary: textMax(1200),
  location: text,
  email: z.union([z.email("Email non valida"), z.literal("")]),
  phone: z.string().trim(),
  linkedin: z.union([z.url("URL non valido"), z.literal("")]),
  github: z.union([z.url("URL non valido"), z.literal("")]),
  avatarUrl: z.string().trim(),
  status: z.object({
    state: z.enum(["open", "employed", "unavailable"]),
    label: textMax(120),
  }),
});

export const highlightSchema = z.object({
  title: text,
  text: requiredText,
});

export const engagementSchema = z.object({
  id,
  client: z.string().trim().min(1, "Obbligatorio"),
  via: z.string().trim(),
  start: month,
  end: endMonth,
  summary: text,
  highlights: z.array(highlightSchema),
  tech: tags,
});

export const experienceSchema = z.object({
  id,
  company: z.string().trim().min(1, "Obbligatorio"),
  location: text,
  role: requiredText,
  start: month,
  end: endMonth,
  visible: z.boolean(),
  engagements: z.array(engagementSchema),
});

export const projectSchema = z.object({
  id,
  title: requiredText,
  client: z.string().trim(),
  via: z.string().trim(),
  company: z.string().trim(),
  category: text,
  start: month,
  end: endMonth,
  summary: textMax(240),
  description: text,
  role: text,
  responsibilities: tagList,
  stack: tags,
  url: z.union([z.url("URL non valido"), z.literal("")]),
  visible: z.boolean(),
  featured: z.boolean(),
});

export const skillSchema = z.object({
  id,
  name: z.string().trim().min(1, "Obbligatorio"),
  category: skillCategory,
  level: z.number().int().min(1).max(5),
  aliases: tags,
  visible: z.boolean(),
});

export const educationSchema = z.object({
  id,
  institution: z.string().trim().min(1, "Obbligatorio"),
  title: requiredText,
  location: text,
  start: month,
  end: endMonth,
  description: text,
  visible: z.boolean(),
});

export const certificationSchema = z.object({
  id,
  name: z.string().trim().min(1, "Obbligatorio"),
  issuer: z.string().trim(),
  date: z.union([month, z.literal("")]),
  url: z.union([z.url("URL non valido"), z.literal("")]),
});

export const languageSchema = z.object({
  id,
  name: requiredText,
  level: text,
});

export const PDF_TEMPLATES = [
  { id: "modern", label: "Moderno", description: "Barra laterale con contatti e competenze a pallini, esperienze su binario." },
  { id: "classic", label: "Classico", description: "Una colonna in serif con i periodi a destra. Il più leggibile per gli ATS." },
  { id: "trace", label: "Trace", description: "Colori e caratteri del sito, ruolo attuale in evidenza nell'intestazione." },
] as const;
export const pdfTemplate = z.enum(["modern", "classic", "trace"]);
export type PdfTemplate = z.infer<typeof pdfTemplate>;
export const DEFAULT_PDF_TEMPLATE: PdfTemplate = "modern";

export const cvSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  softSkills: tagList,
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
  settings: z.object({ pdfTemplate: pdfTemplate }),
  meta: z.object({ updatedAt: z.string() }),
});

/** The CV as stored and edited: translatable fields hold both languages. */
export type CvSource = z.infer<typeof cvSchema>;

/** A translatable field, as stored. */
export type Localized<T> = { it: T; en: T };

/** Replaces every Localized<T> in a type with T. */
export type Resolved<T> = T extends Localized<infer U>
  ? U
  : T extends readonly (infer E)[]
    ? Resolved<E>[]
    : T extends object
      ? { [K in keyof T]: Resolved<T[K]> }
      : T;

/** The CV in one language, as the site and the PDF render it. */
export type Cv = Resolved<CvSource>;

export type Profile = Cv["profile"];
export type Experience = Cv["experiences"][number];
export type Engagement = Experience["engagements"][number];
export type Project = Cv["projects"][number];
export type Skill = Cv["skills"][number];
export type SkillCategory = z.infer<typeof skillCategory>;
export type Education = Cv["education"][number];

function isLocalized(v: unknown): v is Localized<unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length === 2 && "it" in v && "en" in v;
}

const isEmpty = (v: unknown) => v === "" || (Array.isArray(v) && v.length === 0) || v == null;

/** One translatable value in `lang`, falling back to Italian. */
export function pickLocalized<T>(v: Localized<T> | undefined, lang: Locale): T | undefined {
  if (!v) return undefined;
  return isEmpty(v[lang]) ? v[DEFAULT_LOCALE] : v[lang];
}

/** Picks one language everywhere; an empty translation falls back to Italian. */
export function localizeCv(cv: CvSource, lang: Locale): Cv {
  const walk = (v: unknown): unknown => {
    if (isLocalized(v)) return isEmpty(v[lang]) ? v[DEFAULT_LOCALE] : v[lang];
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(cv) as Cv;
}

/** Counts translatable fields that have Italian text but no English yet. */
export function missingTranslations(cv: CvSource): number {
  let n = 0;
  const walk = (v: unknown) => {
    if (isLocalized(v)) {
      if (!isEmpty(v.it) && isEmpty(v.en)) n++;
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(cv);
  return n;
}

/** Fields that became translatable, per object kind (for JSON written before i18n). */
const LEGACY_TEXT = {
  profile: ["title", "roles", "tagline", "summary", "location"],
  status: ["label"],
  experience: ["role", "location"],
  engagement: ["summary"],
  highlight: ["title", "text"],
  project: ["title", "category", "summary", "description", "role", "responsibilities"],
  education: ["title", "location", "description"],
  language: ["name", "level"],
} as const;

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
const asList = (v: unknown): Obj[] => (Array.isArray(v) ? v.map(asObj) : []);

function upgrade(o: Obj, keys: readonly string[]): Obj {
  const out = { ...o };
  for (const k of keys) {
    const v = out[k];
    if (typeof v === "string") out[k] = { it: v, en: "" };
    else if (Array.isArray(v)) out[k] = { it: v, en: [] };
  }
  return out;
}

/**
 * Fills in what older JSON files lack, so previous exports still load:
 * the PDF template setting, and single-language text (kept as Italian).
 */
export function normalizeCv(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const cv = raw as Obj;
  const profile = upgrade(asObj(cv.profile), LEGACY_TEXT.profile);
  profile.status = upgrade(asObj(profile.status), LEGACY_TEXT.status);
  return {
    ...cv,
    profile,
    experiences: asList(cv.experiences).map((x) => ({
      ...upgrade(x, LEGACY_TEXT.experience),
      engagements: asList(x.engagements).map((e) => ({
        ...upgrade(e, LEGACY_TEXT.engagement),
        highlights: asList(e.highlights).map((h) => upgrade(h, LEGACY_TEXT.highlight)),
      })),
    })),
    projects: asList(cv.projects).map((p) => upgrade(p, LEGACY_TEXT.project)),
    education: asList(cv.education).map((e) => upgrade(e, LEGACY_TEXT.education)),
    languages: asList(cv.languages).map((l) => upgrade(l, LEGACY_TEXT.language)),
    softSkills: Array.isArray(cv.softSkills) ? { it: cv.softSkills, en: [] } : cv.softSkills,
    settings: { pdfTemplate: DEFAULT_PDF_TEMPLATE, ...asObj(cv.settings) },
  };
}
