import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginationFooter from "@/components/content/PaginationFooter";

describe("PaginationFooter", () => {
  it("shows a Load more button when there's more to load", () => {
    render(<PaginationFooter hasMore onLoadMore={vi.fn()} showEndNote={false} />);
    expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
  });

  it("clicking Load more calls onLoadMore", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(<PaginationFooter hasMore onLoadMore={onLoadMore} showEndNote={false} />);

    await user.click(screen.getByRole("button", { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shows a loading indicator instead of the button while a fetch is in flight", () => {
    render(
      <PaginationFooter
        hasMore
        onLoadMore={vi.fn()}
        showEndNote={false}
        isLoadingMore
      />,
    );
    expect(screen.getByText(/loading more/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });

  it("shows the reached-the-end note only when nothing is left AND it was ever paginated", () => {
    render(<PaginationFooter hasMore={false} onLoadMore={vi.fn()} showEndNote />);
    expect(screen.getByText(/reached the end/i)).toBeInTheDocument();
  });

  it("shows nothing when there's nothing more and it was never paginated (short list)", () => {
    render(<PaginationFooter hasMore={false} onLoadMore={vi.fn()} showEndNote={false} />);
    expect(screen.queryByText(/reached the end/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });
});
