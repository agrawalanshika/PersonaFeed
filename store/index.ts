import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "@/store/slices/preferencesSlice";
import favoritesReducer from "@/store/slices/favoritesSlice";
import feedReducer from "@/store/slices/feedSlice";
import uiReducer from "@/store/slices/uiSlice";
import { newsApi } from "@/services/newsApi";
import { tmdbApi } from "@/services/tmdbApi";
import { socialApi } from "@/services/socialApi";

export function makeStore() {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      favorites: favoritesReducer,
      feed: feedReducer,
      ui: uiReducer,
      [newsApi.reducerPath]: newsApi.reducer,
      [tmdbApi.reducerPath]: tmdbApi.reducer,
      [socialApi.reducerPath]: socialApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        newsApi.middleware,
        tmdbApi.middleware,
        socialApi.middleware,
      ),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
