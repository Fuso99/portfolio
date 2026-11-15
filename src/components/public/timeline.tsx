"use client";

import { motion } from "framer-motion";
import { Building2, ChevronDown } from "lucide-react";
import { SectionHeading, Tag } from "@/components/ui/primitives";
import { cn, formatDuration, formatPeriod } from "@/lib/utils";
import { usePortfolio, useNowMonth } from "./context";

export function Timeline() {
  const { cv, lang, t } = usePortfolio();
  const now = useNowMonth();
  const firstYear = cv.experiences.at(-1)?.start.slice(0, 4);

  return (
    <section id="esperienza" className="py-24">
      <SectionHeading
        title={t.timeline.title}
        lead={t.timeline.lead(firstYear ?? "")}
      />

      <div className="relative">
        <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-ion/60 via-line-strong to-transparent" />
        <ol className="space-y-14">
          {cv.experiences.map((x) => (
            <motion.li
              key={x.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative pl-10"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-night bg-ion",
                  !x.end && "bg-signal shadow-[0_0_14px_var(--color-signal)]",
                )}
              />
              <header id={`exp-${x.id}`} className="flex scroll-mt-32 flex-col gap-1 rounded-lg @3xl:flex-row @3xl:items-baseline @3xl:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{x.company}</h3>
                  <p className="mt-1 text-muted">
                    {x.role}
                    {x.location ? <span className="text-faint">, {x.location}</span> : null}
                  </p>
                </div>
                <p className="text-sm text-faint tabular-nums">
                  {formatPeriod(x.start, x.end, lang)}
                  <span className="ml-2 text-muted">({formatDuration(x.start, x.end, now, lang)})</span>
                </p>
              </header>

              <ul className="mt-6 grid gap-4">
                {x.engagements.map((e) => (
                  <li key={e.id} id={`eng-${e.id}`} className="glass scroll-mt-32 rounded-xl p-5 @3xl:p-6">
                    <div className="flex flex-col gap-1 @2xl:flex-row @2xl:items-baseline @2xl:justify-between">
                      <h4 className="flex items-center gap-2 font-display text-lg font-medium">
                        <Building2 className="size-4 text-ion" aria-hidden />
                        {e.client}
                        {e.via ? <span className="text-sm font-normal text-faint">{t.via(e.via)}</span> : null}
                      </h4>
                      <span className="text-sm text-faint tabular-nums">{formatPeriod(e.start, e.end, lang)}</span>
                    </div>
                    {e.summary ? <p className="mt-3 max-w-3xl leading-relaxed text-muted">{e.summary}</p> : null}
                    {e.highlights.length ? (
                      <details className="group mt-4 rounded-lg border border-line">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-ion hover:text-ink focus-visible:outline-2 focus-visible:outline-ion [&::-webkit-details-marker]:hidden">
                          {t.timeline.details}
                          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <dl className="grid gap-x-8 gap-y-3 px-4 pt-1 pb-4 @3xl:grid-cols-2">
                          {e.highlights.map((h, i) => (
                            <div key={i} className="border-l border-ion/30 pl-3">
                              {h.title ? <dt className="text-sm font-medium text-ink">{h.title}</dt> : null}
                              <dd className="text-sm leading-relaxed text-muted">{h.text}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    ) : null}
                    {e.tech.length ? (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {e.tech.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
