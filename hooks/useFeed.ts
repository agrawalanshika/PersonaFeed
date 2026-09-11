"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { newsApi } from "@/services/newsApi";
import { tmdbApi } from "@/services/tmdbApi";
import { socialApi } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import { getFeedCategories, getFeedGenres, mergeFeedItems } from "@/lib/feed";
import { MOVIE_GENRE_TMDB_IDS } from "@/lib/preferences-options";
import {
  setFeedItems,
  appendFeedItems,
  setFeedStatus,
  setFeedError,
} from "@/store/slices/feedSlice";

/**
 * Builds the personalized feed from the user's saved preferences:
 *   preferences -> one API call per selection -> normalize -> merge/dedupe/sort
 * Result is stored in feedSlice (so Phase 14's drag-and-drop ordering has
 * something to reorder) and also returned directly for convenience.
 *
 * Also exposes loadMoreFeed(): genuinely fetches the *next page* from News
 * API and TMDB (both support real pagination) and appends it — this is
 * true infinite scroll, not just revealing an already-fetched batch.
 * Mastodon's public API has no page-number pagination for hashtag
 * timelines, so social content is a one-time pull per load — a documented
 * limitation, not an oversight.
 */
export function useFeed() {
  const dispatch = useAppDispatch();
  const interests = useAppSelector((state) => state.preferences.interests);
  const moviePreferences = useAppSelector(
    (state) => state.preferences.moviePreferences,
  );
  const feed = useAppSelector((state) => state.feed);

  const categories = getFeedCategories(interests);
  const genres = getFeedGenres(moviePreferences);
  // Stable string keys for the effect dependency array — the arrays above
  // are new references every render, but their *contents* only change when
  // preferences actually change.
  const categoriesKey = categories.join(",");
  const genresKey = genres.join(",");

  const preferenceKey = `${categoriesKey}|${genresKey}`;

  const newsPageRef = useRef<Record<string, number>>({});
  const moviePageRef = useRef<Record<string, number>>({});
  const exhaustedRef = useRef(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [prevPreferenceKey, setPrevPreferenceKey] = useState(preferenceKey);

  // Reset the plain state piece during render (React's documented pattern
  // for "adjusting state when a prop changes"). Ref resets happen in the
  // effect below instead — refs can't be mutated during render.
  if (preferenceKey !== prevPreferenceKey) {
    setPrevPreferenceKey(preferenceKey);
    setCanLoadMore(true);
  }

  useEffect(() => {
    let cancelled = false;
    const activeCategories = categoriesKey ? categoriesKey.split(",") : [];
    const activeGenres = genresKey ? genresKey.split(",") : [];

    // Fresh preference set — reset pagination bookkeeping.
    newsPageRef.current = Object.fromEntries(
      activeCategories.map((category) => [category, 1]),
    );
    moviePageRef.current = Object.fromEntries(
      activeGenres.map((genre) => [genre, 1]),
    );
    exhaustedRef.current = false;

    async function loadFeed() {
      dispatch(setFeedStatus("loading"));
      dispatch(setFeedError(null));

      try {
        const newsResults = await Promise.all(
          activeCategories.map((category) =>
            dispatch(
              newsApi.endpoints.getTopHeadlines.initiate({ category }),
            ).unwrap(),
          ),
        );
        const movieResults = await Promise.all(
          activeGenres.map((genre) =>
            dispatch(
              tmdbApi.endpoints.getMoviesByGenre.initiate({
                genre: String(MOVIE_GENRE_TMDB_IDS[genre] ?? ""),
              }),
            ).unwrap(),
          ),
        );
        const socialResults = await Promise.all(
          activeCategories.map((category) =>
            dispatch(
              socialApi.endpoints.getTrendingSocialPosts.initiate({
                category,
              }),
            ).unwrap(),
          ),
        );

        const newsItems = newsResults.flatMap((result, index) =>
          normalizeNews(result.articles, activeCategories[index]),
        );
        const movieItems = movieResults.flatMap((result, index) =>
          normalizeMovie(result.results, activeGenres[index]),
        );
        const socialItems = socialResults.flatMap((result) =>
          normalizeSocial(result),
        );

        const merged = mergeFeedItems([
          ...newsItems,
          ...movieItems,
          ...socialItems,
        ]);

        if (!cancelled) {
          dispatch(setFeedItems(merged));
          dispatch(setFeedStatus("succeeded"));
        }
      } catch (error) {
        if (!cancelled) {
          dispatch(
            setFeedError(
              error instanceof Error ? error.message : "Failed to load feed.",
            ),
          );
          dispatch(setFeedStatus("failed"));
        }
      }
    }

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, [dispatch, categoriesKey, genresKey]);

  async function loadMoreFeed() {
    if (exhaustedRef.current || isLoadingMore) return;
    setIsLoadingMore(true);

    const activeCategories = categoriesKey ? categoriesKey.split(",") : [];
    const activeGenres = genresKey ? genresKey.split(",") : [];

    try {
      const newsBatches = await Promise.all(
        activeCategories.map(async (category) => {
          const nextPage = (newsPageRef.current[category] ?? 1) + 1;
          const result = await dispatch(
            newsApi.endpoints.getTopHeadlines.initiate({
              category,
              page: nextPage,
            }),
          ).unwrap();
          newsPageRef.current[category] = nextPage;
          return normalizeNews(result.articles, category);
        }),
      );
      const movieBatches = await Promise.all(
        activeGenres.map(async (genre) => {
          const nextPage = (moviePageRef.current[genre] ?? 1) + 1;
          const result = await dispatch(
            tmdbApi.endpoints.getMoviesByGenre.initiate({
              genre: String(MOVIE_GENRE_TMDB_IDS[genre] ?? ""),
              page: nextPage,
            }),
          ).unwrap();
          moviePageRef.current[genre] = nextPage;
          return normalizeMovie(result.results, genre);
        }),
      );

      const newBatch = mergeFeedItems(newsBatches.flat().concat(movieBatches.flat()));

      if (newBatch.length === 0) {
        exhaustedRef.current = true;
        setCanLoadMore(false);
      } else {
        dispatch(appendFeedItems(newBatch));
      }
    } catch {
      // A failed "load more" isn't worth surfacing as a full error screen —
      // just stop offering more for this session.
      exhaustedRef.current = true;
      setCanLoadMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return { ...feed, loadMoreFeed, canLoadMore, isLoadingMore };
}
