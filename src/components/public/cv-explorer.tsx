"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { buttonClass, Chip, SectionHeading, Tag } from "@/components/ui/primitives";
import { SKILL_CATEGORIES } from "@/lib/schema";
import { filterCvBySkills, formatPeriod, fullName, techMatchesSkill } from "@/lib/utils";
import { usePortfolio } from "./context";
import { PdfDownloadButton } from "./pdf-download";
import { PdfPreviewButton } from "./pdf-preview";

export function CvExplorer() {
  const { cv, selected, toggle, clear, preview, lang, t } = usePortfolio();
  const [query, setQuery] = useState("");

  const { cv: filtered, selected: selectedSkills } = useMemo(() => filterCvBySkills(cv, selected), [cv, selected]);
  const q = query.trim().toLowerCase();
  const engagementCount = cv.experiences.reduce((a, x) => a + x.engagements.length, 0);
  const matchCount = filtered.experiences.reduce((a, x) => a + x.engagements.length, 0);

  return (
    <section id="cv" className="py-24">
      <SectionHeading
        title={t.cvExplorer.title}
        lead={t.cvExplorer.lead}
      />

      <div className="grid gap-6 @4xl:grid-cols-[1fr_1.15fr]">
        <div className="glass rounded-2xl p-5">
          <label className="relative block">
            <span className="sr-only">{t.cvExplorer.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.cvExplorer.placeholder}
              className="h-11 w-full rounded-xl border border-line bg-night/60 pr-4 pl-10 text-sm text-ink placeholder:text-faint focus:border-ion/50 focus:outline-none"
            />
          </label>

          <div className="mt-5 space-y-4">
            {SKILL_CATEGORIES.map((c) => {
              const skills = cv.skills.filter((s) => s.category === c.id && (!q || s.name.toLowerCase().includes(q)));
              if (!skills.length) return null;
              return (
                <div key={c.id}>
                  <p className="mb-2 text-xs text-faint">{t.skillCategories[c.id]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <Chip key={s.id} active={selected.includes(s.id)} onClick={() => toggle(s.id)}>
                        {s.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <PdfDownloadButton cv={cv} lang={lang} skills={selected} disabled={preview} className={buttonClass("primary", "md")}>
              {selected.length ? t.cvExplorer.downloadFiltered : t.cvExplorer.download}
            </PdfDownloadButton>
            <PdfPreviewButton cv={cv} lang={lang} skills={selected} disabled={preview} className={buttonClass("ghost", "md")} />
            {selected.length ? (
              <button type="button" onClick={clear} className={buttonClass("quiet")}>
                <X className="size-4" aria-hidden /> {t.cvExplorer.clear}
              </button>
            ) : null}
          </div>
        </div>

        <div className="glass relative overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <span className="flex items-center gap-2 text-sm text-ink">
              <FileText className="size-4 text-ion" aria-hidden />
              {fullName(cv)}, {cv.profile.title}
            </span>
            <span className="text-xs text-faint tabular-nums" aria-live="polite">
              {selected.length ? t.cvExplorer.matchCount(matchCount, engagementCount) : t.cvExplorer.count(engagementCount)}
            </span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto px-5 py-4">
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.experiences.map((x) => (
                <motion.div
                  key={x.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 last:mb-0"
                >
                  <p className="font-display font-medium text-ink">{x.company}</p>
                  <p className="text-xs text-faint">
                    {x.role}, {formatPeriod(x.start, x.end, lang)}
                  </p>
                  <ul className="mt-2 space-y-2 border-l border-line pl-4">
                    {x.engagements.map((e) => (
                      <motion.li key={e.id} layout className="text-sm">
                        <span className="text-ink">{e.client}</span>
                        <span className="ml-2 text-xs text-faint tabular-nums">{formatPeriod(e.start, e.end, lang)}</span>
                        {selectedSkills.length ? (
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {e.tech
                              .filter((t) => selectedSkills.some((s) => techMatchesSkill(t, s)))
                              .map((t) => (
                                <Tag key={t} highlight>
                                  {t}
                                </Tag>
                              ))}
                          </span>
                        ) : null}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.experiences.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">{t.cvExplorer.empty}</p>
            ) : null}

            {selected.length > 0 && filtered.projects.length > 0 ? (
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-xs text-faint">{t.cvExplorer.related}</p>
                <p className="mt-1 text-sm text-muted">{filtered.projects.map((p) => p.title).join(", ")}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
