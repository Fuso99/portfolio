import type { Cv, Education, Engagement, Experience, Project, Skill } from "@/lib/schema";
import { slugId } from "@/lib/utils";

const thisMonth = () => new Date().toISOString().slice(0, 7);

export const newExperience = (): Experience => ({
  id: slugId("exp"),
  company: "",
  location: "",
  role: "",
  start: thisMonth(),
  end: "",
  visible: true,
  engagements: [],
});

export const newEngagement = (): Engagement => ({
  id: slugId("eng"),
  client: "",
  via: "",
  start: thisMonth(),
  end: "",
  summary: "",
  highlights: [],
  tech: [],
});

export const newProject = (): Project => ({
  id: slugId("prj"),
  title: "",
  client: "",
  via: "",
  company: "",
  category: "",
  start: thisMonth(),
  end: "",
  summary: "",
  description: "",
  role: "",
  responsibilities: [],
  stack: [],
  url: "",
  visible: false,
  featured: false,
});

export const newSkill = (category: Skill["category"] = "backend"): Skill => ({
  id: slugId("skill"),
  name: "",
  category,
  level: 3,
  aliases: [],
  visible: true,
});

export const newEducation = (): Education => ({
  id: slugId("edu"),
  institution: "",
  title: "",
  location: "",
  start: thisMonth(),
  end: "",
  description: "",
  visible: true,
});

export const newCertification = (): Cv["certifications"][number] => ({
  id: slugId("cert"),
  name: "",
  issuer: "",
  date: "",
  url: "",
});

export const newLanguage = (): Cv["languages"][number] => ({ id: slugId("lang"), name: "", level: "" });
