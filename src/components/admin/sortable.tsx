"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Vertical drag & drop list. Keyboard: focus the handle, Space, arrows, Space. */
export function SortableList<T extends { _key: string }>({
  items,
  onMove,
  renderItem,
  label,
}: {
  items: T[];
  onMove: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  label: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i._key === active.id);
    const to = items.findIndex((i) => i._key === over.id);
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i._key)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5" aria-label={label}>
          {items.map((item, index) => (
            <SortableRow key={item._key} id={item._key}>
              {renderItem(item, index)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-line bg-night-2/80 px-2 py-2",
        isDragging && "relative z-10 border-ion/50 shadow-[0_12px_40px_-10px_rgb(91_86_232/0.7)]",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Trascina per riordinare"
        className="cursor-grab touch-none rounded-md p-1.5 text-faint hover:bg-white/5 hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </li>
  );
}
