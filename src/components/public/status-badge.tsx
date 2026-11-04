import { STATUS_STATES, type Profile } from "@/lib/schema";
import { cn } from "@/lib/utils";

const tone = {
  open: { dot: "bg-signal", ring: "border-signal/35 bg-signal/10 text-signal" },
  employed: { dot: "bg-ion", ring: "border-ion/35 bg-ion/10 text-[#c9c7ff]" },
  unavailable: { dot: "bg-faint", ring: "border-line-strong bg-white/5 text-muted" },
} as const;

export function StatusBadge({ status }: { status: Profile["status"] }) {
  const t = tone[status.state];
  const label = status.label || STATUS_STATES.find((s) => s.id === status.state)?.label;
  return (
    <span className={cn("inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-sm", t.ring)}>
      <span className="relative flex size-2">
        {status.state !== "unavailable" ? (
          <span className={cn("absolute inline-flex size-full rounded-full opacity-70 animate-ping-slow", t.dot)} />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", t.dot)} />
      </span>
      {label}
    </span>
  );
}
