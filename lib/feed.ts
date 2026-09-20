
import type { ContentItem } from "@/types/content";

// Cold-start defaults
const DEFAULT_INTERESTS = ["Technology"];
const DEFAULT_MOVIE_GENRES = ["Action"];

export function getFeedCategories(interests: string[]): string[] {
  return interests.length > 0 ? interests : DEFAULT_INTERESTS;
}

export function getFeedGenres(moviePreferences: string[]): string[] {
  return moviePreferences.length > 0
    ? moviePreferences
    : DEFAULT_MOVIE_GENRES;
}

/**
 * Removes duplicate items and randomizes the entire feed.
 *
 * News, movies, and social content are combined into
 * one array and shuffled together.
 */

/**
 * Deduplicates content and sorts everything by date,
 * newest first, regardless of content type.
 */
export function mergeFeedItems(items: ContentItem[]): ContentItem[] {
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const deduped: ContentItem[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;

    const contentKey = `${item.type}:${normalizeForDedup(item.title)}`;

    if (seenContent.has(contentKey)) continue;

    seenIds.add(item.id);
    seenContent.add(contentKey);
    deduped.push(item);
  }

  // Sort ALL content types by date, newest first.
  return deduped.sort((a, b) => {
    const aTime = a.publishedAt
      ? new Date(a.publishedAt).getTime()
      : 0;

    const bTime = b.publishedAt
      ? new Date(b.publishedAt).getTime()
      : 0;

    return bTime - aTime;
  });
}

/**
 * Fisher-Yates shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

/**
 * Normalizes titles for duplicate detection.
 */
export function normalizeForDedup(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Applies a saved drag-and-drop order.
 */
export function applySavedOrder(
  items: ContentItem[],
  savedOrder: string[] | null,
): ContentItem[] {
  if (!savedOrder || savedOrder.length === 0) return items;

  const remaining = new Map(
    items.map((item) => [item.id, item]),
  );

  const ordered: ContentItem[] = [];

  for (const id of savedOrder) {
    const item = remaining.get(id);

    if (item) {
      ordered.push(item);
      remaining.delete(id);
    }
  }

  ordered.push(...remaining.values());

  return ordered;
}