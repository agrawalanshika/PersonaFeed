/**
 * Draft version of the unified content model.
 * This is intentionally minimal for Phase 3 (design system only — no real
 * data yet). Phase 7 (data normalization) will finalize this shape once
 * normalizeNews(), normalizeMovie(), and normalizeSocial() exist, and may
 * add fields as real API responses are mapped in.
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
}
