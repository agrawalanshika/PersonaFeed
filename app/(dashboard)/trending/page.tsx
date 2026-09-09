"use client";

import TrendingSection from "@/components/content/TrendingSection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { useGetTopHeadlinesQuery } from "@/services/newsApi";
import { useGetTrendingMoviesQuery } from "@/services/tmdbApi";
import { useGetTrendingSocialPostsQuery } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import type { ContentItem } from "@/types/content";

export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector(
    (state) => new Set(state.favorites.items.map((item) => item.id)),
  );

  const news = useGetTopHeadlinesQuery();
  const movies = useGetTrendingMoviesQuery();
  const social = useGetTrendingSocialPostsQuery();

  const handleToggleFavorite = (item: ContentItem) =>
    dispatch(toggleFavorite(item));

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-muted">
        What&apos;s trending right now across news, movies, and social —
        independent of your personal interests in Settings.
      </p>

      <TrendingSection
        title="Trending news"
        isLoading={news.isLoading}
        error={news.error}
        items={news.data ? normalizeNews(news.data.articles) : []}
        onRetry={news.refetch}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      <TrendingSection
        title="Trending movies"
        isLoading={movies.isLoading}
        error={movies.error}
        items={movies.data ? normalizeMovie(movies.data.results) : []}
        onRetry={movies.refetch}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      <TrendingSection
        title="Trending social posts"
        isLoading={social.isLoading}
        error={social.error}
        items={social.data ? normalizeSocial(social.data) : []}
        onRetry={social.refetch}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
