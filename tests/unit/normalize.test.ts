import { describe, it, expect } from "vitest";
import { normalizeNews, normalizeMovie, normalizeSocial } from "@/lib/normalize";
import type { NewsApiArticle } from "@/services/newsApi";
import type { TmdbMovie } from "@/services/tmdbApi";
import type { MastodonStatus } from "@/services/socialApi";

describe("normalizeNews", () => {
  const baseArticle: NewsApiArticle = {
    title: "Real headline",
    description: "A real description",
    url: "https://example.com/article-1",
    urlToImage: "https://example.com/img.jpg",
    author: "J. Doe",
    source: { name: "Example Wire" },
    publishedAt: "2026-09-01T00:00:00Z",
  };

  it("maps fields to the unified ContentItem shape", () => {
    const [item] = normalizeNews([baseArticle], "technology");
    expect(item).toMatchObject({
      id: "https://example.com/article-1",
      type: "news",
      title: "Real headline",
      description: "A real description",
      image: "https://example.com/img.jpg",
      author: "J. Doe",
      source: "Example Wire",
      actionLabel: "Read More",
      tags: ["technology"],
    });
  });

  it("filters out [Removed] articles — a real News API artifact for takedowns", () => {
    const removed: NewsApiArticle = {
      ...baseArticle,
      title: "[Removed]",
      url: "https://example.com/removed",
    };
    const result = normalizeNews([baseArticle, removed]);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe(baseArticle.url);
  });

  it("filters out articles with an empty title", () => {
    const empty: NewsApiArticle = { ...baseArticle, title: "", url: "https://x.com" };
    expect(normalizeNews([empty])).toHaveLength(0);
  });

  it("falls back to a default description when null", () => {
    const noDescription: NewsApiArticle = { ...baseArticle, description: null };
    const [item] = normalizeNews([noDescription]);
    expect(item.description).toBe("No description available.");
  });

  it("omits tags when no category is given", () => {
    const [item] = normalizeNews([baseArticle]);
    expect(item.tags).toBeUndefined();
  });
});

describe("normalizeMovie", () => {
  const baseMovie: TmdbMovie = {
    id: 42,
    title: "Sample Movie",
    overview: "A story.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    vote_average: 7.5,
    release_date: "2026-01-01",
  };

  it("prefers the landscape backdrop over the portrait poster", () => {
    const [item] = normalizeMovie([baseMovie]);
    expect(item.image).toContain("/backdrop.jpg");
    expect(item.image).not.toContain("/poster.jpg");
  });

  it("falls back to the poster when there's no backdrop", () => {
    const noBackdrop: TmdbMovie = { ...baseMovie, backdrop_path: null };
    const [item] = normalizeMovie([noBackdrop]);
    expect(item.image).toContain("/poster.jpg");
  });

  it("leaves image undefined when neither backdrop nor poster exists", () => {
    const noImages: TmdbMovie = { ...baseMovie, backdrop_path: null, poster_path: null };
    const [item] = normalizeMovie([noImages]);
    expect(item.image).toBeUndefined();
  });

  it("prefixes the id so it can't collide with news/social ids", () => {
    const [item] = normalizeMovie([baseMovie]);
    expect(item.id).toBe("movie-42");
  });

  it("maps vote_average to rating", () => {
    const [item] = normalizeMovie([baseMovie]);
    expect(item.rating).toBe(7.5);
  });
});

describe("normalizeSocial", () => {
  const basePost: MastodonStatus = {
    id: "post-1",
    content: "<p>Hello <strong>world</strong></p>",
    created_at: "2026-09-01T00:00:00Z",
    url: "https://mastodon.social/@user/1",
    account: { username: "someuser", display_name: "Some User" },
    media_attachments: [],
    card: null,
    tags: [{ name: "technology" }],
  };

  it("strips HTML tags from post content", () => {
    const [item] = normalizeSocial([basePost]);
    expect(item.description).toBe("Hello world");
    expect(item.description).not.toContain("<");
  });

  it("prefers a directly attached photo over the link-preview card image", () => {
    const withBoth: MastodonStatus = {
      ...basePost,
      media_attachments: [{ type: "image", preview_url: "https://x.com/photo.jpg", url: "https://x.com/photo.jpg" }],
      card: { image: "https://x.com/card.jpg" },
    };
    const [item] = normalizeSocial([withBoth]);
    expect(item.image).toBe("https://x.com/photo.jpg");
  });

  it("falls back to the link-preview card image when there's no attached photo", () => {
    const linkShare: MastodonStatus = { ...basePost, card: { image: "https://x.com/card.jpg" } };
    const [item] = normalizeSocial([linkShare]);
    expect(item.image).toBe("https://x.com/card.jpg");
  });

  it("leaves image undefined when neither source has one", () => {
    const [item] = normalizeSocial([basePost]);
    expect(item.image).toBeUndefined();
  });

  it("truncates long content into a shorter title with an ellipsis", () => {
    const longPost: MastodonStatus = {
      ...basePost,
      content: `<p>${"a".repeat(100)}</p>`,
    };
    const [item] = normalizeSocial([longPost]);
    expect(item.title.length).toBeLessThanOrEqual(61); // 60 chars + ellipsis
    expect(item.title.endsWith("…")).toBe(true);
  });

  it("uses display_name for author, falling back to username", () => {
    const noDisplayName: MastodonStatus = {
      ...basePost,
      account: { username: "someuser", display_name: "" },
    };
    const [item] = normalizeSocial([noDisplayName]);
    expect(item.author).toBe("someuser");
  });
});
