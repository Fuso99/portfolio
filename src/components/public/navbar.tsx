"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/primitives";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

/** Section anchors are the same in both languages, so a switch keeps the reader's place. */
const SECTIONS = [
  { href: "#esperienza", key: "experience" },
  { href: "#competenze", key: "skills" },
  { href: "#progetti", key: "projects" },
  { href: "#cv", key: "cv" },
  { href: "#contatti", key: "contact" },
] as const;

export function Navbar({ initials, lang }: { initials: string; lang: Locale }) {
  const t = getDictionary(lang);
  const other = LOCALES.find((l) => l !== lang) ?? lang;
  const LINKS = SECTIONS.map((s) => ({ href: s.href, label: t.nav[s.key] }));
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = SECTIONS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav
        aria-label={t.nav.label}
        className={cn(
          "flex w-full max-w-3xl items-center gap-2 rounded-full border px-2 py-2 transition-[background,border-color,box-shadow] duration-300",
          scrolled ? "glass border-line-strong shadow-[0_10px_40px_-12px_rgb(0_0_0/0.6)]" : "border-transparent",
        )}
      >
        <a href="#top" className="grid size-9 place-items-center rounded-full bg-white/[0.06] font-display text-sm font-semibold" aria-label={t.nav.top}>
          {initials}
        </a>
        <ul className="mx-auto hidden items-center md:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="relative">
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={cn("relative block rounded-full px-3.5 py-1.5 text-sm transition-colors", active === l.href ? "text-ink" : "text-muted hover:text-ink")}
              >
                {active === l.href ? (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                ) : null}
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`/${other}`}
          hrefLang={other}
          lang={other}
          aria-label={t.meta.switchLabel}
          title={t.meta.switchLabel}
          onClick={(e) => {
            // Remember the choice for "/", and keep the current section.
            document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
            e.currentTarget.href = `/${other}${window.location.hash}`;
          }}
          className={buttonClass("quiet", "sm", "ml-auto px-3 font-mono text-xs md:ml-0")}
        >
          {t.meta.switchTo}
        </a>
        <a href={`/api/cv/pdf?lang=${lang}`} download className={buttonClass("ghost", "sm")}>
          <Download className="size-3.5" aria-hidden /> CV
        </a>
        <button
          type="button"
          className={buttonClass("quiet", "sm", "size-9 px-0 md:hidden")}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass absolute top-16 right-4 left-4 rounded-2xl p-2 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-ink hover:bg-white/5">
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
