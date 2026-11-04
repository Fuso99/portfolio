"use client";

import { Download, FileBraces, FileText, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/primitives";
import { cvSchema, type Cv } from "@/lib/schema";
import { Panel } from "./content-tabs";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DataTab() {
  const { getValues, reset } = useFormContext<Cv>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

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
    const parsed = cvSchema.safeParse(json);
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

  async function draftPdf() {
    setPdfBusy(true);
    const res = await fetch("/api/admin/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getValues()),
    }).catch(() => null);
    setPdfBusy(false);
    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      return toast.error("PDF non generato", { description: data?.error ?? "Correggi i campi non validi e riprova." });
    }
    downloadBlob(await res.blob(), "cv-bozza.pdf");
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

      <Panel title="PDF del CV" lead="Rigenera il PDF dalla bozza per controllarlo prima di salvare, o scarica quello che vedono i visitatori.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={draftPdf} disabled={pdfBusy}>
            {pdfBusy ? <LoaderCircle className="size-4 animate-spin" /> : <FileText className="size-4" />}
            Genera PDF dalla bozza
          </Button>
          <a href="/api/cv/pdf" className={buttonClass("quiet")}>
            <Download className="size-4" /> PDF pubblicato
          </a>
        </div>
      </Panel>
    </div>
  );
}
