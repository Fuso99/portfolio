"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonClass, SectionHeading, Tag } from "@/components/ui/primitives";
import type { Project } from "@/lib/schema";
import { cn, formatPeriod, projectMatches, techMatchesSkill } from "@/lib/utils";
import { usePortfolio } from "./context";
import { TiltCard } from "./tilt-card";

export function Projects() {
  const { cv, selected } = usePortfolio();
  const [open, setOpen] = useState<Project | null>(null);
  const selectedSkills = cv.skills.filter((s) => selected.includes(s.id));

  if (cv.projects.length === 0) return null;

  return (
    <section id="progetti" className="py-24">
      <SectionHeading
        title="Progetti"
        lead="I lavori più significativi per i clienti. Apri una scheda per vedere ruolo, responsabilità e stack."
      >
        {selectedSkills.length ? (
          <p className="text-sm text-muted">In evidenza i progetti con le competenze selezionate.</p>
        ) : null}
      </SectionHeading>

      <ul className="grid grid-flow-row-dense auto-rows-fr gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {cv.projects.map((p) => {
          const dim = selectedSkills.length > 0 && !projectMatches(p, selectedSkills);
          return (
            <li key={p.id} className={cn("transition-opacity duration-300", p.featured && "@5xl:col-span-2", dim && "opacity-35")}>
              <TiltCard className="rounded-2xl" max={p.featured ? 4 : 7}>
                <button
                  type="button"
                  onClick={() => setOpen(p)}
                  className={cn(
                    "glass relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-6 text-left transition-[border-color] hover:border-ion/40",
                    p.featured && "@3xl:p-8",
                  )}
                >
                  {p.featured ? (
                    <span aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-ion/20 blur-3xl" />
                  ) : null}
                  <span className="flex items-center justify-between gap-3 text-sm text-faint">
                    <span className="text-ion">{p.category}</span>
                    <span className="tabular-nums">{formatPeriod(p.start, p.end)}</span>
                  </span>
                  <span
                    className={cn(
                      "mt-5 block font-display font-semibold tracking-tight text-ink",
                      p.featured ? "text-3xl @3xl:text-4xl" : "text-xl",
                    )}
                  >
                    {p.title}
                  </span>
                  <span className={cn("mt-3 block leading-relaxed text-muted", p.featured && "max-w-xl text-lg")}>{p.summary}</span>
                  <span className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <span className="flex flex-wrap gap-1.5">
                      {p.stack.slice(0, p.featured ? 7 : 4).map((t) => (
                        <Tag key={t} highlight={selectedSkills.some((s) => techMatchesSkill(t, s))}>
                          {t}
                        </Tag>
                      ))}
                      {p.stack.length > (p.featured ? 7 : 4) ? <Tag>+{p.stack.length - (p.featured ? 7 : 4)}</Tag> : null}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-ion/50 group-hover:text-ink">
                      <ArrowUpRight className="size-4" aria-hidden />
                      <span className="sr-only">Apri i dettagli di {p.title}</span>
                    </span>
                  </span>
                </button>
              </TiltCard>
            </li>
          );
        })}
      </ul>

      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) d.showModal();
    if (!project && d.open) d.close();
  }, [project]);

  const meta = project
    ? [
        ["Cliente", project.client],
        ["Tramite", project.via],
        ["Azienda", project.company],
        ["Periodo", formatPeriod(project.start, project.end)],
        ["Ruolo", project.role],
      ].filter(([, v]) => v)
    : [];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="project-title"
      className="m-auto max-h-[88vh] w-[min(46rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink"
    >
      <AnimatePresence>
        {project ? (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative max-h-[88vh] overflow-y-auto rounded-2xl border border-line-strong bg-night-2/95 p-7 shadow-[0_40px_120px_-30px_rgb(91_86_232/0.6)] backdrop-blur-xl @container"
          >
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-ion to-transparent" />
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-ion">{project.category}</p>
                <h3 id="project-title" className="mt-2 text-3xl font-semibold tracking-tight">
                  {project.title}
                </h3>
              </div>
              <button type="button" onClick={onClose} className={buttonClass("quiet", "sm", "size-9 px-0")} aria-label="Chiudi">
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-line p-4 text-sm @lg:grid-cols-3">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-faint">{k}</dt>
                  <dd className="mt-0.5 text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {project.description ? <p className="mt-6 leading-relaxed text-muted">{project.description}</p> : null}

            {project.responsibilities.length ? (
              <>
                <h4 className="mt-7 font-display text-lg font-medium">Cosa ho fatto</h4>
                <ul className="mt-3 space-y-2">
                  {project.responsibilities.map((r) => (
                    <li key={r} className="flex gap-3 text-muted">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-signal" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {project.stack.length ? (
              <>
                <h4 className="mt-7 font-display text-lg font-medium">Stack</h4>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </>
            ) : null}

            {project.url ? (
              <a href={project.url} target="_blank" rel="noreferrer" className={buttonClass("primary", "md", "mt-8")}>
                Apri il progetto <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
