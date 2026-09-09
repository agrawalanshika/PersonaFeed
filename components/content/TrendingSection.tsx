import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ContentCard from "@/components/content/ContentCard";
import type { ContentItem } from "@/types/content";

type TrendingSectionProps = {
  title: string;
  isLoading: boolean;
  error: unknown;
  items: ContentItem[];
  onRetry: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (item: ContentItem) => void;
};

export default function TrendingSection({
  title,
  isLoading,
  error,
  items,
  onRetry,
  favoriteIds,
  onToggleFavorite,
}: TrendingSectionProps) {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner label="Loading..." />
        </div>
      )}

      {!isLoading && hasError && (
        <ErrorState message="Couldn't load this section." onRetry={onRetry} />
      )}

      {!isLoading && !hasError && items.length === 0 && (
        <EmptyState title="Nothing trending right now" />
      )}

      {!isLoading && !hasError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isFavorited={favoriteIds.has(item.id)}
              onToggleFavorite={() => onToggleFavorite(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
