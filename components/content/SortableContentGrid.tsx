"use client";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ContentCard from "@/components/content/ContentCard";
import type { ContentItem } from "@/types/content";

type SortableContentGridProps = {
  items: ContentItem[];
  favoriteIds: Set<string>;
  onToggleFavorite: (item: ContentItem) => void;
  onReorder: (newItems: ContentItem[]) => void;
};

export default function SortableContentGrid({
  items,
  favoriteIds,
  onToggleFavorite,
  onReorder,
}: SortableContentGridProps) {
  const sensors = useSensors(
    // A small movement threshold before drag "activates" — otherwise a
    // plain click on the favorite button or CTA link would be swallowed
    // as a drag attempt.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <SortableCard
              key={item.id}
              item={item}
              index={index}
              isFavorited={favoriteIds.has(item.id)}
              onToggleFavorite={() => onToggleFavorite(item)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({
  item,
  index,
  isFavorited,
  onToggleFavorite,
}: {
  item: ContentItem;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "manipulation",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <ContentCard
        item={item}
        index={index}
        isFavorited={isFavorited}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
