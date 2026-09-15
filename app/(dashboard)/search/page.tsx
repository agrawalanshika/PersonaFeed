"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { SkeletonGrid } from "@/components/content/SkeletonCard";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ContentCard from "@/components/content/ContentCard";
import PaginationFooter from "@/components/content/PaginationFooter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePaginatedItems } from "@/hooks/usePaginatedItems";
import { useSearchNewsQuery } from "@/services/newsApi";
import { useSearchMoviesQuery } from "@/services/tmdbApi";
import { useSearchSocialPostsQuery } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import type { ContentType } from "@/types/content";

const PAGE_SIZE = 9;

type Filter = "all" | ContentType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "news", label: "News" },
  { value: "movie", label: "Movies" },
  { value: "social", label: "Social" },
];

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector(
    (state) => new Set(state.favorites.items.map((item) => item.id)),
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedQuery = useDebouncedValue(query.trim(), 400);
  const hasQuery = debouncedQuery.length > 0;

  const wantsNews = filter === "all" || filter === "news";
  const wantsMovies = filter === "all" || filter === "movie";
  const wantsSocial = filter === "all" || filter === "social";

  const news = useSearchNewsQuery(
    { query: debouncedQuery },
    { skip: !hasQuery || !wantsNews },
  );
  const movies = useSearchMoviesQuery(
    { query: debouncedQuery },
    { skip: !hasQuery || !wantsMovies },
  );
  const social = useSearchSocialPostsQuery(
    { query: debouncedQuery },
    { skip: !hasQuery || !wantsSocial },
  );

  const isLoading =
    (wantsNews && news.isLoading) ||
    (wantsMovies && movies.isLoading) ||
    (wantsSocial && social.isLoading);

  const activeSourceCount = [wantsNews, wantsMovies, wantsSocial].filter(
    Boolean,
  ).length;
  const erroredSourceCount = [
    wantsNews && Boolean(news.error),
    wantsMovies && Boolean(movies.error),
    wantsSocial && Boolean(social.error),
  ].filter(Boolean).length;
  // Only block the whole page if every active source failed — one flaky
  // source shouldn't hide results that did come back from the others.
  const allSourcesErrored =
    activeSourceCount > 0 && erroredSourceCount === activeSourceCount;
  const somePartiallyErrored =
    erroredSourceCount > 0 && erroredSourceCount < activeSourceCount;

  const results = useMemo(
    () => [
      ...(wantsNews && news.data ? normalizeNews(news.data.articles) : []),
      ...(wantsMovies && movies.data ? normalizeMovie(movies.data.results) : []),
      ...(wantsSocial && social.data ? normalizeSocial(social.data) : []),
    ],
    [wantsNews, news.data, wantsMovies, movies.data, wantsSocial, social.data],
  );
  const { visibleItems, hasMore, loadMore } = usePaginatedItems(
    results,
    PAGE_SIZE,
  );

  const handleRetry = () => {
    if (wantsNews) news.refetch();
    if (wantsMovies) movies.refetch();
    if (wantsSocial) social.refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Search across news, movies, and social posts at once.
      </p>

      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3">
        <SearchIcon size={18} className="text-muted" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          aria-label="Search"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === option.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted hover:bg-accent-soft/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!hasQuery && (
        <EmptyState
          icon={SearchIcon}
          title="Start typing to search"
          description="Results from news, movies, and social will appear here."
        />
      )}

      {hasQuery && isLoading && <SkeletonGrid count={6} />}

      {hasQuery && !isLoading && allSourcesErrored && (
        <ErrorState message="Something went wrong searching." onRetry={handleRetry} />
      )}

      {hasQuery && !isLoading && !allSourcesErrored && somePartiallyErrored && (
        <p className="text-sm text-muted">
          Some results couldn&apos;t be loaded — showing what did come through.
        </p>
      )}

      {hasQuery && !isLoading && !allSourcesErrored && results.length === 0 && (
        <EmptyState
          title="No results found"
          description={`Nothing matched "${debouncedQuery}". Try a different search.`}
        />
      )}

      {hasQuery && !isLoading && !allSourcesErrored && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <ContentCard
                key={item.id}
                item={item}
                index={index}
                isFavorited={favoriteIds.has(item.id)}
                onToggleFavorite={() => dispatch(toggleFavorite(item))}
              />
            ))}
          </div>
          <PaginationFooter
            hasMore={hasMore}
            onLoadMore={loadMore}
            showEndNote={results.length > PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
