"use client";

import Spinner from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import { useGetTopHeadlinesQuery } from "@/services/newsApi";
import { useGetTrendingMoviesQuery } from "@/services/tmdbApi";
import { useGetTrendingSocialPostsQuery } from "@/services/socialApi";

/**
 * TEMPORARY — proves each Phase 6 API adapter returns real, usable data.
 * Replaced by the actual trending UI in Phase 11.
 */
export default function ApiConnectivityCheck() {
  const news = useGetTopHeadlinesQuery();
  const movies = useGetTrendingMoviesQuery();
  const social = useGetTrendingSocialPostsQuery();

  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Phase 6 check — removed in Phase 11
      </p>

      <ApiCheckRow
        label="News API"
        isLoading={news.isLoading}
        error={news.error}
        sample={news.data?.articles?.[0]?.title}
        onRetry={news.refetch}
      />
      <ApiCheckRow
        label="TMDB"
        isLoading={movies.isLoading}
        error={movies.error}
        sample={movies.data?.results?.[0]?.title}
        onRetry={movies.refetch}
      />
      <ApiCheckRow
        label="Mock social"
        isLoading={social.isLoading}
        error={social.error}
        sample={social.data?.[0]?.content}
        onRetry={social.refetch}
      />
    </div>
  );
}

function ApiCheckRow({
  label,
  isLoading,
  error,
  sample,
  onRetry,
}: {
  label: string;
  isLoading: boolean;
  error: unknown;
  sample?: string;
  onRetry: () => void;
}) {
  const hasError = Boolean(error);

  return (
    <div className="text-sm">
      <span className="font-medium">{label}: </span>
      {isLoading && <Spinner size={14} label="Checking..." />}
      {!isLoading && hasError && (
        <ErrorState message={describeError(error)} onRetry={onRetry} />
      )}
      {!isLoading && !hasError && (
        <span className="text-muted">{sample ?? "No results returned."}</span>
      )}
    </div>
  );
}

function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return "Request failed.";
}
