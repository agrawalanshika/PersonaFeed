import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";

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

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeedItems(state, action: PayloadAction<ContentItem[]>) {
      state.items = action.payload;
      state.order = action.payload.map((item) => item.id);
    },
    setFeedOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    /** Appends newly-fetched items (e.g. next page) without disturbing the
     * existing order — used by infinite scroll once the initial batch is
     * exhausted, as opposed to setFeedItems which replaces everything. */
    appendFeedItems(state, action: PayloadAction<ContentItem[]>) {
      const existingIds = new Set(state.items.map((item) => item.id));
      const newItems = action.payload.filter(
        (item) => !existingIds.has(item.id),
      );
      state.items = [...state.items, ...newItems];
      state.order = state.items.map((item) => item.id);
    },
    setFeedStatus(state, action: PayloadAction<FeedStatus>) {
      state.status = action.payload;
    },
    setFeedError(state, action: PayloadAction<string | null>) {
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
