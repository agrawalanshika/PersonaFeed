"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { setPreferences } from "@/store/slices/preferencesSlice";
import { loadPreferences, savePreferences } from "@/lib/storage";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  // Restore preferences from localStorage once mounted (client-only — avoids
  // touching localStorage during server rendering) and keep them in sync on
  // every future change.
  useEffect(() => {
    const stored = loadPreferences();
    if (stored) {
      store.dispatch(setPreferences(stored));
    }

    const unsubscribe = store.subscribe(() => {
      savePreferences(store.getState().preferences);
    });

    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
