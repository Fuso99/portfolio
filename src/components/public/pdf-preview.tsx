"use client";

import { Download, Eye, ExternalLink, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buttonClass } from "@/components/ui/primitives";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Cv } from "@/lib/schema";

/**
 * Renders the same PDF as the download button and shows it in a dialog, so
 * visitors can read it without saving a file. Built in the browser like the
 * download (see src/pdf/client.ts).
 */
export function PdfPreviewButton({
  cv,
  lang,
  skills = [],
  className,
  disabled,
}: {
  cv: Cv;
  lang: Locale;
  skills?: string[];
  className?: string;
  disabled?: boolean;
}) {
  const t = getDictionary(lang).cvExplorer;
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<{ url: string; filename: string } | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (file && d && !d.open) d.showModal();
  }, [file]);

  // Free the blob when the preview closes or the component unmounts.
  useEffect(() => () => void (file && URL.revokeObjectURL(file.url)), [file]);

  async function onClick() {
    setBusy(true);
    try {
      const { renderCvPdf } = await import("@/pdf/client");
      const { blob, filename } = await renderCvPdf(cv, skills, lang);
      setFile({ url: URL.createObjectURL(blob), filename });
    } catch (err) {
      console.error(err);
      toast.error(t.pdfError);
    } finally {
      setBusy(false);
    }
  }

  const close = () => ref.current?.close();
  const Icon = busy ? LoaderCircle : Eye;

  return (
    <>
      <button type="button" onClick={onClick} disabled={disabled || busy} aria-busy={busy} className={className}>
        <Icon className={busy ? "size-4 animate-spin" : "size-4"} aria-hidden />
        {busy ? <span className="sr-only">{t.generating}</span> : null}
        {t.preview}
      </button>

      <dialog
        ref={ref}
        onClose={() => setFile(null)}
        onClick={(e) => e.target === ref.current && close()}
        aria-labelledby="pdf-preview-title"
        className="m-auto h-[min(92vh,64rem)] w-[min(60rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line-strong bg-night-2 p-0 text-ink backdrop:bg-black/60"
      >
        {file ? (
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 id="pdf-preview-title" className="font-medium">
                {t.previewTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <a href={file.url} target="_blank" rel="noopener" className={buttonClass("quiet", "sm")}>
                  <ExternalLink className="size-3.5" aria-hidden /> {t.previewNewTab}
                </a>
                <a href={file.url} download={file.filename} className={buttonClass("ghost", "sm")}>
                  <Download className="size-3.5" aria-hidden /> {t.previewDownload}
                </a>
                <button type="button" onClick={close} className={buttonClass("quiet", "sm", "size-9 px-0")} aria-label={t.previewClose}>
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <iframe src={file.url} title={t.previewTitle} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
