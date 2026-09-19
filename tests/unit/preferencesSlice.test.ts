import { describe, it, expect } from "vitest";
import preferencesReducer, {
  toggleInterest,
  toggleMoviePreference,
  setPreferences,
  type PreferencesState,
} from "@/store/slices/preferencesSlice";

const initialState: PreferencesState = { interests: [], moviePreferences: [] };

describe("preferencesSlice", () => {
  it("adds an interest that isn't selected yet", () => {
    const state = preferencesReducer(initialState, toggleInterest("Technology"));
    expect(state.interests).toEqual(["Technology"]);
  });

  it("removes an interest that's already selected", () => {
    const withInterest: PreferencesState = {
      interests: ["Technology", "Sports"],
      moviePreferences: [],
    };
    const state = preferencesReducer(withInterest, toggleInterest("Technology"));
    expect(state.interests).toEqual(["Sports"]);
  });

  it("toggling twice returns to the original state", () => {
    let state = preferencesReducer(initialState, toggleInterest("Science"));
    state = preferencesReducer(state, toggleInterest("Science"));
    expect(state.interests).toEqual([]);
  });

  it("toggleMoviePreference operates independently of interests", () => {
    const state = preferencesReducer(
      initialState,
      toggleMoviePreference("Action"),
    );
    expect(state.moviePreferences).toEqual(["Action"]);
    expect(state.interests).toEqual([]);
  });

  it("setPreferences replaces both fields wholesale (used for localStorage hydration)", () => {
    const dirty: PreferencesState = {
      interests: ["Old"],
      moviePreferences: ["Old genre"],
    };
    const restored: PreferencesState = {
      interests: ["Technology", "Business"],
      moviePreferences: ["Drama"],
    };
    const state = preferencesReducer(dirty, setPreferences(restored));
    expect(state).toEqual(restored);
  });

  it("does not mutate the previous state object", () => {
    const before = { ...initialState };
    preferencesReducer(initialState, toggleInterest("Technology"));
    expect(initialState).toEqual(before);
  });
});
