import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavoritesPage from "@/app/(dashboard)/favorites/page";
import { renderWithStore } from "@/tests/integration/test-utils";
import { makeStore } from "@/store";
import { setFavorites } from "@/store/slices/favoritesSlice";
import type { ContentItem } from "@/types/content";

function makeItem(overrides: Partial<ContentItem>): ContentItem {
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

describe("Favorites page (real Redux integration)", () => {
  it("shows the empty state when there are no favorites", () => {
    renderWithStore(<FavoritesPage />);
    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
  });

  it("groups saved items into their type sections", () => {
    const store = makeStore();
    store.dispatch(
      setFavorites([
        makeItem({ id: "n1", type: "news", title: "News Item" }),
        makeItem({ id: "m1", type: "movie", title: "Movie Item" }),
      ]),
    );

    renderWithStore(<FavoritesPage />, { store });

    expect(screen.getByRole("heading", { name: "News" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Movies" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Social" })).not.toBeInTheDocument();
    expect(screen.getByText("News Item")).toBeInTheDocument();
    expect(screen.getByText("Movie Item")).toBeInTheDocument();
  });

  it("shows the correct saved-item count, singular vs. plural", () => {
    const store = makeStore();
    store.dispatch(setFavorites([makeItem({ id: "n1", title: "Only Item" })]));
    renderWithStore(<FavoritesPage />, { store });
    expect(screen.getByText("1 saved item, grouped by type.")).toBeInTheDocument();
  });

  it("removing a favorite via the heart button updates both the store and the UI", async () => {
    const user = userEvent.setup();
    const store = makeStore();
    store.dispatch(
      setFavorites([makeItem({ id: "n1", type: "news", title: "Removable Item" })]),
    );

    renderWithStore(<FavoritesPage />, { store });

    const card = screen.getByText("Removable Item").closest("article")!;
    await user.click(
      within(card).getByRole("button", { name: /remove from favorites/i }),
    );

    expect(store.getState().favorites.items).toHaveLength(0);
    // Removing the only favorite should fall back to the empty state.
    expect(await screen.findByText("No favorites yet")).toBeInTheDocument();
  });
});
