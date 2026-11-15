import type { Locale } from "./config";

/**
 * Interface copy for the public site and the PDF. Small enough to ship both
 * languages to the client: the admin preview switches between them live.
 * CV content is not here: it lives, translated, in cv-data.json.
 */
const it = {
  meta: {
    htmlLang: "it",
    dateLocale: "it-IT",
    switchTo: "EN",
    switchLabel: "Read in English",
  },
  date: {
    monthNames: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
    present: "oggi",
    years: (n: number) => (n === 1 ? "1 anno" : `${n} anni`),
    months: (n: number) => (n === 1 ? "1 mese" : `${n} mesi`),
    and: " e ",
  },
  nav: {
    label: "Sezioni",
    experience: "Esperienza",
    skills: "Competenze",
    projects: "Progetti",
    contact: "Contatti",
    top: "Torna all'inizio",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
  },
  status: {
    open: "Aperto a proposte",
    employed: "Impegnato su un progetto",
    unavailable: "Non disponibile",
  },
  hero: {
    seeProjects: "Guarda i progetti",
    writeMe: "Scrivimi",
  },
  trace: {
    title: "trace/carriera",
    summary: (spans: number, total: string) => `${spans} span, ${total}`,
    ongoing: "in corso",
    hint: "clicca uno span per aprirlo",
  },
  via: (name: string) => `tramite ${name}`,
  timeline: {
    title: "Esperienza",
    lead: (since: string) =>
      `Consulenza su progetti enterprise${since ? ` dal ${since}` : ""}: assicurazioni, telecomunicazioni, retail e pubblica amministrazione.`,
    details: "Dettagli",
  },
  skills: {
    title: "Competenze",
    lead: "Livelli autovalutati da 1 a 5, con il numero di progetti in cui ho usato ogni competenza.",
    categories: "Categorie",
    levels: ["", "Base", "Discreto", "Buono", "Avanzato", "Esperto"],
    usedIn: (n: number) => `, in ${n} ${n === 1 ? "progetto" : "progetti"}`,
    levelAria: (n: number) => `Livello ${n} su 5`,
    soft: "Soft skill",
  },
  skillCategories: {
    backend: "Backend",
    ai: "AI e agenti",
    cloud: "Cloud e container",
    devops: "DevOps",
    database: "Database",
    frontend: "Frontend",
  },
  projects: {
    title: "Progetti",
    lead: "I lavori più significativi per i clienti. Apri una scheda per vedere ruolo, responsabilità e stack.",
    open: (title: string) => `Apri i dettagli di ${title}`,
    close: "Chiudi",
    client: "Cliente",
    via: "Tramite",
    company: "Azienda",
    period: "Periodo",
    role: "Ruolo",
    whatIDid: "Cosa ho fatto",
    stack: "Stack",
    link: "Apri il progetto",
  },
  cvPreview: {
    open: "Apri il CV",
    generating: "Preparo il PDF…",
    error: "Non sono riuscito a generare il PDF. Riprova.",
    title: "Anteprima del CV",
    download: "Scarica",
    newTab: "Apri in una nuova scheda",
    close: "Chiudi l'anteprima",
  },
  contact: {
    title: "Contatti",
    lead: "Per proposte, collaborazioni o domande su un progetto: scrivimi un'email o contattami su LinkedIn.",
    copy: "Copia l'email",
    copied: "Email copiata",
    copyFailed: "Copia non riuscita",
    copyFailedHint: "Seleziona l'indirizzo e copialo a mano.",
  },
  footer: {
    updated: (date: string) => `CV aggiornato il ${date}`,
  },
  preview: {
    paused: "L'anteprima riprende appena i campi in modifica sono completi.",
  },
  pdf: {
    profile: "Profilo",
    experience: "Esperienza",
    skills: "Competenze",
    education: "Formazione",
    languages: "Lingue",
    contacts: "Contatti",
    tech: "Tecnologie",
    soft: "Trasversali",
    targeted: "Versione mirata su",
    current: "Oggi",
  },
};

export type Dictionary = typeof it;

const en: Dictionary = {
  meta: {
    htmlLang: "en",
    dateLocale: "en-GB",
    switchTo: "IT",
    switchLabel: "Leggi in italiano",
  },
  date: {
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    present: "present",
    years: (n) => (n === 1 ? "1 year" : `${n} years`),
    months: (n) => (n === 1 ? "1 month" : `${n} months`),
    and: ", ",
  },
  nav: {
    label: "Sections",
    experience: "Experience",
    skills: "Skills",
    projects: "Projects",
    contact: "Contact",
    top: "Back to top",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  status: {
    open: "Open to offers",
    employed: "Working on a project",
    unavailable: "Not available",
  },
  hero: {
    seeProjects: "See the projects",
    writeMe: "Get in touch",
  },
  trace: {
    title: "trace/career",
    summary: (spans, total) => `${spans} spans, ${total}`,
    ongoing: "ongoing",
    hint: "click a span to open it",
  },
  via: (name) => `via ${name}`,
  timeline: {
    title: "Experience",
    lead: (since) =>
      `Consulting on enterprise projects${since ? ` since ${since}` : ""}: insurance, telecoms, retail and public administration.`,
    details: "Details",
  },
  skills: {
    title: "Skills",
    lead: "Self-assessed on a 1 to 5 scale, with the number of projects where I used each skill.",
    categories: "Categories",
    levels: ["", "Basic", "Fair", "Good", "Advanced", "Expert"],
    usedIn: (n) => `, in ${n} ${n === 1 ? "project" : "projects"}`,
    levelAria: (n) => `Level ${n} of 5`,
    soft: "Soft skills",
  },
  skillCategories: {
    backend: "Backend",
    ai: "AI and agents",
    cloud: "Cloud and containers",
    devops: "DevOps",
    database: "Databases",
    frontend: "Frontend",
  },
  projects: {
    title: "Projects",
    lead: "The most significant work for clients. Open a card to see role, responsibilities and stack.",
    open: (title) => `Open the details of ${title}`,
    close: "Close",
    client: "Client",
    via: "Via",
    company: "Employer",
    period: "Period",
    role: "Role",
    whatIDid: "What I did",
    stack: "Stack",
    link: "Open the project",
  },
  cvPreview: {
    open: "Open the CV",
    generating: "Preparing the PDF…",
    error: "Could not generate the PDF. Please try again.",
    title: "CV preview",
    download: "Download",
    newTab: "Open in a new tab",
    close: "Close the preview",
  },
  contact: {
    title: "Contact",
    lead: "For offers, collaborations or questions about a project: send me an email or reach out on LinkedIn.",
    copy: "Copy the email address",
    copied: "Email copied",
    copyFailed: "Couldn't copy",
    copyFailedHint: "Select the address and copy it by hand.",
  },
  footer: {
    updated: (date) => `CV updated on ${date}`,
  },
  preview: {
    paused: "The preview resumes as soon as the fields being edited are complete.",
  },
  pdf: {
    profile: "Profile",
    experience: "Experience",
    skills: "Skills",
    education: "Education",
    languages: "Languages",
    contacts: "Contact",
    tech: "Technologies",
    soft: "Soft skills",
    targeted: "Tailored for",
    current: "Present",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { it, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}
