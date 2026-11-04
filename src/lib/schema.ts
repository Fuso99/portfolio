import { z } from "zod";

/** "YYYY-MM" month string. */
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Formato atteso AAAA-MM");
/** End month, or "" when the activity is ongoing. */
const endMonth = z.union([month, z.literal("")]);
const id = z.string().min(1).max(80);
const tags = z.array(z.string().trim().min(1)).max(60);

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
  title: z.string().trim().min(1, "Obbligatorio"),
  roles: tags,
  tagline: z.string().trim().max(240),
  summary: z.string().trim().max(1200),
  location: z.string().trim(),
  email: z.union([z.email("Email non valida"), z.literal("")]),
  phone: z.string().trim(),
  linkedin: z.union([z.url("URL non valido"), z.literal("")]),
  github: z.union([z.url("URL non valido"), z.literal("")]),
  avatarUrl: z.string().trim(),
  status: z.object({
    state: z.enum(["open", "employed", "unavailable"]),
    label: z.string().trim().max(120),
  }),
});

export const highlightSchema = z.object({
  title: z.string().trim(),
  text: z.string().trim().min(1, "Obbligatorio"),
});

export const engagementSchema = z.object({
  id,
  client: z.string().trim().min(1, "Obbligatorio"),
  via: z.string().trim(),
  start: month,
  end: endMonth,
  summary: z.string().trim(),
  highlights: z.array(highlightSchema),
  tech: tags,
});

export const experienceSchema = z.object({
  id,
  company: z.string().trim().min(1, "Obbligatorio"),
  location: z.string().trim(),
  role: z.string().trim().min(1, "Obbligatorio"),
  start: month,
  end: endMonth,
  visible: z.boolean(),
  engagements: z.array(engagementSchema),
});

export const projectSchema = z.object({
  id,
  title: z.string().trim().min(1, "Obbligatorio"),
  client: z.string().trim(),
  via: z.string().trim(),
  company: z.string().trim(),
  category: z.string().trim(),
  start: month,
  end: endMonth,
  summary: z.string().trim().max(240),
  description: z.string().trim(),
  role: z.string().trim(),
  responsibilities: tags,
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
  title: z.string().trim().min(1, "Obbligatorio"),
  location: z.string().trim(),
  start: month,
  end: endMonth,
  description: z.string().trim(),
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
  name: z.string().trim().min(1, "Obbligatorio"),
  level: z.string().trim(),
});

export const cvSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  softSkills: tags,
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
  meta: z.object({ updatedAt: z.string() }),
});

export type Cv = z.infer<typeof cvSchema>;
export type Profile = Cv["profile"];
export type Experience = Cv["experiences"][number];
export type Engagement = Experience["engagements"][number];
export type Project = Cv["projects"][number];
export type Skill = Cv["skills"][number];
export type SkillCategory = z.infer<typeof skillCategory>;
export type Education = Cv["education"][number];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Scrivi il tuo nome").max(100),
  email: z.email("Inserisci un'email valida"),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(10, "Il messaggio deve avere almeno 10 caratteri").max(4000),
  /** Honeypot: real visitors never fill it. */
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type ContactMessage = Omit<ContactInput, "website"> & {
  id: string;
  createdAt: string;
};
