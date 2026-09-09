"use client";

import { Star } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ContentCard from "@/components/content/ContentCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import type { ContentType } from "@/types/content";

const SECTIONS: { type: ContentType; label: string }[] = [
  { type: "news", label: "News" },
  { type: "movie", label: "Movies" },
  { type: "social", label: "Social" },
];

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="max-w-2xl text-sm text-muted">
          Content you favorite from your feed is saved here, grouped by
          news, movies, and social posts.
        </p>
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Tap the heart on any card in your feed to save it here."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-muted">
        {favorites.length} saved {favorites.length === 1 ? "item" : "items"},
        grouped by type.
      </p>

      {SECTIONS.map(({ type, label }) => {
        const items = favorites.filter((item) => item.type === type);
        if (items.length === 0) return null;

        return (
          <div key={type} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">{label}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  isFavorited
                  onToggleFavorite={() => dispatch(toggleFavorite(item))}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
