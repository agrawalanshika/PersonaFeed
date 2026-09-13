"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore, type AppStore } from "@/store";
import { setPreferences } from "@/store/slices/preferencesSlice";
import { setFavorites } from "@/store/slices/favoritesSlice";
import { setTheme, type Theme } from "@/store/slices/uiSlice";
import {
  loadPreferences,
  savePreferences,
  loadFavorites,
  saveFavorites,
  loadTheme,
  saveTheme,
} from "@/lib/storage";

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  // Restore preferences + favorites + theme from localStorage once mounted
  // (client-only — avoids touching localStorage during server rendering)
  // and keep all three in sync on every future change.
  useEffect(() => {
    const storedPreferences = loadPreferences();
    if (storedPreferences) {
      store.dispatch(setPreferences(storedPreferences));
    }

    const storedFavorites = loadFavorites();
    if (storedFavorites) {
      store.dispatch(setFavorites(storedFavorites));
    }

    const storedTheme = loadTheme();
    if (storedTheme) {
      store.dispatch(setTheme(storedTheme));
    }
    applyTheme(storedTheme ?? store.getState().ui.theme);

    const unsubscribeStorage = store.subscribe(() => {
      const state = store.getState();
      savePreferences(state.preferences);
      saveFavorites(state.favorites.items);
      saveTheme(state.ui.theme);
      applyTheme(state.ui.theme);
    });

    // Keep "system" theme in sync with OS-level changes while the app is
    // open, not just at load time.
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (store.getState().ui.theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    // Enables RTK Query's refetchOnFocus/refetchOnReconnect behavior.
    const unsubscribeListeners = setupListeners(store.dispatch);

    return () => {
      unsubscribeStorage();
      unsubscribeListeners();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
