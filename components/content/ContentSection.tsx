import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ContentCard from "@/components/content/ContentCard";
import { SkeletonGrid } from "@/components/content/SkeletonCard";
import type { ContentItem } from "@/types/content";

type ContentSectionProps = {
  title: string;
  isLoading: boolean;
  error: unknown;
  items: ContentItem[];
  onRetry: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (item: ContentItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function ContentSection({
  title,
  isLoading,
  error,
  items,
  onRetry,
  favoriteIds,
  onToggleFavorite,
  emptyTitle = "Nothing here right now",
  emptyDescription,
}: ContentSectionProps) {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>

      {isLoading && <SkeletonGrid count={3} />}

      {!isLoading && hasError && (
        <ErrorState message="Couldn't load this section." onRetry={onRetry} />
      )}

      {!isLoading && !hasError && items.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!isLoading && !hasError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              index={index}
              isFavorited={favoriteIds.has(item.id)}
              onToggleFavorite={() => onToggleFavorite(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
