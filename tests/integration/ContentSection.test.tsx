import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentSection from "@/components/content/ContentSection";
import type { ContentItem } from "@/types/content";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "item-1",
    type: "news",
    title: "Sample Headline",
    description: "Sample description",
    source: "Sample Source",
    url: "https://example.com",
    actionLabel: "Read More",
    ...overrides,
  };
}

describe("ContentSection", () => {
  it("shows skeleton placeholders while loading, not cards or errors", () => {
    render(
      <ContentSection
        title="Trending news"
        isLoading
        error={null}
        items={[]}
        onRetry={vi.fn()}
        favoriteIds={new Set()}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByText("Trending news")).toBeInTheDocument();
    expect(screen.queryByText("Sample Headline")).not.toBeInTheDocument();
    expect(screen.queryByText(/couldn't load/i)).not.toBeInTheDocument();
  });

  it("shows an error state with a working retry button when the section failed", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ContentSection
        title="Trending news"
        isLoading={false}
        error={new Error("network failed")}
        items={[]}
        onRetry={onRetry}
        favoriteIds={new Set()}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText(/couldn't load this section/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when there's no error but zero items", () => {
    render(
      <ContentSection
        title="Trending news"
        isLoading={false}
        error={null}
        items={[]}
        onRetry={vi.fn()}
        favoriteIds={new Set()}
        onToggleFavorite={vi.fn()}
        emptyTitle="Nothing trending right now"
      />,
    );
    expect(screen.getByText("Nothing trending right now")).toBeInTheDocument();
  });

  it("renders real content cards when data comes back successfully", () => {
    const items = [
      makeItem({ id: "a", title: "First Story" }),
      makeItem({ id: "b", title: "Second Story" }),
    ];

    render(
      <ContentSection
        title="Trending news"
        isLoading={false}
        error={null}
        items={items}
        onRetry={vi.fn()}
        favoriteIds={new Set()}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText("First Story")).toBeInTheDocument();
    expect(screen.getByText("Second Story")).toBeInTheDocument();
  });

  it("calls onToggleFavorite with the correct item when its heart button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const item = makeItem({ id: "target-item", title: "Target Story" });

    render(
      <ContentSection
        title="Trending news"
        isLoading={false}
        error={null}
        items={[item]}
        onRetry={vi.fn()}
        favoriteIds={new Set()}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const card = screen.getByText("Target Story").closest("article")!;
    await user.click(within(card).getByRole("button", { name: /add to favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith(item);
  });

  it("reflects favoriteIds by showing the favorited state on matching cards", () => {
    const item = makeItem({ id: "already-favorited", title: "Saved Story" });

    render(
      <ContentSection
        title="Trending news"
        isLoading={false}
        error={null}
        items={[item]}
        onRetry={vi.fn()}
        favoriteIds={new Set(["already-favorited"])}
        onToggleFavorite={vi.fn()}
      />,
    );

    const card = screen.getByText("Saved Story").closest("article")!;
    expect(
      within(card).getByRole("button", { name: /remove from favorites/i }),
    ).toBeInTheDocument();
  });
});
