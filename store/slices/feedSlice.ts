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
    setFeedStatus(state, action: PayloadAction<FeedStatus>) {
      state.status = action.payload;
    },
    setFeedError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setFeedItems, setFeedOrder, setFeedStatus, setFeedError } =
  feedSlice.actions;
export default feedSlice.reducer;
