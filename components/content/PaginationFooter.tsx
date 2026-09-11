"use client";

import Button from "@/components/ui/Button";
import LoadMoreSentinel from "@/components/content/LoadMoreSentinel";

type PaginationFooterProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  /** Only show "You've reached the end" if there was ever more than one page. */
  showEndNote: boolean;
};

export default function PaginationFooter({
  hasMore,
  onLoadMore,
  showEndNote,
}: PaginationFooterProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {hasMore && (
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
