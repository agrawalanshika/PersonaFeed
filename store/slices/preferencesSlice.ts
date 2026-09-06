import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PreferencesState {
  interests: string[];
  moviePreferences: string[];
}

const initialState: PreferencesState = {
  interests: [],
  moviePreferences: [],
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    toggleInterest(state, action: PayloadAction<string>) {
      state.interests = toggleInList(state.interests, action.payload);
    },
    toggleMoviePreference(state, action: PayloadAction<string>) {
      state.moviePreferences = toggleInList(
        state.moviePreferences,
        action.payload,
      );
    },
    setPreferences(state, action: PayloadAction<PreferencesState>) {
      state.interests = action.payload.interests;
      state.moviePreferences = action.payload.moviePreferences;
    },
  },
});

export const { toggleInterest, toggleMoviePreference, setPreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
