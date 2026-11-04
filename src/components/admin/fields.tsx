"use client";

import { ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useFormContext, useWatch, type FieldPath } from "react-hook-form";
import type { CvSource } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { useEditLang } from "./edit-lang";

export const inputClass =
  "h-10 w-full rounded-lg border border-line bg-night/70 px-3 text-sm text-ink placeholder:text-faint transition-colors focus:border-ion/60 focus:outline-none aria-[invalid=true]:border-danger/70";

type Name = FieldPath<CvSource>;

/**
 * For a translatable field (`{ it, en }`), the path of the language being
 * edited, plus the Italian text to show as a hint while translating.
 */
function useLocalizedName(name: Name, localized?: boolean) {
  const lang = useEditLang();
  const { control } = useFormContext<CvSource>();
  const source = useWatch({ control, name: `${name}.it` as Name, disabled: !localized || lang === "it" });
  if (!localized) return { path: name, lang: null, source: undefined };
  return { path: `${name}.${lang}` as Name, lang, source: lang === "it" ? undefined : source };
}

function sourceText(v: unknown) {
  return Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : "";
}

function getError(errors: unknown, name: string): string | undefined {
  let cur: unknown = errors;
  for (const part of name.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  const msg = (cur as { message?: unknown } | undefined)?.message;
  return typeof msg === "string" ? msg : undefined;
}

export function useFieldError(name: string) {
  const {
    formState: { errors },
  } = useFormContext<CvSource>();
  return getError(errors, name);
}

export function Field({
  label,
  hint,
  error,
  className,
  htmlFor,
  lang,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  htmlFor?: string;
  /** Set on translatable fields: shows which language is being edited. */
  lang?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-2 text-[13px] text-muted">
        {label}
        {lang ? <LangBadge lang={lang} /> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function LangBadge({ lang }: { lang: string }) {
  return (
    <span
      className={cn(
        "rounded px-1 font-mono text-[10px] leading-4 uppercase",
        lang === "it" ? "bg-white/[0.06] text-faint" : "bg-signal/15 text-signal",
      )}
    >
      {lang}
    </span>
  );
}

/** Under an English field: the Italian text it translates. */
function SourceHint({ text }: { text: string }) {
  return (
    <p className="mt-1 line-clamp-2 text-xs text-faint">
      <span className="text-muted">IT:</span> {text || "vuoto"}
    </p>
  );
}

export function TextField({
  name,
  label,
  hint,
  className,
  localized,
  ...props
}: { name: Name; label: string; hint?: string; className?: string; localized?: boolean } & Omit<React.ComponentProps<"input">, "name">) {
  const { register } = useFormContext<CvSource>();
  const { path, lang, source } = useLocalizedName(name, localized);
  const error = useFieldError(path);
  const id = useId();
  return (
    <Field label={label} hint={source === undefined ? hint : undefined} error={error} className={className} htmlFor={id} lang={lang}>
      {/* key: uncontrolled inputs keep their DOM text when the name changes; remount per language. */}
      <input key={path} id={id} {...register(path)} aria-invalid={!!error} className={inputClass} {...props} />
      {source !== undefined ? <SourceHint text={sourceText(source)} /> : null}
    </Field>
  );
}

export function TextArea({
  name,
  label,
  hint,
  rows = 3,
  className,
  localized,
}: {
  name: Name;
  label: string;
  hint?: string;
  rows?: number;
  className?: string;
  localized?: boolean;
}) {
  const { register } = useFormContext<CvSource>();
  const { path, lang, source } = useLocalizedName(name, localized);
  const error = useFieldError(path);
  const id = useId();
  return (
    <Field label={label} hint={source === undefined ? hint : undefined} error={error} className={className} htmlFor={id} lang={lang}>
      <textarea key={path} id={id} rows={rows} {...register(path)} aria-invalid={!!error} className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")} />
      {source !== undefined ? <SourceHint text={sourceText(source)} /> : null}
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  className,
}: {
  name: Name;
  label: string;
  options: readonly { id: string; label: string }[];
  className?: string;
}) {
  const { register } = useFormContext<CvSource>();
  const id = useId();
  return (
    <Field label={label} className={className} htmlFor={id}>
      <div className="relative">
        <select id={id} {...register(name)} className={cn(inputClass, "appearance-none pr-9")}>
          {options.map((o) => (
            <option key={o.id} value={o.id} className="bg-night-2">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
      </div>
    </Field>
  );
}

/** Start + end month, with an "in corso" toggle that stores end as "". */
export function PeriodFields({ start, end, className }: { start: Name; end: Name; className?: string }) {
  const { register, control } = useFormContext<CvSource>();
  const startError = useFieldError(start);
  const endError = useFieldError(end);
  const ids = [useId(), useId()];
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <Field label="Inizio" error={startError} htmlFor={ids[0]}>
        <input id={ids[0]} type="month" {...register(start)} aria-invalid={!!startError} className={inputClass} />
      </Field>
      <Controller
        control={control}
        name={end}
        render={({ field }) => {
          const ongoing = field.value === "";
          return (
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor={ids[1]} className="text-[13px] text-muted">
                  Fine
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={ongoing}
                    onChange={(e) => field.onChange(e.target.checked ? "" : new Date().toISOString().slice(0, 7))}
                    className="accent-[var(--color-ion)]"
                  />
                  In corso
                </label>
              </div>
              {ongoing ? (
                <div id={ids[1]} className={cn(inputClass, "flex items-center text-muted")}>
                  Oggi
                </div>
              ) : (
                <input
                  id={ids[1]}
                  type="month"
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  aria-invalid={!!endError}
                  className={inputClass}
                />
              )}
              {endError ? <p className="mt-1 text-xs text-danger">{endError}</p> : null}
            </div>
          );
        }}
      />
    </div>
  );
}

/** string[] editor: type and press Enter (or comma) to add a tag. */
export function TagField({
  name,
  label,
  hint,
  placeholder,
  className,
  localized,
}: {
  name: Name;
  label: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  localized?: boolean;
}) {
  const { control } = useFormContext<CvSource>();
  const { path, lang, source } = useLocalizedName(name, localized);
  const [draft, setDraft] = useState("");
  const id = useId();
  return (
    <Controller
      control={control}
      name={path}
      render={({ field }) => {
        const tags = (field.value as string[] | undefined) ?? [];
        const add = (raw: string) => {
          const items = raw.split(",").map((s) => s.trim()).filter((s) => s && !tags.includes(s));
          if (items.length) field.onChange([...tags, ...items]);
          setDraft("");
        };
        return (
          <Field
            label={label}
            hint={source !== undefined ? `IT: ${sourceText(source) || "vuoto"}` : (hint ?? "Invio o virgola per aggiungere")}
            className={className}
            htmlFor={id}
            lang={lang}
          >
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-night/70 px-2 py-1.5 focus-within:border-ion/60">
              {tags.map((t, i) => (
                <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-ion/15 py-0.5 pr-1 pl-2 text-xs text-ink">
                  {t}
                  <button
                    type="button"
                    aria-label={`Rimuovi ${t}`}
                    onClick={() => field.onChange(tags.filter((_, j) => j !== i))}
                    className="rounded p-0.5 text-muted hover:bg-white/10 hover:text-ink"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id={id}
                value={draft}
                placeholder={tags.length ? "" : placeholder}
                onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add(draft);
                  } else if (e.key === "Backspace" && !draft && tags.length) {
                    field.onChange(tags.slice(0, -1));
                  }
                }}
                onBlur={() => {
                  if (draft) add(draft);
                  field.onBlur();
                }}
                className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-faint focus:outline-none"
              />
            </div>
          </Field>
        );
      }}
    />
  );
}

/** string[] edited as one item per line. */
export function LinesField({
  name,
  label,
  hint,
  rows = 4,
  className,
  localized,
}: {
  name: Name;
  label: string;
  hint?: string;
  rows?: number;
  className?: string;
  localized?: boolean;
}) {
  const { control } = useFormContext<CvSource>();
  const { path, lang, source } = useLocalizedName(name, localized);
  const id = useId();
  return (
    <Controller
      control={control}
      name={path}
      render={({ field }) => (
        <Field label={label} hint={source === undefined ? (hint ?? "Una voce per riga") : undefined} className={className} htmlFor={id} lang={lang}>
          <LinesInput key={path} id={id} value={(field.value as string[]) ?? []} onChange={field.onChange} rows={rows} />
          {source !== undefined ? <SourceHint text={(source as string[] | undefined)?.join("; ") ?? ""} /> : null}
        </Field>
      )}
    />
  );
}

function LinesInput({ id, value, onChange, rows }: { id: string; value: string[]; onChange: (v: string[]) => void; rows: number }) {
  // Keep the raw text locally so blank lines survive while typing; resync
  // only when the form value changes from outside (reset, import).
  const parse = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
  const [text, setText] = useState(value.join("\n"));
  if (parse(text).join("\n") !== value.join("\n")) setText(value.join("\n"));
  return (
    <textarea
      id={id}
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parse(e.target.value));
      }}
      className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
    />
  );
}

export function SwitchField({ name, label }: { name: Name; label: string }) {
  const { control } = useFormContext<CvSource>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label={label} />}
    />
  );
}

export function Switch({ checked, onChange, label, hideLabel }: { checked: boolean; onChange: (v: boolean) => void; label: string; hideLabel?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink"
    >
      <span className={cn("relative h-5 w-9 rounded-full border transition-colors", checked ? "border-ion/60 bg-ion/40" : "border-line-strong bg-white/5")}>
        <span className={cn("absolute top-0.5 size-3.5 rounded-full bg-ink transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      {hideLabel ? null : label}
    </button>
  );
}

export function LevelField({ name }: { name: Name }) {
  const { control } = useFormContext<CvSource>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex gap-1" role="radiogroup" aria-label="Livello">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={field.value === n}
              aria-label={`Livello ${n}`}
              onClick={() => field.onChange(n)}
              className={cn(
                "h-7 w-5 rounded-md border transition-colors",
                n <= (field.value as number) ? "border-ion/60 bg-ion/50" : "border-line bg-white/[0.03] hover:border-line-strong",
              )}
            />
          ))}
        </div>
      )}
    />
  );
}

/** Collapsible card used for list items in the editor. */
export function ItemCard({
  title,
  subtitle,
  actions,
  defaultOpen = false,
  hasError,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-xl border bg-white/[0.02]", hasError ? "border-danger/50" : "border-line")}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ChevronDown className={cn("size-4 shrink-0 text-faint transition-transform", !open && "-rotate-90")} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">{title || "Senza titolo"}</span>
            {subtitle ? <span className="block truncate text-xs text-faint">{subtitle}</span> : null}
          </span>
        </button>
        {actions}
      </div>
      {open ? <div className="space-y-4 border-t border-line p-4">{children}</div> : null}
    </div>
  );
}
