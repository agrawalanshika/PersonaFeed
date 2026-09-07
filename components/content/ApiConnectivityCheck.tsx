"use client";

import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import ContentCard from "@/components/content/ContentCard";
import { useGetTopHeadlinesQuery } from "@/services/newsApi";
import { useGetTrendingMoviesQuery } from "@/services/tmdbApi";
import { useGetTrendingSocialPostsQuery } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import type { ContentItem } from "@/types/content";

/**
 * TEMPORARY — proves the full pipeline works: raw API response →
 * normalize*() → ContentItem → ContentCard. Replaced by the real
 * personalized feed (Phase 8) and trending UI (Phase 11).
 */
export default function ApiConnectivityCheck() {
  const news = useGetTopHeadlinesQuery();
  const movies = useGetTrendingMoviesQuery();
  const social = useGetTrendingSocialPostsQuery();

  const newsItem = news.data ? normalizeNews(news.data.articles)[0] : undefined;
  const movieItem = movies.data
    ? normalizeMovie(movies.data.results)[0]
    : undefined;
  const socialItem = social.data ? normalizeSocial(social.data)[0] : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Phase 6-7 check — removed in Phase 8/11
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ApiCheckSlot
          label="News API"
          isLoading={news.isLoading}
          error={news.error}
          item={newsItem}
          onRetry={news.refetch}
        />
        <ApiCheckSlot
          label="TMDB"
          isLoading={movies.isLoading}
          error={movies.error}
          item={movieItem}
          onRetry={movies.refetch}
        />
        <ApiCheckSlot
          label="Reddit"
          isLoading={social.isLoading}
          error={social.error}
          item={socialItem}
          onRetry={social.refetch}
        />
      </div>
    </div>
  );
}

function ApiCheckSlot({
  label,
  isLoading,
  error,
  item,
  onRetry,
}: {
  label: string;
  isLoading: boolean;
  error: unknown;
  item?: ContentItem;
  onRetry: () => void;
}) {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      {isLoading && <Spinner size={14} label="Checking..." />}
      {!isLoading && hasError && (
        <ErrorState message={describeError(error)} onRetry={onRetry} />
      )}
      {!isLoading && !hasError && item && <ContentCard item={item} />}
      {!isLoading && !hasError && !item && (
        <span className="text-sm text-muted">No results returned.</span>
      )}
    </div>
  );
}

function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { error?: string; detail?: string } })
      .data;
    if (data?.error) {
      return data.detail ? `${data.error} — ${data.detail}` : data.error;
    }
  }
  return "Request failed.";
}
