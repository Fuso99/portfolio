"use client";

import { Eye, EyeOff, Star } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { Cv } from "@/lib/schema";
import { cn, formatPeriod } from "@/lib/utils";
import { Panel, StatusFields } from "./content-tabs";
import { SortableList } from "./sortable";

function ToggleIcon({
  name,
  on,
  off,
  label,
  activeClass,
}: {
  name: `experiences.${number}.visible` | `projects.${number}.visible` | `projects.${number}.featured`;
  on: React.ReactNode;
  off: React.ReactNode;
  label: [string, string];
  activeClass: string;
}) {
  const { control } = useFormContext<Cv>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <button
          type="button"
          aria-pressed={!!field.value}
          aria-label={field.value ? label[0] : label[1]}
          title={field.value ? label[0] : label[1]}
          onClick={() => field.onChange(!field.value)}
          className={cn("rounded-md p-1.5 transition-colors hover:bg-white/5", field.value ? activeClass : "text-faint hover:text-ink")}
        >
          {field.value ? on : off}
        </button>
      )}
    />
  );
}

export function ManagerTab() {
  const { control } = useFormContext<Cv>();
  const exps = useFieldArray({ control, name: "experiences", keyName: "_key" });
  const projects = useFieldArray({ control, name: "projects", keyName: "_key" });
  const expValues = useWatch({ control, name: "experiences" });
  const projectValues = useWatch({ control, name: "projects" });

  return (
    <div className="space-y-12">
      <Panel title="Stato del profilo" lead="Il badge accanto alla tua foto nell'intestazione.">
        <StatusFields />
      </Panel>

      <Panel title="Ordine della timeline" lead="Trascina per riordinare. L'occhio nasconde un'esperienza dal sito e dal PDF senza cancellarla.">
        <SortableList
          label="Esperienze"
          items={exps.fields}
          onMove={exps.move}
          renderItem={(_, i) => {
            const v = expValues?.[i];
            return (
              <>
                <span className={cn("min-w-0 flex-1", !v?.visible && "opacity-50")}>
                  <span className="block truncate text-sm text-ink">{v?.company || "Senza nome"}</span>
                  <span className="block truncate text-xs text-faint">
                    {v?.role}, {v ? formatPeriod(v.start, v.end) : ""}, {v?.engagements.length ?? 0} incarichi
                  </span>
                </span>
                <ToggleIcon
                  name={`experiences.${i}.visible`}
                  on={<Eye className="size-4" />}
                  off={<EyeOff className="size-4" />}
                  label={["Nascondi dal sito", "Mostra sul sito"]}
                  activeClass="text-signal"
                />
              </>
            );
          }}
        />
      </Panel>

      <Panel title="Progetti" lead="Trascina per riordinare. La stella mette la scheda in evidenza con un riquadro più grande.">
        <SortableList
          label="Progetti"
          items={projects.fields}
          onMove={projects.move}
          renderItem={(_, i) => {
            const v = projectValues?.[i];
            return (
              <>
                <span className={cn("min-w-0 flex-1", !v?.visible && "opacity-50")}>
                  <span className="block truncate text-sm text-ink">{v?.title || "Senza titolo"}</span>
                  <span className="block truncate text-xs text-faint">
                    {[v?.client, v?.category].filter(Boolean).join(", ")}
                  </span>
                </span>
                <ToggleIcon
                  name={`projects.${i}.featured`}
                  on={<Star className="size-4 fill-current" />}
                  off={<Star className="size-4" />}
                  label={["Togli dall'evidenza", "Metti in evidenza"]}
                  activeClass="text-[#ffd27a]"
                />
                <ToggleIcon
                  name={`projects.${i}.visible`}
                  on={<Eye className="size-4" />}
                  off={<EyeOff className="size-4" />}
                  label={["Nascondi dal sito", "Mostra sul sito"]}
                  activeClass="text-signal"
                />
              </>
            );
          }}
        />
      </Panel>
    </div>
  );
}
