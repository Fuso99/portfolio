"use client";

import { Download, ExternalLink, FileText, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buttonClass } from "@/components/ui/primitives";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Cv } from "@/lib/schema";

/**
 * Builds the CV PDF in the browser (see src/pdf/client.ts: the static site has
 * no server) and shows it in a dialog, with download and new-tab links. Where
 * the browser can't show a PDF inside the page (most phones), it opens the PDF
 * directly instead.
 */
export function CvPreviewButton({
  cv,
  lang,
  className,
  iconClassName = "size-4",
  children,
}: {
  cv: Cv;
  lang: Locale;
  className?: string;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  const t = getDictionary(lang).cvPreview;
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<{ url: string; filename: string } | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (file && d && !d.open) d.showModal();
  }, [file]);

  // Free the blob when the dialog closes or the component unmounts.
  useEffect(() => () => void (file && URL.revokeObjectURL(file.url)), [file]);

  async function onClick() {
    const inline = canShowPdfInline();
    // Open the tab now, while the click still counts: after the await a popup blocker would stop it.
    const tab = inline ? null : window.open("", "_blank");
    setBusy(true);
    try {
      const { renderCvPdf } = await import("@/pdf/client");
      const { blob, filename } = await renderCvPdf(cv, [], lang);
      const url = URL.createObjectURL(blob);
      if (inline) return setFile({ url, filename });
      if (tab) tab.location.href = url;
      else Object.assign(document.createElement("a"), { href: url, download: filename }).click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error(err);
      tab?.close();
      toast.error(t.error);
    } finally {
      setBusy(false);
    }
  }

  const close = () => ref.current?.close();
  const Icon = busy ? LoaderCircle : FileText;

  return (
    <>
      <button type="button" onClick={onClick} disabled={busy} aria-busy={busy} aria-label={t.open} className={className}>
        <Icon className={busy ? `${iconClassName} animate-spin` : iconClassName} aria-hidden />
        {busy ? <span className="sr-only">{t.generating}</span> : null}
        {children}
      </button>

      <dialog
        ref={ref}
        onClose={() => setFile(null)}
        onClick={(e) => e.target === ref.current && close()}
        aria-labelledby="cv-preview-title"
        className="m-auto h-[min(92vh,64rem)] w-[min(60rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line-strong bg-night-2 p-0 text-ink backdrop:bg-black/60"
      >
        {file ? (
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 id="cv-preview-title" className="font-medium">
                {t.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <a href={file.url} target="_blank" rel="noopener" className={buttonClass("quiet", "sm")}>
                  <ExternalLink className="size-3.5" aria-hidden /> {t.newTab}
                </a>
                <a href={file.url} download={file.filename} className={buttonClass("primary", "sm")}>
                  <Download className="size-3.5" aria-hidden /> {t.download}
                </a>
                <button type="button" onClick={close} className={buttonClass("quiet", "sm", "size-9 px-0")} aria-label={t.close}>
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <iframe src={file.url} title={t.title} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        ) : null}
      </dialog>
    </>
  );
}

/** Desktop browsers with a built-in PDF viewer. Phones get the PDF in its own tab. */
function canShowPdfInline() {
  const viewer = (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled ?? true;
  return viewer && !window.matchMedia("(pointer: coarse)").matches;
}
