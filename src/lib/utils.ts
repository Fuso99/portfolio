import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Cv, Engagement, Project, Skill } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

export function formatMonth(value: string) {
  if (!value) return "oggi";
  const [y, m] = value.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatPeriod(start: string, end: string) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "oggi"}`;
}

/** Months since year 0, so periods can be compared and measured. */
export function monthIndex(value: string, now: string) {
  const [y, m] = (value || now).split("-").map(Number);
  return y * 12 + (m - 1);
}

export function formatDuration(start: string, end: string, now: string) {
  const months = Math.max(1, monthIndex(end, now) - monthIndex(start, now) + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(years === 1 ? "1 anno" : `${years} anni`);
  if (rest) parts.push(rest === 1 ? "1 mese" : `${rest} mesi`);
  return parts.join(" e ");
}

/** "YYYY-MM" from an ISO date string. */
export function toMonth(iso: string) {
  return iso.slice(0, 7);
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

/**
 * True when a technology tag (e.g. "Java 21") refers to the skill
 * ("Java"), by name or by one of its aliases.
 */
export function techMatchesSkill(tech: string, skill: Pick<Skill, "name" | "aliases">) {
  const t = norm(tech);
  return [skill.name, ...skill.aliases].some((n) => {
    const name = norm(n);
    return t === name || t.startsWith(name + " ");
  });
}

export function matchesAnySkill(techs: string[], skills: Pick<Skill, "name" | "aliases">[]) {
  if (skills.length === 0) return true;
  return skills.some((s) => techs.some((t) => techMatchesSkill(t, s)));
}

export function engagementMatches(e: Engagement, skills: Skill[]) {
  return matchesAnySkill(e.tech, skills);
}

export function projectMatches(p: Project, skills: Skill[]) {
  return matchesAnySkill(p.stack, skills);
}

/**
 * Strips everything the owner has hidden, for public rendering. The phone
 * number is private: it never reaches the site, /api/cv or the public PDF.
 */
export function toPublicCv(cv: Cv): Cv {
  return {
    ...cv,
    profile: { ...cv.profile, phone: "" },
    experiences: cv.experiences.filter((e) => e.visible),
    projects: cv.projects.filter((p) => p.visible),
    skills: cv.skills.filter((s) => s.visible),
    education: cv.education.filter((e) => e.visible),
  };
}

/**
 * Keeps only the engagements and projects that use at least one of the
 * selected skills. With no selection the CV is returned unchanged.
 */
export function filterCvBySkills(cv: Cv, skillIds: string[]) {
  const selected = cv.skills.filter((s) => skillIds.includes(s.id));
  if (selected.length === 0) return { cv, selected };
  const experiences = cv.experiences
    .map((x) => ({ ...x, engagements: x.engagements.filter((e) => engagementMatches(e, selected)) }))
    .filter((x) => x.engagements.length > 0);
  const projects = cv.projects.filter((p) => projectMatches(p, selected));
  return { cv: { ...cv, experiences, projects }, selected };
}

export function fullName(cv: Pick<Cv, "profile">) {
  return `${cv.profile.firstName} ${cv.profile.lastName}`;
}

export function slugId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
