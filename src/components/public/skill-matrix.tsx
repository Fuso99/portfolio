"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/primitives";
import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/schema";
import { cn, matchesAnySkill } from "@/lib/utils";
import { usePortfolio } from "./context";

export function SkillMatrix() {
  const { cv, selected, t } = usePortfolio();
  const categories = useMemo(
    () =>
      SKILL_CATEGORIES.map((c) => {
        const skills = cv.skills.filter((s) => s.category === c.id);
        const avg = skills.length ? skills.reduce((a, s) => a + s.level, 0) / skills.length : 0;
        return { id: c.id, label: t.skillCategories[c.id], skills, avg };
      }).filter((c) => c.skills.length > 0),
    [cv.skills, t],
  );
  const [active, setActive] = useState<SkillCategory | null>(null);
  const current = categories.find((c) => c.id === active) ?? categories[0];

  /** How many client engagements list each skill. */
  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of cv.skills) {
      m.set(s.id, cv.experiences.flatMap((x) => x.engagements).filter((e) => matchesAnySkill(e.tech, [s])).length);
    }
    return m;
  }, [cv]);

  if (!current) return null;

  return (
    <section id="competenze" className="py-24">
      <SectionHeading
        title={t.skills.title}
        lead={t.skills.lead}
      >
        {selected.length > 0 ? (
          <a href="#cv" className="text-sm text-ion hover:text-ink">
            {t.skills.selected(selected.length)}
          </a>
        ) : null}
      </SectionHeading>

      <div className="grid gap-6 @4xl:grid-cols-[18rem_1fr]">
        <div role="tablist" aria-label={t.skills.categories} className="flex gap-2 overflow-x-auto pb-1 @4xl:flex-col @4xl:overflow-visible">
          {categories.map((c) => {
            const on = c.id === current.id;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setActive(c.id)}
                className={cn(
                  "relative shrink-0 rounded-xl border px-4 py-3 text-left transition-colors",
                  on ? "border-ion/40 text-ink" : "border-transparent text-muted hover:bg-white/[0.03] hover:text-ink",
                )}
              >
                {on ? (
                  <motion.span
                    layoutId="skill-tab"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-ion/15 to-transparent"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <span className="flex items-center justify-between gap-6">
                  <span className="font-medium whitespace-nowrap">{c.label}</span>
                  <span className="text-xs text-faint tabular-nums">{c.skills.length}</span>
                </span>
                <span className="mt-2 hidden h-1 overflow-hidden rounded-full bg-white/[0.06] @4xl:block" aria-hidden>
                  <span className="block h-full rounded-full bg-gradient-to-r from-ion-deep to-ion" style={{ width: `${(c.avg / 5) * 100}%` }} />
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" aria-label={current.label} className="glass min-h-[22rem] rounded-2xl p-3 @3xl:p-4">
          <AnimatePresence mode="wait">
            <motion.ul
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid gap-1 @3xl:grid-cols-2"
            >
              {current.skills.map((s, i) => {
                const on = selected.includes(s.id);
                const used = usage.get(s.id) ?? 0;
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border px-4 py-3.5",
                      on ? "border-signal/40 bg-signal/[0.07]" : "border-transparent",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{s.name}</span>
                      <span className="mt-0.5 block text-xs text-faint">
                        {t.skills.levels[s.level]}
                        {used ? t.skills.usedIn(used) : ""}
                      </span>
                    </span>
                    <span className="flex gap-1" role="img" aria-label={t.skills.levelAria(s.level)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.span
                          key={n}
                          initial={{ scaleY: 0.2, opacity: 0.3 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ delay: i * 0.03 + n * 0.04, duration: 0.25 }}
                          className={cn(
                            "h-4 w-1.5 origin-bottom rounded-full",
                            n <= s.level ? (on ? "bg-signal" : "bg-ion") : "bg-white/10",
                            n <= s.level && n === s.level && "shadow-[0_0_10px_-1px_currentColor]",
                            n <= s.level && (on ? "text-signal" : "text-ion"),
                          )}
                        />
                      ))}
                    </span>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>

      {cv.softSkills.length ? (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-faint">{t.skills.soft}</span>
          {cv.softSkills.map((s) => (
            <span key={s} className="rounded-full border border-line px-3 py-1 text-sm text-muted">
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
