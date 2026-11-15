"use client";

import { createContext, use, useMemo, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Cv } from "@/lib/schema";
import { toMonth } from "@/lib/utils";

type PortfolioValue = {
  cv: Cv;
  lang: Locale;
  t: Dictionary;
  preview: boolean;
};

const PortfolioContext = createContext<PortfolioValue | null>(null);

export function PortfolioProvider({
  cv,
  lang,
  preview = false,
  children,
}: {
  cv: Cv;
  lang: Locale;
  preview?: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ cv, lang, t: getDictionary(lang), preview }), [cv, lang, preview]);
  return <PortfolioContext value={value}>{children}</PortfolioContext>;
}

export function usePortfolio() {
  const ctx = use(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}

const noop = () => () => {};
function currentMonth() {
  return toMonth(new Date().toISOString());
}

/**
 * Current "YYYY-MM". The server snapshot uses the CV's last update so that
 * prerendered HTML is deterministic; the client swaps in the real month.
 */
export function useNowMonth() {
  const { cv } = usePortfolio();
  return useSyncExternalStore(noop, currentMonth, () => toMonth(cv.meta.updatedAt));
}
