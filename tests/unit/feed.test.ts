import { describe, it, expect } from "vitest";
import {
  getFeedCategories,
  getFeedGenres,
  mergeFeedItems,
  applySavedOrder,
  normalizeForDedup,
} from "@/lib/feed";
import type { ContentItem } from "@/types/content";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "id",
    type: "news",
    title: "Title",
    description: "Description",
    source: "Source",
    url: "https://example.com",
    actionLabel: "Read More",
    ...overrides,
  };
}

describe("getFeedCategories / getFeedGenres", () => {
  it("returns the user's selected interests when there are any", () => {
    expect(getFeedCategories(["Sports", "Finance"])).toEqual(["Sports", "Finance"]);
  });

  it("falls back to a cold-start default when no interests are selected", () => {
    expect(getFeedCategories([])).toEqual(["Technology"]);
  });

  it("returns the user's selected movie genres when there are any", () => {
    expect(getFeedGenres(["Horror"])).toEqual(["Horror"]);
  });

  it("falls back to a cold-start default when no genres are selected", () => {
    expect(getFeedGenres([])).toEqual(["Action"]);
  });
});

describe("normalizeForDedup", () => {
  it("lowercases and strips punctuation so near-identical titles match", () => {
    expect(normalizeForDedup("Why Hasn't Puig Been Sentenced?")).toBe(
      normalizeForDedup("why hasn't puig been sentenced"),
    );
  });

  it("treats titles with different wording as different", () => {
    expect(normalizeForDedup("Article A")).not.toBe(normalizeForDedup("Article B"));
  });
});

describe("mergeFeedItems", () => {
  it("dedupes exact id matches", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "a" })];
    expect(mergeFeedItems(items)).toHaveLength(1);
  });

  it("dedupes same-type items with the same normalized title under different ids", () => {
    const items = [
      makeItem({ id: "a", type: "social", title: "Same story" }),
      makeItem({ id: "b", type: "social", title: "same story" }),
    ];
    expect(mergeFeedItems(items)).toHaveLength(1);
  });

  it("does not dedupe identical titles across different content types", () => {
    const items = [
      makeItem({ id: "a", type: "news", title: "Shared" }),
      makeItem({ id: "b", type: "movie", title: "Shared" }),
    ];
    expect(mergeFeedItems(items)).toHaveLength(2);
  });

  it("includes every type present in the input, none dropped", () => {
    const items = [
      makeItem({ id: "n1", type: "news" }),
      makeItem({ id: "s1", type: "social" }),
      makeItem({ id: "m1", type: "movie" }),
    ];
    const result = mergeFeedItems(items);
    expect(result.map((i) => i.type).sort()).toEqual(["movie", "news", "social"]);
  });

  it("surfaces newer items in earlier waves than older items of the same type", () => {
    const older = makeItem({
      id: "old",
      type: "news",
      publishedAt: "2020-01-01T00:00:00Z",
    });
    const newer = makeItem({
      id: "new",
      type: "news",
      publishedAt: "2026-01-01T00:00:00Z",
    });
    const result = mergeFeedItems([older, newer]);
    const oldIndex = result.findIndex((i) => i.id === "old");
    const newIndex = result.findIndex((i) => i.id === "new");
    expect(newIndex).toBeLessThan(oldIndex);
  });

  it("handles an empty input without error", () => {
    expect(mergeFeedItems([])).toEqual([]);
  });
});

describe("applySavedOrder", () => {
  it("returns items unchanged when there's no saved order", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    expect(applySavedOrder(items, null)).toEqual(items);
    expect(applySavedOrder(items, [])).toEqual(items);
  });

  it("reorders items to match the saved sequence", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" }), makeItem({ id: "c" })];
    const result = applySavedOrder(items, ["c", "a", "b"]);
    expect(result.map((i) => i.id)).toEqual(["c", "a", "b"]);
  });

  it("appends items not present in the saved order at the end", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" }), makeItem({ id: "new" })];
    const result = applySavedOrder(items, ["b", "a"]);
    expect(result.map((i) => i.id)).toEqual(["b", "a", "new"]);
  });

  it("ignores saved ids that no longer exist in the current items", () => {
    const items = [makeItem({ id: "a" })];
    const result = applySavedOrder(items, ["stale-id", "a"]);
    expect(result.map((i) => i.id)).toEqual(["a"]);
  });
});
