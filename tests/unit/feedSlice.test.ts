import { describe, it, expect } from "vitest";
import feedReducer, {
  setFeedItems,
  setFeedOrder,
  appendFeedItems,
  setFeedStatus,
  setFeedError,
  type FeedState,
} from "@/store/slices/feedSlice";
import type { ContentItem } from "@/types/content";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "id-1",
    type: "news",
    title: "Sample title",
    description: "Sample description",
    source: "Source",
    url: "https://example.com",
    actionLabel: "Read More",
    ...overrides,
  };
}

const initialState: FeedState = {
  items: [],
  order: [],
  status: "idle",
  error: null,
};

describe("feedSlice", () => {
  it("setFeedItems replaces items and derives order from their ids", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    const state = feedReducer(initialState, setFeedItems(items));
    expect(state.items).toEqual(items);
    expect(state.order).toEqual(["a", "b"]);
  });

  it("setFeedOrder updates order independently of items", () => {
    const state = feedReducer(initialState, setFeedOrder(["x", "y", "z"]));
    expect(state.order).toEqual(["x", "y", "z"]);
    expect(state.items).toEqual([]);
  });

  it("appendFeedItems adds genuinely new items and rebuilds order", () => {
    const withItems: FeedState = {
      ...initialState,
      items: [makeItem({ id: "a" })],
      order: ["a"],
    };
    const state = feedReducer(
      withItems,
      appendFeedItems([makeItem({ id: "b", title: "Different title" })]),
    );
    expect(state.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(state.order).toEqual(["a", "b"]);
  });

  it("appendFeedItems dedupes by id", () => {
    const withItems: FeedState = {
      ...initialState,
      items: [makeItem({ id: "a" })],
      order: ["a"],
    };
    const state = feedReducer(withItems, appendFeedItems([makeItem({ id: "a" })]));
    expect(state.items).toHaveLength(1);
  });

  it("appendFeedItems dedupes by normalized title+type even when ids differ (the boosted-post bug)", () => {
    const withItems: FeedState = {
      ...initialState,
      items: [
        makeItem({
          id: "post-from-athletic",
          type: "social",
          title: "Why hasn't Yasiel Puig been sentenced?",
        }),
      ],
      order: ["post-from-athletic"],
    };
    const duplicate = makeItem({
      id: "post-from-nyt-sports", // different id, same underlying story
      type: "social",
      title: "why hasn't yasiel puig been sentenced?", // different casing
    });
    const state = feedReducer(withItems, appendFeedItems([duplicate]));
    expect(state.items).toHaveLength(1);
  });

  it("appendFeedItems does NOT dedupe identical titles across different content types", () => {
    const withItems: FeedState = {
      ...initialState,
      items: [makeItem({ id: "a", type: "news", title: "Shared Title" })],
      order: ["a"],
    };
    const state = feedReducer(
      withItems,
      appendFeedItems([makeItem({ id: "b", type: "movie", title: "Shared Title" })]),
    );
    expect(state.items).toHaveLength(2);
  });

  it("setFeedStatus and setFeedError update independently", () => {
    let state = feedReducer(initialState, setFeedStatus("loading"));
    expect(state.status).toBe("loading");

    state = feedReducer(state, setFeedError("Something failed"));
    expect(state.error).toBe("Something failed");
    expect(state.status).toBe("loading");
  });
});
