"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * Returns a Set of favorited content ids for fast `.has()` lookups in
 * card grids. Selecting `state.favorites.items` directly (not wrapping it
 * in `new Set(...)` inside the selector) keeps the array reference stable
 * across unrelated store updates — the Set is only rebuilt via useMemo
 * when that reference actually changes, i.e. when favorites themselves
 * change. Building the Set directly inside a useAppSelector callback
 * would allocate a new object on every single store update (theme
 * toggles, feed loads, anything), forcing every consumer to re-render far
 * more often than necessary.
 */
export function useFavoriteIds(): Set<string> {
  const favoriteItems = useAppSelector((state) => state.favorites.items);
  return useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );
}
