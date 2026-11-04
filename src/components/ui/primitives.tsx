import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: ClassValue) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background,box-shadow,color,transform] duration-200 select-none",
    "disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
    size === "md" ? "h-11 px-5 text-sm" : "h-8 px-3.5 text-[13px]",
    variant === "primary" &&
      "bg-ion text-night shadow-[0_0_0_1px_rgb(154_150_255/0.6),0_8px_28px_-8px_rgb(154_150_255/0.7)] hover:bg-[#b0adff] hover:shadow-[0_0_0_1px_rgb(176_173_255/0.8),0_10px_34px_-6px_rgb(154_150_255/0.85)]",
    variant === "ghost" && "glass text-ink hover:border-line-strong hover:bg-white/8",
    variant === "quiet" && "text-muted hover:bg-white/6 hover:text-ink",
    variant === "danger" && "text-danger hover:bg-danger/10",
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function Chip({
  active,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
        active
          ? "border-ion/60 bg-ion/15 text-ink shadow-[0_0_16px_-6px_rgb(154_150_255/0.9)]"
          : "border-line bg-white/[0.03] text-muted hover:border-line-strong hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Tag({ highlight, children }: { highlight?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs",
        highlight ? "border-signal/50 bg-signal/10 text-signal" : "border-line bg-white/[0.03] text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-semibold tracking-[-0.03em] text-ink @3xl:text-5xl">{title}</h2>
        {lead ? <p className="mt-3 text-base leading-relaxed text-muted">{lead}</p> : null}
      </div>
      {children}
    </div>
  );
}
