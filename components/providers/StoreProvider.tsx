"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore, type AppStore } from "@/store";
import { setPreferences } from "@/store/slices/preferencesSlice";
import { setFavorites } from "@/store/slices/favoritesSlice";
import {
  loadPreferences,
  savePreferences,
  loadFavorites,
  saveFavorites,
} from "@/lib/storage";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  // Restore preferences + favorites from localStorage once mounted
  // (client-only — avoids touching localStorage during server rendering)
  // and keep both in sync on every future change.
  useEffect(() => {
    const storedPreferences = loadPreferences();
    if (storedPreferences) {
      store.dispatch(setPreferences(storedPreferences));
    }

    const storedFavorites = loadFavorites();
    if (storedFavorites) {
      store.dispatch(setFavorites(storedFavorites));
    }

    const unsubscribeStorage = store.subscribe(() => {
      const state = store.getState();
      savePreferences(state.preferences);
      saveFavorites(state.favorites.items);
    });

    // Enables RTK Query's refetchOnFocus/refetchOnReconnect behavior.
    const unsubscribeListeners = setupListeners(store.dispatch);

    return () => {
      unsubscribeStorage();
      unsubscribeListeners();
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
