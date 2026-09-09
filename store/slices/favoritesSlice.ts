import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";

export interface FavoritesState {
  items: ContentItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite(state, action: PayloadAction<ContentItem>) {
      const alreadySaved = state.items.some(
        (item) => item.id === action.payload.id,
      );
      if (!alreadySaved) state.items.push(action.payload);
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const exists = state.items.some(
        (item) => item.id === action.payload.id,
      );
      state.items = exists
        ? state.items.filter((item) => item.id !== action.payload.id)
        : [...state.items, action.payload];
    },
    setFavorites(state, action: PayloadAction<ContentItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, setFavorites } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
