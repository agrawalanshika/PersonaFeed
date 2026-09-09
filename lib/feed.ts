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
 * Dedupes by id, then shuffles so the feed doesn't cluster or follow a
 * fixed repeating pattern by source type. Order will differ each time the
 * feed reloads or preferences change — Phase 14's drag-and-drop lets users
 * lock in a custom order on top of this.
 */
export function mergeFeedItems(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  const deduped: ContentItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return shuffle(deduped);
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
