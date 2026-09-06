"use client";

import ContentCard from "@/components/content/ContentCard";
import { SAMPLE_CONTENT } from "@/lib/sample-content";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) =>
    new Set(state.favorites.items.map((item) => item.id)),
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        This is a preview of the design system on real card layouts. The
        content below is sample data — the personalized feed engine (Phase 8)
        will replace it with live News API, TMDB, and social results. The
        heart button is now wired to real Redux state (Phase 4); persistence
        and the dedicated Favorites view arrive in Phase 10.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_CONTENT.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            isFavorited={favoriteIds.has(item.id)}
            onToggleFavorite={() => dispatch(toggleFavorite(item))}
          />
        ))}
      </div>
    </div>
  );
}
