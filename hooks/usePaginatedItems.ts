"use client";

import { useState } from "react";

const DEFAULT_PAGE_SIZE = 9;

export function usePaginatedItems<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [prevItems, setPrevItems] = useState(items);

  // Reset back to the first page whenever the underlying list changes
  // (new preferences, a new search query, etc.) rather than keeping a
  // stale scroll position into a different dataset. Done during render
  // (React's documented pattern for "adjusting state when a prop
  // changes") rather than in an effect, which would cause an extra render.
  if (items !== prevItems) {
    setPrevItems(items);
    setVisibleCount(pageSize);
  }

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  function loadMore() {
    setVisibleCount((count) => Math.min(count + pageSize, items.length));
  }

  return { visibleItems, hasMore, loadMore };
}
