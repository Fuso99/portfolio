import type { CvSource } from "@/lib/schema";
import { slugId } from "@/lib/utils";

type Source = CvSource;
const thisMonth = () => new Date().toISOString().slice(0, 7);
const blank = () => ({ it: "", en: "" });

export const newExperience = (): Source["experiences"][number] => ({
  id: slugId("exp"),
  company: "",
  location: blank(),
  role: blank(),
  start: thisMonth(),
  end: "",
  visible: true,
  engagements: [],
});

export const newEngagement = (): Source["experiences"][number]["engagements"][number] => ({
  id: slugId("eng"),
  client: "",
  via: "",
  start: thisMonth(),
  end: "",
  summary: blank(),
  highlights: [],
  tech: [],
});

export const newProject = (): Source["projects"][number] => ({
  id: slugId("prj"),
  title: blank(),
  client: "",
  via: "",
  company: "",
  category: blank(),
  start: thisMonth(),
  end: "",
  summary: blank(),
  description: blank(),
  role: blank(),
  responsibilities: { it: [], en: [] },
  stack: [],
  url: "",
  visible: false,
  featured: false,
});

export const newSkill = (category: Source["skills"][number]["category"] = "backend"): Source["skills"][number] => ({
  id: slugId("skill"),
  name: "",
  category,
  level: 3,
  aliases: [],
  visible: true,
});

export const newEducation = (): Source["education"][number] => ({
  id: slugId("edu"),
  institution: "",
  title: blank(),
  location: blank(),
  start: thisMonth(),
  end: "",
  description: blank(),
  visible: true,
});

export const newCertification = (): Source["certifications"][number] => ({
  id: slugId("cert"),
  name: "",
  issuer: "",
  date: "",
  url: "",
});

export const newLanguage = (): Source["languages"][number] => ({ id: slugId("lang"), name: blank(), level: blank() });
