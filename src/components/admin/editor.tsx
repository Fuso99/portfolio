"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  ExternalLink,
  FileBraces,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  PanelRight,
  Save,
  Sparkles,
  Undo2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/primitives";
import { LOCALES, type Locale } from "@/i18n/config";
import { cvSchema, missingTranslations, type CvSource } from "@/lib/schema";
import { cn, fullName } from "@/lib/utils";
import { EducationTab, ExperiencesTab, ProfileTab, ProjectsTab, SkillsTab } from "./content-tabs";
import { DataTab } from "./data-tab";
import { EditLangContext } from "./edit-lang";
import { ManagerTab } from "./manager-tab";
import { Preview } from "./preview";

const TABS = [
  { id: "profile", label: "Profilo", icon: User, section: "top", keys: ["profile"] },
  { id: "experiences", label: "Esperienze", icon: Briefcase, section: "esperienza", keys: ["experiences"] },
  { id: "projects", label: "Progetti", icon: FolderKanban, section: "progetti", keys: ["projects"] },
  { id: "skills", label: "Competenze", icon: Sparkles, section: "competenze", keys: ["skills", "softSkills"] },
  { id: "education", label: "Formazione e lingue", icon: GraduationCap, section: "cv", keys: ["education", "certifications", "languages"] },
  { id: "manager", label: "Gestione portfolio", icon: LayoutDashboard, section: "esperienza", keys: [] },
  { id: "data", label: "Import ed export", icon: FileBraces, section: "cv", keys: [] },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabsWithErrors(errors: FieldErrors<CvSource>) {
  return TABS.filter((t) => t.keys.some((k) => k in errors));
}

export function AdminEditor({ initialCv }: { initialCv: CvSource }) {
  const router = useRouter();
  const form = useForm<CvSource>({ resolver: zodResolver(cvSchema), defaultValues: initialCv, mode: "onBlur" });
  const [lang, setLang] = useState<Locale>("it");
  const { control, handleSubmit, reset, formState } = form;
  const [tab, setTab] = useState<TabId>("profile");
  const [showPreview, setShowPreview] = useState(true);
  const draft = useWatch({ control }) as CvSource;
  const untranslated = missingTranslations(draft);
  const errorTabs = tabsWithErrors(formState.errors);
  const current = TABS.find((t) => t.id === tab)!;

  const save = handleSubmit(
    async (values) => {
      const res = await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).catch(() => null);
      if (!res) return void toast.error("Modifiche non salvate", { description: "Il server non risponde. Riprova." });
      if (res.status === 401) {
        toast.error("Sessione scaduta", { description: "Accedi di nuovo: le modifiche restano in questa scheda finché non la chiudi." });
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return void toast.error("Modifiche non salvate", { description: data?.error ?? `Errore ${res.status}` });
      }
      reset(data as CvSource);
      toast.success("Modifiche pubblicate", { description: "Il sito mostra già la nuova versione." });
    },
    (errors) => {
      const where = tabsWithErrors(errors).map((t) => t.label);
      toast.error("Ci sono campi da correggere", { description: where.length ? `Controlla: ${where.join(", ")}.` : undefined });
      if (where.length) setTab(tabsWithErrors(errors)[0].id);
    },
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (formState.isDirty) e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [save, formState.isDirty]);

  async function logout() {
    if (formState.isDirty && !window.confirm("Hai modifiche non salvate. Uscire comunque?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <EditLangContext value={lang}>
      <div className="flex h-dvh flex-col bg-night text-ink">
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-night-2/70 px-4 py-3 backdrop-blur-xl">
          <div className="mr-auto min-w-0">
            <p className="font-display text-lg font-semibold tracking-tight">Backoffice</p>
            <p className="truncate text-xs text-faint">
              {fullName(initialCv)}, ultimo salvataggio{" "}
              {new Date(formState.defaultValues?.meta?.updatedAt ?? initialCv.meta.updatedAt).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>

          {formState.isDirty ? <span className="text-sm text-[#ffd27a]">Modifiche non salvate</span> : null}
          <Button variant="quiet" size="sm" onClick={() => reset()} disabled={!formState.isDirty || formState.isSubmitting}>
            <Undo2 className="size-3.5" /> Annulla modifiche
          </Button>
          <Button size="sm" onClick={() => save()} disabled={!formState.isDirty || formState.isSubmitting} title="Ctrl+S">
            {formState.isSubmitting ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Salva e pubblica
          </Button>
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <LangSwitch lang={lang} onChange={setLang} untranslated={untranslated} />
          <Button
            variant="quiet"
            size="sm"
            aria-pressed={showPreview}
            onClick={() => setShowPreview((v) => !v)}
            className={cn("hidden lg:inline-flex", showPreview && "text-ink")}
          >
            <PanelRight className="size-3.5" /> Anteprima
          </Button>
          <a href={`/${lang}`} target="_blank" className={buttonClass("quiet", "sm")}>
            <ExternalLink className="size-3.5" /> Sito
          </a>
          <Button variant="quiet" size="sm" onClick={logout}>
            <LogOut className="size-3.5" /> Esci
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav aria-label="Sezioni del backoffice" className="hidden w-56 shrink-0 flex-col gap-0.5 border-r border-line p-3 md:flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              const hasError = errorTabs.some((e) => e.id === t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    tab === t.id ? "bg-white/[0.07] text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                >
                  <Icon className={cn("size-4", tab === t.id ? "text-ion" : "text-faint")} />
                  <span className="flex-1">{t.label}</span>
                  {hasError ? <span className="size-2 rounded-full bg-danger" aria-label="Contiene errori" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="flex min-h-0 min-w-0 flex-1">
            <main className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto", showPreview && "lg:max-w-[46rem] lg:border-r lg:border-line")}>
              <div className="border-b border-line p-3 md:hidden">
                <label className="sr-only" htmlFor="tab-select">
                  Sezione
                </label>
                <select
                  id="tab-select"
                  value={tab}
                  onChange={(e) => setTab(e.target.value as TabId)}
                  className="h-10 w-full rounded-lg border border-line bg-night-2 px-3 text-sm"
                >
                  {TABS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <form onSubmit={(e) => (e.preventDefault(), save())} className="mx-auto max-w-3xl p-5 pb-24 sm:p-8">
                {tab === "profile" && <ProfileTab />}
                {tab === "experiences" && <ExperiencesTab />}
                {tab === "projects" && <ProjectsTab />}
                {tab === "skills" && <SkillsTab />}
                {tab === "education" && <EducationTab />}
                {tab === "manager" && <ManagerTab />}
                {tab === "data" && <DataTab />}
              </form>
            </main>
            {showPreview ? (
              <aside aria-label="Anteprima" className="hidden min-w-0 flex-1 lg:block">
                <Preview draft={draft} section={current.section} />
              </aside>
            ) : null}
          </div>
        </div>
      </div>
      </EditLangContext>
    </FormProvider>
  );
}

/**
 * Content language of the editor: translatable fields and the live preview
 * switch together. English fields left empty fall back to Italian on the site.
 */
function LangSwitch({ lang, onChange, untranslated }: { lang: Locale; onChange: (l: Locale) => void; untranslated: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full border border-line p-0.5" role="radiogroup" aria-label="Lingua dei contenuti">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => onChange(l)}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-xs uppercase transition-colors",
              lang === l ? "bg-white/10 text-ink" : "text-faint hover:text-ink",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {untranslated > 0 ? (
        <button
          type="button"
          onClick={() => onChange("en")}
          className="text-xs text-[#ffd27a] hover:underline"
          title="Campi con testo italiano ma senza traduzione: sul sito inglese mostrano l'italiano."
        >
          {untranslated === 1 ? "1 campo da tradurre" : `${untranslated} campi da tradurre`}
        </button>
      ) : null}
    </div>
  );
}
