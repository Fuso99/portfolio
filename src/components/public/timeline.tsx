"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Building2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Chip, SectionHeading, Tag } from "@/components/ui/primitives";
import { cn, formatDuration, formatPeriod } from "@/lib/utils";
import { usePortfolio, useNowMonth } from "./context";

const TECH_PREVIEW = 14;

function techKey(t: string) {
  // Group "Java 8", "Java 11"… under "Java".
  return t.replace(/\s+\d+(\.\d+)?$/, "");
}

export function Timeline() {
  const { cv, lang, t } = usePortfolio();
  const now = useNowMonth();
  const [role, setRole] = useState<string | null>(null);
  const [techs, setTechs] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState(false);

  const roles = useMemo(() => [...new Set(cv.experiences.map((x) => x.role))], [cv.experiences]);
  const techOptions = useMemo(() => {
    const count = new Map<string, number>();
    for (const x of cv.experiences)
      for (const e of x.engagements) for (const t of new Set(e.tech.map(techKey))) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [cv.experiences]);

  const filtered = useMemo(
    () =>
      cv.experiences
        .filter((x) => !role || x.role === role)
        .map((x) => ({
          ...x,
          engagements: x.engagements.filter((e) => techs.length === 0 || e.tech.some((t) => techs.includes(techKey(t)))),
        }))
        .filter((x) => x.engagements.length > 0 || (techs.length === 0 && x.engagements.length === 0)),
    [cv.experiences, role, techs],
  );

  const active = role !== null || techs.length > 0;
  const visibleTech = showAllTech ? techOptions : techOptions.slice(0, TECH_PREVIEW);
  const firstYear = cv.experiences.at(-1)?.start.slice(0, 4);

  function toggleTech(t: string) {
    setTechs((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  return (
    <section id="esperienza" className="py-24">
      <SectionHeading
        title={t.timeline.title}
        lead={t.timeline.lead(firstYear ?? "")}
      />

      <div className="mb-10 space-y-3" role="group" aria-label={t.timeline.filters}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-24 text-sm text-faint">{t.timeline.role}</span>
          <Chip active={role === null} onClick={() => setRole(null)}>
            {t.timeline.all}
          </Chip>
          {roles.map((r) => (
            <Chip key={r} active={role === r} onClick={() => setRole(role === r ? null : r)}>
              {r}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-24 text-sm text-faint">{t.timeline.tech}</span>
          {visibleTech.map((t) => (
            <Chip key={t} active={techs.includes(t)} onClick={() => toggleTech(t)}>
              {t}
            </Chip>
          ))}
          {techOptions.length > TECH_PREVIEW ? (
            <button type="button" onClick={() => setShowAllTech((v) => !v)} className="px-2 text-[13px] text-ion hover:text-ink">
              {showAllTech ? t.timeline.showLess : t.timeline.more(techOptions.length - TECH_PREVIEW)}
            </button>
          ) : null}
        </div>
        <AnimatePresence>
          {active ? (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              type="button"
              onClick={() => {
                setRole(null);
                setTechs([]);
              }}
              className="ml-[6.25rem] inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
            >
              <X className="size-3.5" /> {t.timeline.clear}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="relative">
        <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-ion/60 via-line-strong to-transparent" />
        <motion.ol layout className="space-y-14">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((x) => (
              <motion.li
                key={x.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
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
                  <AnimatePresence initial={false}>
                    {x.engagements.map((e) => (
                      <motion.li
                        key={e.id}
                        id={`eng-${e.id}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass scroll-mt-32 rounded-xl p-5 @3xl:p-6"
                      >
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
                          <dl className="mt-4 grid gap-x-8 gap-y-3 @3xl:grid-cols-2">
                            {e.highlights.map((h, i) => (
                              <div key={i} className="border-l border-ion/30 pl-3">
                                {h.title ? <dt className="text-sm font-medium text-ink">{h.title}</dt> : null}
                                <dd className="text-sm leading-relaxed text-muted">{h.text}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                        {e.tech.length ? (
                          <div className="mt-5 flex flex-wrap gap-1.5">
                            {e.tech.map((t) => (
                              <Tag key={t} highlight={techs.includes(techKey(t))}>
                                {t}
                              </Tag>
                            ))}
                          </div>
                        ) : null}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ol>

        {filtered.length === 0 ? (
          <div className="glass ml-10 rounded-xl p-8 text-muted">
            {t.timeline.empty}
          </div>
        ) : null}
      </div>
    </section>
  );
}
