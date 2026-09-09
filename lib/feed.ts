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

/** Dedupes by id (keeping the first occurrence) and sorts newest-first. */
export function mergeFeedItems(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  const deduped: ContentItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}
