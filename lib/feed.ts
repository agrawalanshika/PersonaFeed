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
 * Dedupes by id, then interleaves news/movie/social round-robin instead of
 * sorting purely by timestamp. Pure chronological sort clusters the feed by
 * source — social posts are typically minutes old, news articles hours
 * old, and movies use release date (often months/years old) — so a
 * timestamp sort puts all social first, then all news, then all movies.
 * Each type is still sorted newest-first internally before interleaving.
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

  const interleaved: ContentItem[] = [];
  const maxLength = Math.max(news.length, social.length, movie.length);
  for (let i = 0; i < maxLength; i++) {
    if (news[i]) interleaved.push(news[i]);
    if (social[i]) interleaved.push(social[i]);
    if (movie[i]) interleaved.push(movie[i]);
  }

  return interleaved;
}
