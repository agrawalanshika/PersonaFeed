"use client";

import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import LoadMoreSentinel from "@/components/content/LoadMoreSentinel";

type PaginationFooterProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  /** Only show "You've reached the end" if there was ever more than one page. */
  showEndNote: boolean;
  /** True while an actual network request for more data is in flight. */
  isLoadingMore?: boolean;
};

export default function PaginationFooter({
  hasMore,
  onLoadMore,
  showEndNote,
  isLoadingMore = false,
}: PaginationFooterProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {hasMore && isLoadingMore && <Spinner label="Loading more..." />}

      {hasMore && !isLoadingMore && (
        <>
          <LoadMoreSentinel onIntersect={onLoadMore} enabled={hasMore} />
          <Button variant="secondary" size="sm" onClick={onLoadMore}>
            Load more
          </Button>
        </>
      )}

      {!hasMore && showEndNote && (
        <p className="text-sm text-muted">You&apos;ve reached the end</p>
      )}
    </div>
  );
}
