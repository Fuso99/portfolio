"use client";

import { Monitor, Smartphone } from "lucide-react";
import { Component, useDeferredValue, useEffect, useRef, useState } from "react";
import { PortfolioSections } from "@/components/public/portfolio";
import type { Cv } from "@/lib/schema";
import { cn, toPublicCv } from "@/lib/utils";

const DESKTOP = 1280;
const MOBILE = 390;

/**
 * Live preview of the public site, rendered from the unsaved draft. Desktop
 * mode lays the page out at 1280px and zooms it to fit the pane.
 */
export function Preview({ draft, section }: { draft: Cv; section?: string }) {
  const deferred = useDeferredValue(draft);
  const paneRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = useState(640);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPaneWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = device === "desktop" ? DESKTOP : MOBILE;
  const zoom = device === "desktop" ? Math.min(1, paneWidth / DESKTOP) : 1;

  useEffect(() => {
    const box = scrollRef.current;
    const target = section ? box?.querySelector<HTMLElement>(`#${section}`) : null;
    if (!box || !target) return;
    const top = (target.getBoundingClientRect().top - box.getBoundingClientRect().top) + box.scrollTop;
    box.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
  }, [section, device]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="text-sm text-muted">Anteprima live</p>
        <div className="flex rounded-full border border-line p-0.5" role="radiogroup" aria-label="Dispositivo">
          {(
            [
              ["desktop", Monitor, "Desktop"],
              ["mobile", Smartphone, "Mobile"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={device === id}
              aria-label={label}
              onClick={() => setDevice(id)}
              className={cn("rounded-full px-2.5 py-1 transition-colors", device === id ? "bg-white/10 text-ink" : "text-faint hover:text-ink")}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div ref={paneRef} className="min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_top_left,rgb(91_86_232/0.28),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgb(67_227_194/0.1),transparent_50%)]">
          <div className={cn("mx-auto", device === "mobile" && "my-4 overflow-hidden rounded-[28px] border border-line-strong")} style={{ width, zoom }}>
            <PreviewBoundary data={deferred}>
              <PortfolioSections cv={toPublicCv(deferred)} preview />
            </PreviewBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Half-typed drafts can be momentarily invalid; keep the editor alive and retry on the next change. */
class PreviewBoundary extends Component<{ data: unknown; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { data: unknown }) {
    if (prev.data !== this.props.data && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed)
      return <p className="p-10 text-center text-sm text-muted">L&apos;anteprima riprende appena i campi in modifica sono completi.</p>;
    return this.props.children;
  }
}
