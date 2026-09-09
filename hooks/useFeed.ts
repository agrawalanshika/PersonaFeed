"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { newsApi } from "@/services/newsApi";
import { tmdbApi } from "@/services/tmdbApi";
import { socialApi } from "@/services/socialApi";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import { getFeedCategories, getFeedGenres, mergeFeedItems } from "@/lib/feed";
import { MOVIE_GENRE_TMDB_IDS } from "@/lib/preferences-options";
import { setFeedItems, setFeedStatus, setFeedError } from "@/store/slices/feedSlice";

/**
 * Builds the personalized feed from the user's saved preferences:
 *   preferences -> one API call per selection -> normalize -> merge/dedupe/sort
 * Result is stored in feedSlice (so Phase 14's drag-and-drop ordering has
 * something to reorder) and also returned directly for convenience.
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

  useEffect(() => {
    let cancelled = false;
    const activeCategories = categoriesKey ? categoriesKey.split(",") : [];
    const activeGenres = genresKey ? genresKey.split(",") : [];

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

  return feed;
}
