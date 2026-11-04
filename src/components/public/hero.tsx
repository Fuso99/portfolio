"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { usePortfolio } from "./context";
import { StatusBadge } from "./status-badge";
import { TracePanel } from "./trace-panel";
import { Typewriter } from "./typewriter";

export function Hero() {
  const { cv, t } = usePortfolio();
  const p = cv.profile;
  const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`;

  return (
    <section id="top" className="relative pt-32 pb-24 @3xl:pt-40">
      <div className="grid items-center gap-14 @5xl:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Avatar initials={initials} src={p.avatarUrl} name={`${p.firstName} ${p.lastName}`} />
            <StatusBadge status={p.status} fallback={t.status[p.status.state]} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 text-[clamp(3rem,9cqi,6.25rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-ink [text-shadow:0_0_60px_rgb(154_150_255/0.25)]"
          >
            <span className="block">{p.firstName}</span>
            <span className="block">{p.lastName}</span>
          </motion.h1>

          <p className="mt-6 h-8 font-display text-xl text-ink/90 @3xl:text-2xl">
            <Typewriter words={p.roles.length ? p.roles : [p.title]} />
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted text-balance-pretty"
          >
            {p.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#progetti" className={buttonClass("primary")}>
              {t.hero.seeProjects}
              <ArrowDownRight className="size-4" aria-hidden />
            </a>
            <a href="#contatti" className={buttonClass("ghost")}>
              {t.hero.writeMe}
            </a>
            <div className="ml-1 flex items-center gap-1">
              {p.linkedin ? (
                <a href={p.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={buttonClass("quiet", "md", "w-11 px-0")}>
                  <LinkedinIcon className="size-[17px]" />
                </a>
              ) : null}
              {p.github ? (
                <a href={p.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={buttonClass("quiet", "md", "w-11 px-0")}>
                  <GithubIcon className="size-[17px]" />
                </a>
              ) : null}
              {p.email ? (
                <a href={`mailto:${p.email}`} aria-label="Email" className={buttonClass("quiet", "md", "w-11 px-0")}>
                  <Mail className="size-[18px]" />
                </a>
              ) : null}
            </div>
          </motion.div>

          {p.location ? (
            <p className="mt-8 flex items-center gap-2 text-sm text-faint">
              <MapPin className="size-4" aria-hidden />
              {p.location}
            </p>
          ) : null}
        </div>

        <TracePanel />
      </div>
    </section>
  );
}

function Avatar({ initials, src, name }: { initials: string; src: string; name: string }) {
  return (
    <div className="relative size-16 shrink-0">
      <div className="absolute -inset-1 rounded-full bg-[conic-gradient(from_140deg,var(--color-ion),var(--color-signal),var(--color-flare),var(--color-ion))] opacity-70 blur-md" />
      <div
        className={cn(
          "relative grid size-16 place-items-center overflow-hidden rounded-full border border-white/15 bg-night-2",
          "font-display text-xl font-semibold tracking-tight text-ink",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar may be any external URL set from the admin
          <img src={src} alt={name} className="size-full object-cover" />
        ) : (
          <span aria-label={name}>{initials}</span>
        )}
      </div>
    </div>
  );
}
