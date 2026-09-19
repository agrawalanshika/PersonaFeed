import { describe, it, expect, beforeEach } from "vitest";
import {
  loadPreferences,
  savePreferences,
  loadFavorites,
  saveFavorites,
  loadFeedOrder,
  saveFeedOrder,
  loadTheme,
  saveTheme,
} from "@/lib/storage";
import type { ContentItem } from "@/types/content";

beforeEach(() => {
  window.localStorage.clear();
});

describe("preferences storage", () => {
  it("round-trips a saved value", () => {
    savePreferences({ interests: ["Technology"], moviePreferences: ["Action"] });
    expect(loadPreferences()).toEqual({
      interests: ["Technology"],
      moviePreferences: ["Action"],
    });
  });

  it("returns null when nothing is stored yet", () => {
    expect(loadPreferences()).toBeNull();
  });

  it("returns null for corrupted JSON instead of throwing", () => {
    window.localStorage.setItem("personaFeed:preferences", "{not valid json");
    expect(loadPreferences()).toBeNull();
  });

  it("returns null when the stored shape is wrong (missing arrays)", () => {
    window.localStorage.setItem(
      "personaFeed:preferences",
      JSON.stringify({ interests: "not-an-array" }),
    );
    expect(loadPreferences()).toBeNull();
  });
});

describe("favorites storage", () => {
  const item: ContentItem = {
    id: "1",
    type: "news",
    title: "Title",
    description: "Description",
    source: "Source",
    url: "https://example.com",
    actionLabel: "Read More",
  };

  it("round-trips a saved value", () => {
    saveFavorites([item]);
    expect(loadFavorites()).toEqual([item]);
  });

  it("returns null when the stored value isn't an array", () => {
    window.localStorage.setItem("personaFeed:favorites", JSON.stringify({ not: "an array" }));
    expect(loadFavorites()).toBeNull();
  });
});

describe("feed order storage", () => {
  it("round-trips a saved value", () => {
    saveFeedOrder(["a", "b", "c"]);
    expect(loadFeedOrder()).toEqual(["a", "b", "c"]);
  });

  it("returns null when nothing is stored yet", () => {
    expect(loadFeedOrder()).toBeNull();
  });
});

describe("theme storage", () => {
  it("round-trips a valid theme", () => {
    saveTheme("dark");
    expect(loadTheme()).toBe("dark");
  });

  it("rejects an invalid stored value instead of returning garbage", () => {
    window.localStorage.setItem("personaFeed:theme", "not-a-real-theme");
    expect(loadTheme()).toBeNull();
  });

  it("returns null when nothing is stored yet", () => {
    expect(loadTheme()).toBeNull();
  });
});
