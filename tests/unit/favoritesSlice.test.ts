import { describe, it, expect } from "vitest";
import favoritesReducer, {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  setFavorites,
  type FavoritesState,
} from "@/store/slices/favoritesSlice";
import type { ContentItem } from "@/types/content";

const article: ContentItem = {
  id: "news-1",
  type: "news",
  title: "Test Article",
  description: "A test article",
  source: "Test Source",
  url: "https://example.com",
  actionLabel: "Read More",
};

const initialState: FavoritesState = { items: [] };

describe("favoritesSlice", () => {
  it("adds a new favorite", () => {
    const state = favoritesReducer(initialState, addFavorite(article));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("news-1");
  });

  it("does not add a duplicate favorite (same id twice)", () => {
    let state = favoritesReducer(initialState, addFavorite(article));
    state = favoritesReducer(state, addFavorite(article));
    expect(state.items).toHaveLength(1);
  });

  it("removes a favorite by id", () => {
    const withItem: FavoritesState = { items: [article] };
    const state = favoritesReducer(withItem, removeFavorite("news-1"));
    expect(state.items).toEqual([]);
  });

  it("removing a nonexistent id is a harmless no-op", () => {
    const withItem: FavoritesState = { items: [article] };
    const state = favoritesReducer(withItem, removeFavorite("nonexistent"));
    expect(state.items).toHaveLength(1);
  });

  it("toggleFavorite adds when not present, removes when present", () => {
    let state = favoritesReducer(initialState, toggleFavorite(article));
    expect(state.items).toHaveLength(1);

    state = favoritesReducer(state, toggleFavorite(article));
    expect(state.items).toHaveLength(0);
  });

  it("setFavorites replaces the whole list (used for localStorage hydration)", () => {
    const secondArticle: ContentItem = { ...article, id: "news-2" };
    const state = favoritesReducer(
      { items: [article] },
      setFavorites([secondArticle]),
    );
    expect(state.items).toEqual([secondArticle]);
  });
});
