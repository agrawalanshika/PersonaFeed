import { describe, it, expect } from "vitest";
import uiReducer, { setTheme, type UiState } from "@/store/slices/uiSlice";

const initialState: UiState = { theme: "system" };

describe("uiSlice", () => {
  it("defaults to system theme", () => {
    expect(initialState.theme).toBe("system");
  });

  it.each(["light", "dark", "system"] as const)(
    "setTheme sets theme to %s",
    (theme) => {
      const state = uiReducer(initialState, setTheme(theme));
      expect(state.theme).toBe(theme);
    },
  );
});
