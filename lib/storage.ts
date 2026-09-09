import type { PreferencesState } from "@/store/slices/preferencesSlice";
import type { ContentItem } from "@/types/content";

const PREFERENCES_KEY = "personaFeed:preferences";
const FAVORITES_KEY = "personaFeed:favorites";

export function loadPreferences(): PreferencesState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.interests) || !Array.isArray(parsed?.moviePreferences)) {
      return null;
    }
    return parsed as PreferencesState;
  } catch {
    return null;
  }
}

export function savePreferences(preferences: PreferencesState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // localStorage can fail (private browsing, quota) — safe to ignore
  }
}

export function loadFavorites(): ContentItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContentItem[]) : null;
  } catch {
    return null;
  }
}

export function saveFavorites(favorites: ContentItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage can fail (private browsing, quota) — safe to ignore
  }
}
