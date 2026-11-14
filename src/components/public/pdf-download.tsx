"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Cv } from "@/lib/schema";

/**
 * Builds the CV PDF in the browser (see src/pdf/client.ts): the static site
 * has no server. react-pdf and the templates are fetched on the first click.
 */
export function PdfDownloadButton({
  cv,
  lang,
  skills = [],
  className,
  iconClassName = "size-4",
  disabled,
  children,
}: {
  cv: Cv;
  lang: Locale;
  skills?: string[];
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const t = getDictionary(lang).cvExplorer;

  async function onClick() {
    setBusy(true);
    try {
      const { downloadCvPdf } = await import("@/pdf/client");
      await downloadCvPdf(cv, skills, lang);
    } catch (err) {
      console.error(err);
      toast.error(t.pdfError);
    } finally {
      setBusy(false);
    }
  }

  const Icon = busy ? LoaderCircle : Download;
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} aria-busy={busy} className={className}>
      <Icon className={busy ? `${iconClassName} animate-spin` : iconClassName} aria-hidden />
      {busy ? <span className="sr-only">{t.generating}</span> : null}
      {children}
    </button>
  );
}
