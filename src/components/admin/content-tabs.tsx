"use client";

import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { useFieldArray, useFormContext, useWatch, type FieldArrayPath } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/primitives";
import { pickLocalized, SKILL_CATEGORIES, STATUS_STATES, type CvSource } from "@/lib/schema";
import { cn, formatPeriod } from "@/lib/utils";
import { useEditLang } from "./edit-lang";
import { newCertification, newEducation, newEngagement, newExperience, newLanguage, newProject, newSkill } from "./factories";
import {
  inputClass,
  ItemCard,
  LevelField,
  LinesField,
  PeriodFields,
  SelectField,
  SwitchField,
  TagField,
  TextArea,
  TextField,
  LangBadge,
  useFieldError,
} from "./fields";

export function Panel({ title, lead, action, children }: { title: string; lead?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {lead ? <p className="mt-1 max-w-xl text-sm text-muted">{lead}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function IconAction({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("rounded-md p-1.5 text-faint hover:bg-white/5", danger ? "hover:text-danger" : "hover:text-ink")}
    >
      {children}
    </button>
  );
}

/** Removes an item and offers a one-click undo. */
function useRemoveWithUndo<N extends FieldArrayPath<CvSource>>(name: N, what: string) {
  const { control, getValues } = useFormContext<CvSource>();
  const arr = useFieldArray({ control, name, keyName: "_key" });
  function remove(i: number) {
    const item = (getValues(name) as unknown[])[i];
    arr.remove(i);
    toast(`${what} rimosso`, {
      description: "Diventa definitivo quando salvi.",
      action: { label: "Annulla", onClick: () => arr.insert(i, item as never) },
    });
  }
  return { ...arr, remove };
}

/* ───────────── Profilo ───────────── */

export function ProfileTab() {
  return (
    <Panel title="Profilo" lead="Le informazioni dell'intestazione e della sezione contatti.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="profile.firstName" label="Nome" />
        <TextField name="profile.lastName" label="Cognome" />
        <TextField name="profile.title" label="Titolo professionale" hint="Usato nel PDF e nei metadati" localized />
        <TextField name="profile.location" label="Località" localized />
        <TagField name="profile.roles" label="Ruoli animati nell'intestazione" className="sm:col-span-2" localized />
        <TextArea name="profile.tagline" label="Frase di presentazione" rows={2} className="sm:col-span-2" localized />
        <TextArea name="profile.summary" label="Profilo (PDF)" rows={4} className="sm:col-span-2" localized />
        <TextField name="profile.email" label="Email" type="email" />
        <TextField name="profile.phone" label="Telefono" hint="Privato: solo nel PDF generato dal backoffice" />
        <TextField name="profile.linkedin" label="LinkedIn" placeholder="https://…" />
        <TextField name="profile.github" label="GitHub" placeholder="https://github.com/…" />
        <TextField name="profile.avatarUrl" label="Foto profilo" placeholder="/avatar.jpg o https://…" hint="Vuoto: mostra le iniziali. I file locali vanno in /public." className="sm:col-span-2" />
      </div>
      <StatusFields />
    </Panel>
  );
}

export function StatusFields() {
  return (
    <div className="grid gap-4 rounded-xl border border-line bg-white/[0.02] p-4 sm:grid-cols-[14rem_1fr]">
      <SelectField name="profile.status.state" label="Stato lavorativo" options={STATUS_STATES} />
      <TextField name="profile.status.label" label="Testo del badge" placeholder="Vuoto: testo standard dello stato" localized />
    </div>
  );
}

/* ───────────── Esperienze ───────────── */

export function ExperiencesTab() {
  const { control } = useFormContext<CvSource>();
  const lang = useEditLang();
  const { fields, prepend, remove, swap } = useRemoveWithUndo("experiences", "Datore di lavoro");
  const values = useWatch({ control, name: "experiences" });
  const errors = useFormContext<CvSource>().formState.errors.experiences;

  return (
    <Panel
      title="Esperienze"
      lead="Datori di lavoro e, per ciascuno, gli incarichi presso i clienti. L'ordine qui è quello della timeline."
      action={
        <Button size="sm" variant="ghost" onClick={() => prepend(newExperience())}>
          <Plus className="size-3.5" /> Aggiungi esperienza
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.map((f, i) => {
          const v = values?.[i];
          return (
            <ItemCard
              key={f._key}
              title={v?.company ?? ""}
              subtitle={v ? `${pickLocalized(v.role, lang) ?? ""}, ${formatPeriod(v.start, v.end)}${v.visible ? "" : ", nascosta"}` : ""}
              hasError={!!errors?.[i]}
              actions={
                <>
                  <IconAction label="Sposta su" onClick={() => i > 0 && swap(i, i - 1)}>
                    <ArrowUp className="size-4" />
                  </IconAction>
                  <IconAction label="Sposta giù" onClick={() => i < fields.length - 1 && swap(i, i + 1)}>
                    <ArrowDown className="size-4" />
                  </IconAction>
                  <IconAction label="Elimina" danger onClick={() => remove(i)}>
                    <Trash className="size-4" />
                  </IconAction>
                </>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name={`experiences.${i}.company`} label="Azienda" />
                <TextField name={`experiences.${i}.role`} label="Ruolo" localized />
                <TextField name={`experiences.${i}.location`} label="Sede" localized />
                <PeriodFields start={`experiences.${i}.start`} end={`experiences.${i}.end`} />
              </div>
              <SwitchField name={`experiences.${i}.visible`} label="Visibile sul sito" />
              <EngagementsFields index={i} />
            </ItemCard>
          );
        })}
      </div>
    </Panel>
  );
}

function EngagementsFields({ index }: { index: number }) {
  const { control } = useFormContext<CvSource>();
  const name = `experiences.${index}.engagements` as const;
  const { fields, append, remove, swap } = useFieldArray({ control, name, keyName: "_key" });
  const values = useWatch({ control, name });
  return (
    <div className="space-y-2 rounded-xl border border-dashed border-line-strong p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Incarichi presso i clienti</p>
        <Button size="sm" variant="quiet" onClick={() => append(newEngagement())}>
          <Plus className="size-3.5" /> Incarico
        </Button>
      </div>
      {fields.length === 0 ? <p className="text-sm text-faint">Nessun incarico. Aggiungine uno per mostrarlo nella timeline.</p> : null}
      {fields.map((f, j) => {
        const v = values?.[j];
        return (
          <ItemCard
            key={f._key}
            title={v?.client ?? ""}
            subtitle={v ? `${v.via ? `tramite ${v.via}, ` : ""}${formatPeriod(v.start, v.end)}` : ""}
            actions={
              <>
                <IconAction label="Sposta su" onClick={() => j > 0 && swap(j, j - 1)}>
                  <ArrowUp className="size-4" />
                </IconAction>
                <IconAction label="Elimina incarico" danger onClick={() => remove(j)}>
                  <Trash className="size-4" />
                </IconAction>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name={`${name}.${j}.client`} label="Cliente" />
              <TextField name={`${name}.${j}.via`} label="Tramite (società di consulenza)" />
              <PeriodFields start={`${name}.${j}.start`} end={`${name}.${j}.end`} className="sm:col-span-2" />
              <TextArea name={`${name}.${j}.summary`} label="Descrizione" className="sm:col-span-2" localized />
              <TagField name={`${name}.${j}.tech`} label="Tecnologie" className="sm:col-span-2" />
            </div>
            <HighlightsFields name={`${name}.${j}.highlights`} />
          </ItemCard>
        );
      })}
    </div>
  );
}

function HighlightsFields({ name }: { name: `experiences.${number}.engagements.${number}.highlights` }) {
  const { control, register } = useFormContext<CvSource>();
  const lang = useEditLang();
  const { fields, append, remove } = useFieldArray({ control, name, keyName: "_key" });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] text-muted">
          Punti chiave <LangBadge lang={lang} />
        </p>
        <Button size="sm" variant="quiet" onClick={() => append({ title: { it: "", en: "" }, text: { it: "", en: "" } })}>
          <Plus className="size-3.5" /> Punto
        </Button>
      </div>
      {fields.map((f, k) => (
        <div key={f._key} className="flex items-start gap-2">
          <input
            key={lang}
            {...register(`${name}.${k}.title.${lang}`)}
            placeholder={lang === "it" ? "Titolo" : (fields[k]?.title.it ?? "Titolo")}
            aria-label="Titolo del punto"
            className={cn(inputClass, "w-40 shrink-0")}
          />
          <HighlightText name={`${name}.${k}.text`} />
          <IconAction label="Elimina punto" danger onClick={() => remove(k)}>
            <Trash className="size-4" />
          </IconAction>
        </div>
      ))}
    </div>
  );
}

function HighlightText({ name }: { name: `experiences.${number}.engagements.${number}.highlights.${number}.text` }) {
  const { register, getValues } = useFormContext<CvSource>();
  const lang = useEditLang();
  const path = `${name}.${lang}` as const;
  const error = useFieldError(path);
  // Translating: the Italian text is the placeholder.
  const placeholder = lang === "it" ? "Descrizione" : getValues(`${name}.it`) || "Descrizione";
  return (
    <div className="flex-1">
      <input key={path} {...register(path)} placeholder={placeholder} title={lang === "it" ? undefined : placeholder} aria-label="Testo del punto" aria-invalid={!!error} className={inputClass} />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

/* ───────────── Progetti ───────────── */

export function ProjectsTab() {
  const { control, formState } = useFormContext<CvSource>();
  const lang = useEditLang();
  const { fields, prepend, remove } = useRemoveWithUndo("projects", "Progetto");
  const values = useWatch({ control, name: "projects" });
  return (
    <Panel
      title="Progetti"
      lead="Le schede della sezione progetti. Ordine, visibilità ed evidenza si gestiscono anche da Gestione portfolio."
      action={
        <Button size="sm" variant="ghost" onClick={() => prepend(newProject())}>
          <Plus className="size-3.5" /> Aggiungi progetto
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.map((f, i) => {
          const v = values?.[i];
          return (
            <ItemCard
              key={f._key}
              title={pickLocalized(v?.title, lang) ?? ""}
              subtitle={v ? [v.client, formatPeriod(v.start, v.end), v.visible ? "" : "nascosto"].filter(Boolean).join(", ") : ""}
              hasError={!!formState.errors.projects?.[i]}
              defaultOpen={!v?.title?.it}
              actions={
                <IconAction label="Elimina" danger onClick={() => remove(i)}>
                  <Trash className="size-4" />
                </IconAction>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name={`projects.${i}.title`} label="Titolo" className="sm:col-span-2" localized />
                <TextField name={`projects.${i}.client`} label="Cliente" />
                <TextField name={`projects.${i}.via`} label="Tramite" />
                <TextField name={`projects.${i}.company`} label="Azienda" />
                <TextField name={`projects.${i}.category`} label="Categoria" placeholder="Back-end, AI e agenti…" localized />
                <PeriodFields start={`projects.${i}.start`} end={`projects.${i}.end`} />
                <TextField name={`projects.${i}.role`} label="Ruolo" localized />
                <TextArea name={`projects.${i}.summary`} label="Sintesi (scheda)" rows={2} className="sm:col-span-2" localized />
                <TextArea name={`projects.${i}.description`} label="Descrizione (dettaglio)" rows={4} className="sm:col-span-2" localized />
                <LinesField name={`projects.${i}.responsibilities`} label="Cosa ho fatto" className="sm:col-span-2" localized />
                <TagField name={`projects.${i}.stack`} label="Stack" className="sm:col-span-2" />
                <TextField name={`projects.${i}.url`} label="Link" placeholder="https://…" className="sm:col-span-2" />
              </div>
              <div className="flex gap-6">
                <SwitchField name={`projects.${i}.visible`} label="Visibile" />
                <SwitchField name={`projects.${i}.featured`} label="In evidenza" />
              </div>
            </ItemCard>
          );
        })}
      </div>
    </Panel>
  );
}

/* ───────────── Competenze ───────────── */

export function SkillsTab() {
  const { control, register, formState } = useFormContext<CvSource>();
  const { fields, append, remove } = useFieldArray({ control, name: "skills", keyName: "_key" });
  const values = useWatch({ control, name: "skills" });

  return (
    <Panel
      title="Competenze"
      lead="Il nome deve corrispondere alle tecnologie degli incarichi (o a un alias) per far funzionare i filtri. Es. «Java» copre «Java 8» e «Java 21»."
    >
      {SKILL_CATEGORIES.map((c) => {
        const rows = fields.map((f, i) => ({ f, i })).filter(({ i }) => values?.[i]?.category === c.id);
        return (
          <div key={c.id} className="rounded-xl border border-line bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <h3 className="font-display font-medium">{c.label}</h3>
              <Button size="sm" variant="quiet" onClick={() => append(newSkill(c.id))}>
                <Plus className="size-3.5" /> Competenza
              </Button>
            </div>
            <ul className="divide-y divide-line">
              {rows.map(({ f, i }) => (
                <li key={f._key} className="grid items-center gap-3 px-4 py-2.5 lg:grid-cols-[1fr_9rem_auto_1fr_auto_auto]">
                  <input
                    {...register(`skills.${i}.name`)}
                    aria-label="Nome"
                    placeholder="Nome"
                    aria-invalid={!!formState.errors.skills?.[i]?.name}
                    className={inputClass}
                  />
                  <select {...register(`skills.${i}.category`)} aria-label="Categoria" className={inputClass}>
                    {SKILL_CATEGORIES.map((o) => (
                      <option key={o.id} value={o.id} className="bg-night-2">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <LevelField name={`skills.${i}.level`} />
                  <TagField name={`skills.${i}.aliases`} label="Alias" hint=" " placeholder="Alias" className="[&>label]:sr-only" />
                  <SwitchField name={`skills.${i}.visible`} label="Visibile" />
                  <IconAction label="Elimina" danger onClick={() => remove(i)}>
                    <Trash className="size-4" />
                  </IconAction>
                </li>
              ))}
              {rows.length === 0 ? <li className="px-4 py-3 text-sm text-faint">Nessuna competenza in questa categoria.</li> : null}
            </ul>
          </div>
        );
      })}
      <TagField name="softSkills" label="Soft skill" placeholder="Es. Problem solving" localized />
    </Panel>
  );
}

/* ───────────── Formazione, certificazioni, lingue ───────────── */

export function EducationTab() {
  const { control, register } = useFormContext<CvSource>();
  const lang = useEditLang();
  const edu = useFieldArray({ control, name: "education", keyName: "_key" });
  const certs = useFieldArray({ control, name: "certifications", keyName: "_key" });
  const langs = useFieldArray({ control, name: "languages", keyName: "_key" });
  const eduValues = useWatch({ control, name: "education" });
  const certValues = useWatch({ control, name: "certifications" });

  return (
    <div className="space-y-12">
      <Panel
        title="Formazione"
        action={
          <Button size="sm" variant="ghost" onClick={() => edu.prepend(newEducation())}>
            <Plus className="size-3.5" /> Aggiungi
          </Button>
        }
      >
        <div className="space-y-3">
          {edu.fields.map((f, i) => (
            <ItemCard
              key={f._key}
              title={pickLocalized(eduValues?.[i]?.title, lang) ?? ""}
              subtitle={eduValues?.[i]?.institution}
              actions={
                <IconAction label="Elimina" danger onClick={() => edu.remove(i)}>
                  <Trash className="size-4" />
                </IconAction>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name={`education.${i}.title`} label="Titolo" localized />
                <TextField name={`education.${i}.institution`} label="Istituto" />
                <TextField name={`education.${i}.location`} label="Sede" localized />
                <PeriodFields start={`education.${i}.start`} end={`education.${i}.end`} />
                <TextArea name={`education.${i}.description`} label="Descrizione" rows={2} className="sm:col-span-2" localized />
              </div>
              <SwitchField name={`education.${i}.visible`} label="Visibile" />
            </ItemCard>
          ))}
        </div>
      </Panel>

      <Panel
        title="Certificazioni"
        lead="Compaiono nel PDF quando ce n'è almeno una."
        action={
          <Button size="sm" variant="ghost" onClick={() => certs.append(newCertification())}>
            <Plus className="size-3.5" /> Aggiungi
          </Button>
        }
      >
        {certs.fields.length === 0 ? <p className="text-sm text-faint">Nessuna certificazione inserita.</p> : null}
        <div className="space-y-3">
          {certs.fields.map((f, i) => (
            <ItemCard
              key={f._key}
              title={certValues?.[i]?.name ?? ""}
              subtitle={certValues?.[i]?.issuer}
              defaultOpen={!certValues?.[i]?.name}
              actions={
                <IconAction label="Elimina" danger onClick={() => certs.remove(i)}>
                  <Trash className="size-4" />
                </IconAction>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name={`certifications.${i}.name`} label="Nome" />
                <TextField name={`certifications.${i}.issuer`} label="Ente" />
                <TextField name={`certifications.${i}.date`} label="Data" type="month" />
                <TextField name={`certifications.${i}.url`} label="Link verifica" placeholder="https://…" />
              </div>
            </ItemCard>
          ))}
        </div>
      </Panel>

      <Panel
        title="Lingue"
        lead={lang === "it" ? undefined : "Stai modificando i nomi in inglese (es. Italian, Native)."}
        action={
          <Button size="sm" variant="ghost" onClick={() => langs.append(newLanguage())}>
            <Plus className="size-3.5" /> Aggiungi
          </Button>
        }
      >
        <ul className="space-y-2">
          {langs.fields.map((f, i) => (
            <li key={f._key} className="flex items-center gap-2">
              <input key={`name-${lang}`} {...register(`languages.${i}.name.${lang}`)} aria-label="Lingua" placeholder="Lingua" className={inputClass} />
              <input key={`level-${lang}`} {...register(`languages.${i}.level.${lang}`)} aria-label="Livello" placeholder="Livello (es. B2)" className={inputClass} />
              <IconAction label="Elimina" danger onClick={() => langs.remove(i)}>
                <Trash className="size-4" />
              </IconAction>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
