"use client";

import { createContext, use, useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Cv } from "@/lib/schema";
import { toMonth } from "@/lib/utils";

type Selection = {
  cv: Cv;
  preview: boolean;
  selected: string[];
  toggle: (skillId: string) => void;
  clear: () => void;
};

const PortfolioContext = createContext<Selection | null>(null);

export function PortfolioProvider({ cv, preview = false, children }: { cv: Cv; preview?: boolean; children: React.ReactNode }) {
  const [selectedRaw, setSelected] = useState<string[]>([]);
  // Drop ids of skills that no longer exist (relevant in the admin live preview).
  const selected = useMemo(() => selectedRaw.filter((id) => cv.skills.some((s) => s.id === id)), [selectedRaw, cv.skills]);
  const toggle = useCallback(
    (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    [],
  );
  const clear = useCallback(() => setSelected([]), []);
  const value = useMemo(() => ({ cv, preview, selected, toggle, clear }), [cv, preview, selected, toggle, clear]);
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
