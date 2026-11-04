"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn, formatDuration, formatPeriod, monthIndex } from "@/lib/utils";
import { usePortfolio, useNowMonth } from "./context";

type Row = {
  key: string;
  target: string;
  depth: 0 | 1;
  last: boolean;
  label: string;
  sub: string;
  start: string;
  end: string;
};

function shortCompany(name: string) {
  return name.split(" - ")[0].replace(/\s+S\.r\.l\.?$/i, "").trim();
}

/**
 * The career rendered as an LLM trace (spans on a time axis), the hero's
 * signature element. Each row jumps to its entry in the timeline.
 */
export function TracePanel() {
  const { cv, preview, lang, t } = usePortfolio();
  const now = useNowMonth();

  const { rows, min, max, years } = useMemo(() => {
    const rows: Row[] = [];
    for (const x of [...cv.experiences].reverse()) {
      rows.push({ key: x.id, target: `exp-${x.id}`, depth: 0, last: false, label: shortCompany(x.company), sub: x.role, start: x.start, end: x.end });
      const engagements = [...x.engagements].reverse();
      engagements.forEach((e, i) =>
        rows.push({
          key: e.id,
          target: `eng-${e.id}`,
          depth: 1,
          last: i === engagements.length - 1,
          label: e.client,
          sub: e.via ? t.via(e.via) : "",
          start: e.start,
          end: e.end,
        }),
      );
    }
    const starts = rows.map((r) => monthIndex(r.start, now)).filter(Number.isFinite);
    const min = starts.length ? Math.min(...starts) : monthIndex(now, now) - 12;
    const max = monthIndex(now, now) + 1;
    const years: number[] = [];
    for (let y = Math.ceil(min / 12); y * 12 <= max; y++) years.push(y);
    return { rows, min, max, years };
  }, [cv.experiences, now, t]);

  const span = Math.max(1, max - min);
  const first = cv.experiences.at(-1);
  const total = first ? formatDuration(first.start, "", now, lang) : "";

  function jump(target: string) {
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.animate([{ boxShadow: "0 0 0 1px rgb(154 150 255 / 0.9), 0 0 32px -4px rgb(154 150 255 / 0.7)" }, { boxShadow: "0 0 0 0 transparent" }], {
      duration: 1600,
      easing: "ease-out",
    });
  }

  return (
    <motion.figure
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass relative overflow-hidden rounded-2xl p-1 shadow-[0_30px_80px_-30px_rgb(91_86_232/0.55)]"
    >
      <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-ion/70 to-transparent" />
      <figcaption className="flex items-center justify-between gap-4 rounded-t-xl border-b border-line px-4 py-3 font-mono text-[12px]">
        <span className="flex items-center gap-2 text-ink">
          <span className="size-2 rounded-full bg-signal shadow-[0_0_10px_var(--color-signal)]" />
          {t.trace.title}
        </span>
        <span className="text-faint">
          {t.trace.summary(rows.length, total)}
        </span>
      </figcaption>

      <div className="px-4 pt-3 pb-4 font-mono text-[12px]">
        <div className="relative ml-[42%] h-5 text-[10.5px] text-faint @xl:ml-[38%]">
          {years.map((y) => (
            <span key={y} className="absolute -translate-x-1/2" style={{ left: `${((y * 12 - min) / span) * 100}%` }}>
              {String(y).slice(2)}
            </span>
          ))}
        </div>

        <ol className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-[42%] @xl:left-[38%]">
            {years.map((y) => (
              <span key={y} className="absolute inset-y-0 w-px bg-white/[0.05]" style={{ left: `${((y * 12 - min) / span) * 100}%` }} />
            ))}
          </div>

          {rows.map((r, i) => {
            const s = monthIndex(r.start, now);
            const e = monthIndex(r.end, now) + 1;
            const left = ((s - min) / span) * 100;
            const width = Math.max(1.2, ((e - s) / span) * 100);
            const live = !r.end;
            return (
              <motion.li
                key={r.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
              >
                <button
                  type="button"
                  onClick={() => jump(r.target)}
                  disabled={preview}
                  title={`${r.label}: ${formatPeriod(r.start, r.end, lang)}`}
                  className="group grid w-full grid-cols-[42%_1fr] items-center rounded-md py-[5px] text-left transition-colors hover:bg-white/[0.04] @xl:grid-cols-[38%_1fr]"
                >
                  <span className={cn("flex min-w-0 items-center gap-1.5 pr-3", r.depth === 0 ? "text-ink" : "text-muted")}>
                    {r.depth === 1 ? <span className="text-faint">{r.last ? "└─" : "├─"}</span> : <span className="text-ion">▸</span>}
                    <span className="truncate group-hover:text-ink">{r.label}</span>
                  </span>
                  <span className="relative h-[14px]">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{ left: `${left}%`, width: `${width}%`, transformOrigin: "left" }}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 rounded-[3px]",
                        r.depth === 0 ? "h-[10px] bg-gradient-to-r from-ion-deep to-ion" : "h-[6px] bg-ion/45",
                        live && "from-ion to-signal shadow-[0_0_14px_-2px_var(--color-signal)]",
                        live && r.depth === 1 && "bg-signal/80",
                      )}
                    />
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-faint">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-sm bg-signal/80" /> {t.trace.ongoing}
          </span>
          <span>{t.trace.hint}</span>
        </div>
      </div>
    </motion.figure>
  );
}
