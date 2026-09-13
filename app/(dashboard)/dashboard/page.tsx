"use client";

import SortableContentGrid from "@/components/content/SortableContentGrid";
import PaginationFooter from "@/components/content/PaginationFooter";
import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { setFeedItems } from "@/store/slices/feedSlice";
import { useFeed } from "@/hooks/useFeed";
import { usePaginatedItems } from "@/hooks/usePaginatedItems";
import { saveFeedOrder } from "@/lib/storage";
import type { ContentItem } from "@/types/content";

const PAGE_SIZE = 9;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) =>
    new Set(state.favorites.items.map((item) => item.id)),
  );
  const feed = useFeed();
  const { visibleItems, hasMore, loadMore } = usePaginatedItems(
    feed.items,
    PAGE_SIZE,
  );

  // Two-tier pagination: first reveal more of what's already fetched
  // (instant, no network call); once that's exhausted, actually fetch the
  // next page from News API/TMDB and reveal that too — genuine infinite
  // scroll rather than paginating through one fixed batch.
  const handleLoadMore = async () => {
    if (hasMore) {
      loadMore();
      return;
    }
    if (feed.canLoadMore) {
      await feed.loadMoreFeed();
      loadMore();
    }
  };

  // Drag-and-drop only reorders what's currently visible/paginated — the
  // reordered slice gets spliced back in front of whatever hasn't been
  // revealed yet, and the full resulting order is persisted.
  const handleReorder = (reorderedVisible: ContentItem[]) => {
    const rest = feed.items.slice(visibleItems.length);
    const newItems = [...reorderedVisible, ...rest];
    dispatch(setFeedItems(newItems));
    saveFeedOrder(newItems.map((item) => item.id));
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Your personalized feed, built from the interests and movie genres you
        picked in Settings. Nothing selected yet? You&apos;re seeing a sensible
        default until you do. Drag any card to reorder your feed —
        it&apos;ll stick around next time you visit.
      </p>

      {feed.status === "loading" && (
        <div className="flex justify-center py-16">
          <Spinner label="Building your feed..." />
        </div>
      )}

      {feed.status === "failed" && (
        <ErrorState message={feed.error ?? "Couldn't load your feed."} />
      )}

      {feed.status === "succeeded" && feed.items.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          description="Try picking a few interests in Settings to fill your feed."
        />
      )}

      {feed.status === "succeeded" && feed.items.length > 0 && (
        <>
          <SortableContentGrid
            items={visibleItems}
            favoriteIds={favoriteIds}
            onToggleFavorite={(item) => dispatch(toggleFavorite(item))}
            onReorder={handleReorder}
          />
          <PaginationFooter
            hasMore={hasMore || feed.canLoadMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={feed.isLoadingMore}
            showEndNote={feed.items.length > PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
