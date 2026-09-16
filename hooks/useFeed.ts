"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { newsApi } from "@/services/newsApi";
import { tmdbApi } from "@/services/tmdbApi";
import { socialApi } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import { getFeedCategories, getFeedGenres, mergeFeedItems, applySavedOrder } from "@/lib/feed";
import { MOVIE_GENRE_TMDB_IDS } from "@/lib/preferences-options";
import { loadFeedOrder } from "@/lib/storage";
import type { ContentItem } from "@/types/content";
import {
  setFeedItems,
  appendFeedItems,
  setFeedStatus,
  setFeedError,
} from "@/store/slices/feedSlice";

/**
 * Builds the personalized feed from the user's saved preferences:
 *   preferences -> one API call per selection -> normalize -> merge/dedupe/sort
 * Result is stored in feedSlice, which also holds the user's drag-and-drop
 * order (Phase 14) — any saved order is applied on top of a fresh fetch via
 * applySavedOrder() so reordering survives a refresh where possible.
 *
 * Uses Promise.allSettled (not Promise.all) for the underlying fetches —
 * if one selected source fails (say TMDB has a hiccup) while others
 * succeed, the feed still shows what did load instead of a blank error
 * screen. Only shows a full error when every single source failed.
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
  const [reloadToken, setReloadToken] = useState(0);

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
    const hasAnySource = activeCategories.length > 0 || activeGenres.length > 0;

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

      const [newsSettled, movieSettled, socialSettled] = await Promise.all([
        Promise.allSettled(
          activeCategories.map((category) =>
            dispatch(
              newsApi.endpoints.getTopHeadlines.initiate({ category }),
            ).unwrap(),
          ),
        ),
        Promise.allSettled(
          activeGenres.map((genre) =>
            dispatch(
              tmdbApi.endpoints.getMoviesByGenre.initiate({
                genre: String(MOVIE_GENRE_TMDB_IDS[genre] ?? ""),
              }),
            ).unwrap(),
          ),
        ),
        Promise.allSettled(
          activeCategories.map((category) =>
            dispatch(
              socialApi.endpoints.getTrendingSocialPosts.initiate({
                category,
              }),
            ).unwrap(),
          ),
        ),
      ]);

      if (cancelled) return;

      const totalAttempts =
        newsSettled.length + movieSettled.length + socialSettled.length;
      const totalFailed = [...newsSettled, ...movieSettled, ...socialSettled].filter(
        (result) => result.status === "rejected",
      ).length;

      if (hasAnySource && totalAttempts > 0 && totalFailed === totalAttempts) {
        // Every single source failed — this is a genuine outage/offline
        // situation worth surfacing as a real error, not silently empty.
        dispatch(
          setFeedError(
            "Couldn't load your feed. Check your connection and try again.",
          ),
        );
        dispatch(setFeedStatus("failed"));
        return;
      }

      const newsItems: ContentItem[] = [];
      newsSettled.forEach((result, index) => {
        if (result.status === "fulfilled") {
          newsItems.push(
            ...normalizeNews(result.value.articles, activeCategories[index]),
          );
        }
      });
      const movieItems: ContentItem[] = [];
      movieSettled.forEach((result, index) => {
        if (result.status === "fulfilled") {
          movieItems.push(
            ...normalizeMovie(result.value.results, activeGenres[index]),
          );
        }
      });
      const socialItems: ContentItem[] = [];
      socialSettled.forEach((result) => {
        if (result.status === "fulfilled") {
          socialItems.push(...normalizeSocial(result.value));
        }
      });

      const merged = mergeFeedItems([
        ...newsItems,
        ...movieItems,
        ...socialItems,
      ]);
      const ordered = applySavedOrder(merged, loadFeedOrder());

      // Some (not all) sources failed — worth a soft note so a silently
      // empty category (e.g. movies) doesn't look like it was never there.
      if (totalFailed > 0) {
        const failedTypes: string[] = [];
        if (newsSettled.some((r) => r.status === "rejected")) failedTypes.push("news");
        if (movieSettled.some((r) => r.status === "rejected")) failedTypes.push("movies");
        if (socialSettled.some((r) => r.status === "rejected")) failedTypes.push("social");
        dispatch(
          setFeedError(
            `Couldn't load ${failedTypes.join(" or ")} this time — showing what did load.`,
          ),
        );
      }

      dispatch(setFeedItems(ordered));
      dispatch(setFeedStatus("succeeded"));
    }

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, [dispatch, categoriesKey, genresKey, reloadToken]);

  /** Retries the initial load — for when every source failed. */
  function refetchFeed() {
    setReloadToken((token) => token + 1);
  }

  async function loadMoreFeed() {
    if (exhaustedRef.current || isLoadingMore) return;
    setIsLoadingMore(true);

    const activeCategories = categoriesKey ? categoriesKey.split(",") : [];
    const activeGenres = genresKey ? genresKey.split(",") : [];

    const newsSettled = await Promise.allSettled(
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
    const movieSettled = await Promise.allSettled(
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

    const newBatch = mergeFeedItems(
      [...newsSettled, ...movieSettled].flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      ),
    );

    if (newBatch.length === 0) {
      exhaustedRef.current = true;
      setCanLoadMore(false);
    } else {
      dispatch(appendFeedItems(newBatch));
    }

    setIsLoadingMore(false);
  }

  return { ...feed, loadMoreFeed, canLoadMore, isLoadingMore, refetchFeed };
}
