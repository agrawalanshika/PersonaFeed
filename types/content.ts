/**
 * The unified content model — every card in the app renders one of these,
 * regardless of which API it came from. Finalized in Phase 7 alongside
 * normalizeNews(), normalizeMovie(), and normalizeSocial() (see lib/normalize.ts).
 *
 * `publishedAt` and `tags` were added here (beyond the original draft) to
 * support chronological sorting and interest-based personalization in the
 * Phase 8 feed engine.
 */
export type ContentType = "news" | "movie" | "social";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  image?: string;
  author?: string;
  source: string;
  rating?: number;
  url: string;
  actionLabel: string;
  /** ISO 8601 timestamp, when the source provides one. */
  publishedAt?: string;
  /** Category/genre labels used to match content against user interests. */
  tags?: string[];
}
