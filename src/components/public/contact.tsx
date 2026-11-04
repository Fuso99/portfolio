"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, LoaderCircle, Mail, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LinkedinIcon } from "@/components/ui/brand-icons";
import { Button, SectionHeading } from "@/components/ui/primitives";
import { contactSchema, type ContactInput } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { usePortfolio } from "./context";

const field =
  "w-full rounded-xl border border-line bg-night/60 px-4 text-sm text-ink placeholder:text-faint transition-colors focus:border-ion/60 focus:outline-none aria-[invalid=true]:border-danger/70";

export function Contact() {
  const { cv, preview } = usePortfolio();
  const p = cv.profile;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  async function onSubmit(values: ContactInput) {
    if (preview) return;
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    if (!res) {
      toast.error("Messaggio non inviato", { description: "Connessione assente. Controlla la rete e riprova." });
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error("Messaggio non inviato", { description: data.error ?? "Riprova tra qualche minuto." });
      return;
    }
    toast.success("Messaggio inviato", { description: `Grazie ${values.name.split(" ")[0]}, ti rispondo appena possibile.` });
    reset();
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(p.email);
      toast.success("Email copiata", { description: p.email });
    } catch {
      toast.error("Copia non riuscita", { description: "Seleziona l'indirizzo e copialo a mano." });
    }
  }

  return (
    <section id="contatti" className="py-24">
      <SectionHeading title="Contatti" lead="Per proposte, collaborazioni o domande su un progetto. Rispondo di solito entro un paio di giorni." />

      <div className="grid gap-6 @4xl:grid-cols-[0.8fr_1.2fr]">
        <ul className="space-y-2">
          {p.email ? (
            <li className="glass flex items-center gap-4 rounded-xl p-4">
              <Mail className="size-5 text-ion" aria-hidden />
              <a href={`mailto:${p.email}`} className="min-w-0 flex-1 truncate text-ink hover:text-ion">
                {p.email}
              </a>
              <button type="button" onClick={copyEmail} aria-label="Copia l'email" className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink">
                <Copy className="size-4" />
              </button>
            </li>
          ) : null}
          {p.linkedin ? (
            <li className="glass flex items-center gap-4 rounded-xl p-4">
              <LinkedinIcon className="size-5 text-ion" />
              <a href={p.linkedin} target="_blank" rel="noreferrer" className="truncate text-ink hover:text-ion">
                {p.linkedin.replace(/^https?:\/\/(www\.|it\.)?/, "")}
              </a>
            </li>
          ) : null}
          {p.location ? (
            <li className="flex items-center gap-4 p-4 text-muted">
              <MapPin className="size-5 text-faint" aria-hidden />
              {p.location}
            </li>
          ) : null}
        </ul>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="glass grid gap-4 rounded-2xl p-6 @3xl:grid-cols-2">
          <Field label="Nome" error={errors.name?.message}>
            <input {...register("name")} autoComplete="name" aria-invalid={!!errors.name} className={cn(field, "h-11")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input {...register("email")} type="email" autoComplete="email" aria-invalid={!!errors.email} className={cn(field, "h-11")} />
          </Field>
          <Field label="Oggetto" optional className="@3xl:col-span-2" error={errors.subject?.message}>
            <input {...register("subject")} className={cn(field, "h-11")} />
          </Field>
          <Field label="Messaggio" className="@3xl:col-span-2" error={errors.message?.message}>
            <textarea {...register("message")} rows={5} aria-invalid={!!errors.message} className={cn(field, "resize-y py-3")} />
          </Field>
          <div aria-hidden className="absolute -left-[9999px]">
            <label>
              Lascia vuoto
              <input {...register("website")} tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="flex items-center justify-end @3xl:col-span-2">
            <Button type="submit" disabled={isSubmitting || preview}>
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {isSubmitting ? "Invio in corso" : "Invia messaggio"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-sm text-muted">
        {label}
        {optional ? <span className="text-xs text-faint">facoltativo</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
