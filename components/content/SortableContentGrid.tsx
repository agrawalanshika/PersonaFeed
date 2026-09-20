
"use client";

import { useEffect, useState } from "react";

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
import { CheckCircle, EyeOff } from "lucide-react";

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
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(
    new Set(),
  );

  const [feedback, setFeedback] = useState<string | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Automatically hide feedback after 1.5 seconds
  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function showFeedback(message: string) {
    setFeedback(message);
  }

  const visibleItems = items.filter(
    (item) => !hiddenIds.has(item.id),
  );

  const hiddenItems = items.filter((item) =>
    hiddenIds.has(item.id),
  );

  const displayedItems = [
    ...visibleItems,
    ...hiddenItems,
  ];

  function handleHide(id: string) {
    setHiddenIds((previous) => {
      const updated = new Set(previous);
      updated.add(id);
      return updated;
    });
  }

  function handleUnhide(id: string) {
    setHiddenIds((previous) => {
      const updated = new Set(previous);
      updated.delete(id);
      return updated;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = displayedItems.findIndex(
      (item) => item.id === active.id,
    );

    const newIndex = displayedItems.findIndex(
      (item) => item.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(displayedItems, oldIndex, newIndex));
  }

  return (
    <div className="relative">
      {/* Feedback Notification */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-md border border-border bg-accent-soft px-4 py-3 text-sm font-medium text-accent shadow-sm"
        >
          <CheckCircle size={16} aria-hidden="true" />
          {feedback}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayedItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {/* Normal Feed */}
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <SortableCard
                key={item.id}
                item={item}
                index={index}
                isFavorited={favoriteIds.has(item.id)}
                isHidden={false}
                onToggleFavorite={() =>
                  onToggleFavorite(item)
                }
                onHide={handleHide}
                onUnhide={handleUnhide}
                onFeedback={showFeedback}
              />
            ))}
          </div>

          {/* Hidden Posts Section */}
          {hiddenItems.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <EyeOff
                  size={18}
                  className="text-muted"
                  aria-hidden="true"
                />

                <h2 className="text-lg font-semibold text-foreground">
                  Hidden posts ({hiddenItems.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-4 opacity-75 sm:grid-cols-2 lg:grid-cols-3">
                {hiddenItems.map((item, index) => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    index={index}
                    isFavorited={favoriteIds.has(item.id)}
                    isHidden={true}
                    onToggleFavorite={() =>
                      onToggleFavorite(item)
                    }
                    onHide={handleHide}
                    onUnhide={handleUnhide}
                    onFeedback={showFeedback}
                  />
                ))}
              </div>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCard({
  item,
  index,
  isFavorited,
  isHidden,
  onToggleFavorite,
  onHide,
  onUnhide,
  onFeedback,
}: {
  item: ContentItem;
  index: number;
  isFavorited: boolean;
  isHidden: boolean;
  onToggleFavorite: () => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onFeedback: (message: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

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
      className="h-full cursor-grab active:cursor-grabbing"
    >
      <ContentCard
        item={item}
        index={index}
        isFavorited={isFavorited}
        isHidden={isHidden}
        onToggleFavorite={onToggleFavorite}
        onHide={onHide}
        onUnhide={onUnhide}
        onFeedback={onFeedback}
      />
    </div>
  );
}