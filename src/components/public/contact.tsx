"use client";

import { Copy, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { LinkedinIcon } from "@/components/ui/brand-icons";
import { SectionHeading } from "@/components/ui/primitives";
import { usePortfolio } from "./context";

/** Direct channels only: email (with copy) and LinkedIn. No form, so nothing is stored server-side. */
export function Contact() {
  const { cv, t } = usePortfolio();
  const c = t.contact;
  const p = cv.profile;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(p.email);
      toast.success(c.copied, { description: p.email });
    } catch {
      toast.error(c.copyFailed, { description: c.copyFailedHint });
    }
  }

  return (
    <section id="contatti" className="py-24">
      <SectionHeading title={c.title} lead={c.lead} />

      <ul className="grid gap-3 @3xl:grid-cols-2">
        {p.email ? (
          <li className="glass flex min-w-0 items-center gap-3 rounded-2xl px-4 py-4 @3xl:gap-4 @3xl:p-5">
            <Mail className="size-5 shrink-0 text-ion" aria-hidden />
            <a href={`mailto:${p.email}`} className="min-w-0 flex-1 truncate text-ink hover:text-ion @3xl:text-lg">
              {p.email}
            </a>
            <button type="button" onClick={copyEmail} aria-label={c.copy} title={c.copy} className="-mr-1 rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink">
              <Copy className="size-4" />
            </button>
          </li>
        ) : null}
        {p.linkedin ? (
          <li className="glass flex min-w-0 items-center gap-3 rounded-2xl px-4 py-4 @3xl:gap-4 @3xl:p-5">
            <LinkedinIcon className="size-5 shrink-0 text-ion" />
            <a href={p.linkedin} target="_blank" rel="noreferrer" className="min-w-0 truncate text-ink hover:text-ion @3xl:text-lg">
              {p.linkedin.replace(/^https?:\/\/(www\.|it\.)?/, "")}
            </a>
          </li>
        ) : null}
      </ul>
      {p.location ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-faint">
          <MapPin className="size-4" aria-hidden />
          {p.location}
        </p>
      ) : null}
    </section>
  );
}
