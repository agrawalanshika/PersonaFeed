import type { PreferencesState } from "@/store/slices/preferencesSlice";

const PREFERENCES_KEY = "personaFeed:preferences";

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
