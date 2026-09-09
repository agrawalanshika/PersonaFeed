import type { ContentItem } from "@/types/content";

// Cold-start defaults so the feed isn't empty before a user sets any
// preferences in Settings.
const DEFAULT_INTERESTS = ["Technology"];
const DEFAULT_MOVIE_GENRES = ["Action"];

export function getFeedCategories(interests: string[]): string[] {
  return interests.length > 0 ? interests : DEFAULT_INTERESTS;
}

export function getFeedGenres(moviePreferences: string[]): string[] {
  return moviePreferences.length > 0 ? moviePreferences : DEFAULT_MOVIE_GENRES;
}

/**
 * Dedupes by id, then combines recency with topic mixing:
 *   1. Rank each type's items newest-first internally (comparing timestamps
 *      *within* a type only — a movie's release date and a social post's
 *      timestamp aren't on the same scale, so cross-type comparison isn't
 *      meaningful).
 *   2. Group same-rank items across types into a "wave" (the most-recent
 *      news + most-recent social + most-recent movie form wave 0, etc).
 *   3. Shuffle only within each wave, then concatenate waves in order.
 * Net effect: recent items surface near the top, but which type leads
 * within any given wave is randomized instead of a fixed pattern.
 */
export function mergeFeedItems(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  const deduped: ContentItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  const byRecency = (a: ContentItem, b: ContentItem) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  };

  const news = deduped.filter((item) => item.type === "news").sort(byRecency);
  const social = deduped
    .filter((item) => item.type === "social")
    .sort(byRecency);
  const movie = deduped
    .filter((item) => item.type === "movie")
    .sort(byRecency);

  const merged: ContentItem[] = [];
  const waveCount = Math.max(news.length, social.length, movie.length);
  for (let i = 0; i < waveCount; i++) {
    const wave = [news[i], social[i], movie[i]].filter(
      (item): item is ContentItem => Boolean(item),
    );
    merged.push(...shuffle(wave));
  }

  return merged;
}

/** Fisher-Yates shuffle — unbiased, doesn't mutate the input array. */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
