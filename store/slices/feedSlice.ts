
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";
import { normalizeForDedup } from "@/lib/feed";

export type FeedStatus = "idle" | "loading" | "succeeded" | "failed";

export interface FeedState {
  items: ContentItem[];
  order: string[];
  status: FeedStatus;
  error: string | null;
}

const initialState: FeedState = {
  items: [],
  order: [],
  status: "idle",
  error: null,
};

/**
 * Creates a balanced feed:
 * - Newer items are prioritized within each content type.
 * - Content types are randomly interleaved.
 * - Prevents one content type from dominating the feed.
 */
function sortByNewest(items: ContentItem[]): ContentItem[] {
  const groupedItems = new Map<string, ContentItem[]>();

  // Group items by content type
  for (const item of items) {
    const type = item.type;

    if (!groupedItems.has(type)) {
      groupedItems.set(type, []);
    }

    groupedItems.get(type)!.push(item);
  }

  // Sort each content type by newest first
  for (const group of groupedItems.values()) {
    group.sort((a, b) => {
      const aTime = a.publishedAt
        ? new Date(a.publishedAt).getTime()
        : 0;

      const bTime = b.publishedAt
        ? new Date(b.publishedAt).getTime()
        : 0;

      return bTime - aTime;
    });
  }

  const result: ContentItem[] = [];
  const groups = Array.from(groupedItems.values());

  // Randomly interleave content types
  while (groups.some((group) => group.length > 0)) {
    const availableGroups = groups.filter(
      (group) => group.length > 0,
    );

    // Shuffle available groups using Fisher-Yates
    for (let i = availableGroups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [availableGroups[i], availableGroups[j]] = [
        availableGroups[j],
        availableGroups[i],
      ];
    }

    // Add one item from each randomized group
    for (const group of availableGroups) {
      const item = group.shift();

      if (item) {
        result.push(item);
      }
    }
  }

  return result;
}

const feedSlice = createSlice({
  name: "feed",
  initialState,

  reducers: {
    setFeedItems(
      state,
      action: PayloadAction<ContentItem[]>,
    ) {
      const balancedItems = sortByNewest(action.payload);

      state.items = balancedItems;
      state.order = balancedItems.map((item) => item.id);
    },

    setFeedOrder(
      state,
      action: PayloadAction<string[]>,
    ) {
      state.order = action.payload;
    },

    /**
     * Appends newly fetched items without duplicates.
     * The feed remains balanced and randomized.
     */
    appendFeedItems(
      state,
      action: PayloadAction<ContentItem[]>,
    ) {
      const existingIds = new Set(
        state.items.map((item) => item.id),
      );

      const existingContent = new Set(
        state.items.map(
          (item) =>
            `${item.type}:${normalizeForDedup(item.title)}`,
        ),
      );

      const newItems: ContentItem[] = [];

      for (const item of action.payload) {
        const contentKey = `${item.type}:${normalizeForDedup(
          item.title,
        )}`;

        const isDuplicate =
          existingIds.has(item.id) ||
          existingContent.has(contentKey);

        if (!isDuplicate) {
          newItems.push(item);

          existingIds.add(item.id);
          existingContent.add(contentKey);
        }
      }

      const combinedItems = [
        ...state.items,
        ...newItems,
      ];

      const balancedItems = sortByNewest(combinedItems);

      state.items = balancedItems;
      state.order = balancedItems.map((item) => item.id);
    },

    setFeedStatus(
      state,
      action: PayloadAction<FeedStatus>,
    ) {
      state.status = action.payload;
    },

    setFeedError(
      state,
      action: PayloadAction<string | null>,
    ) {
      state.error = action.payload;
    },
  },
});

export const {
  setFeedItems,
  setFeedOrder,
  setFeedStatus,
  setFeedError,
  appendFeedItems,
} = feedSlice.actions;

export default feedSlice.reducer;