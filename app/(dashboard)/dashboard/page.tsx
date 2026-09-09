"use client";

import ContentCard from "@/components/content/ContentCard";
import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { useFeed } from "@/hooks/useFeed";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) =>
    new Set(state.favorites.items.map((item) => item.id)),
  );
  const feed = useFeed();

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Your personalized feed, built from the interests and movie genres you
        picked in Settings. Nothing selected yet? You&apos;re seeing a sensible
        default until you do.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feed.items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isFavorited={favoriteIds.has(item.id)}
              onToggleFavorite={() => dispatch(toggleFavorite(item))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
