"use client";

import { Check, Download, Eye, FileBraces, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/primitives";
import { cvSchema, normalizeCv, PDF_TEMPLATES, type CvSource, type PdfTemplate } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Panel } from "./content-tabs";
import { useEditLang } from "./edit-lang";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DataTab() {
  const { getValues, reset, control } = useFormContext<CvSource>();
  const lang = useEditLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfBusy, setPdfBusy] = useState<PdfTemplate | null>(null);

  function exportDraft() {
    const blob = new Blob([JSON.stringify(getValues(), null, 2)], { type: "application/json" });
    downloadBlob(blob, `cv-data-${new Date().toISOString().slice(0, 10)}.json`);
  }

  async function importFile(file: File) {
    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      return toast.error("File non importato", { description: `${file.name} non contiene JSON valido.` });
    }
    const parsed = cvSchema.safeParse(normalizeCv(json));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return toast.error("File non importato", {
        description: `Struttura non valida in «${first.path.join(".")}»: ${first.message}`,
      });
    }
    // keepDefaultValues: the import stays "unsaved" until the user saves.
    reset(parsed.data, { keepDefaultValues: true });
    toast.success("File importato", { description: "Controlla l'anteprima, poi salva per pubblicarlo." });
  }

  async function draftPdf(template: PdfTemplate) {
    setPdfBusy(template);
    const res = await fetch(`/api/admin/pdf?template=${template}&lang=${lang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getValues()),
    }).catch(() => null);
    setPdfBusy(null);
    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      return toast.error("PDF non generato", { description: data?.error ?? "Correggi i campi non validi e riprova." });
    }
    downloadBlob(await res.blob(), `cv-bozza-${template}-${lang}.pdf`);
  }

  return (
    <div className="space-y-12">
      <Panel title="Esporta" lead="Il JSON è la fonte unica dei dati: tienine una copia o spostalo su un altro server.">
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={exportDraft}>
            <FileBraces className="size-4" /> Esporta JSON con le modifiche correnti
          </Button>
          <a href="/api/admin/cv?download=1" className={buttonClass("quiet")}>
            <Download className="size-4" /> Scarica la versione pubblicata
          </a>
        </div>
      </Panel>

      <Panel title="Importa" lead="Carica un cv-data.json: sostituisce i dati nell'editor, ma nulla cambia sul sito finché non salvi.">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Scegli un file JSON
        </Button>
      </Panel>

      <Panel
        title="PDF del CV"
        lead={`Il modello usato per il CV che i visitatori scaricano dal sito, in italiano o in inglese. La scelta diventa effettiva quando salvi. L'anteprima esce in ${lang === "it" ? "italiano" : "inglese"}, la lingua scelta in alto.`}
      >
        <Controller
          control={control}
          name="settings.pdfTemplate"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Modello del PDF" className="grid gap-3 sm:grid-cols-3">
              {PDF_TEMPLATES.map((t) => {
                const on = field.value === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex flex-col rounded-xl border p-4 transition-colors",
                      on ? "border-ion/60 bg-ion/10" : "border-line bg-white/[0.02] hover:border-line-strong",
                    )}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => field.onChange(t.id)}
                      className="flex flex-1 flex-col text-left"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-medium text-ink">{t.label}</span>
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full border",
                            on ? "border-ion bg-ion text-night" : "border-line-strong",
                          )}
                          aria-hidden
                        >
                          {on ? <Check className="size-3" /> : null}
                        </span>
                      </span>
                      <span className="mt-2 text-[13px] leading-relaxed text-muted">{t.description}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => draftPdf(t.id)}
                      disabled={pdfBusy !== null}
                      className={buttonClass("quiet", "sm", "mt-4 self-start px-2")}
                    >
                      {pdfBusy === t.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
                      Anteprima
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        />
        <div className="flex flex-wrap gap-1">
          <a href="/api/cv/pdf?lang=it" className={buttonClass("quiet")}>
            <Download className="size-4" /> PDF pubblicato in italiano
          </a>
          <a href="/api/cv/pdf?lang=en" className={buttonClass("quiet")}>
            <Download className="size-4" /> PDF pubblicato in inglese
          </a>
        </div>
      </Panel>
    </div>
  );
}
