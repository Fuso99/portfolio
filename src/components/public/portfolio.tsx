"use client";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Cv } from "@/lib/schema";
import { fullName } from "@/lib/utils";
import { PortfolioProvider } from "./context";
import { Contact } from "./contact";
import { Hero } from "./hero";
import { Projects } from "./projects";
import { SkillMatrix } from "./skill-matrix";
import { Timeline } from "./timeline";

/**
 * Every public section, driven only by `cv`. The admin live preview renders
 * this same tree with the unsaved draft. Layout uses container queries so it
 * adapts to the preview pane as well as to the viewport.
 */
export function PortfolioSections({ cv, lang, preview = false }: { cv: Cv; lang: Locale; preview?: boolean }) {
  const t = getDictionary(lang);
  const updated = new Date(cv.meta.updatedAt);
  return (
    <PortfolioProvider cv={cv} lang={lang} preview={preview}>
      <div className="@container">
        <main className="mx-auto max-w-6xl px-5 @3xl:px-8">
          <Hero />
          <Timeline />
          <SkillMatrix />
          <Projects />
          <Contact />
        </main>
        <footer className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-line px-5 py-10 text-sm text-faint @3xl:flex-row @3xl:justify-between @3xl:px-8">
          <span>
            © {updated.getUTCFullYear()} {fullName(cv)}
          </span>
          <span>
            {t.footer.updated(updated.toLocaleDateString(t.meta.dateLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }))}
          </span>
        </footer>
      </div>
    </PortfolioProvider>
  );
}
