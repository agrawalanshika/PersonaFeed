import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/(dashboard)/settings/page";
import { renderWithStore } from "@/tests/integration/test-utils";

describe("Settings page (real Redux integration)", () => {
  it("starts with no interests selected", () => {
    renderWithStore(<SettingsPage />);
    expect(screen.getByRole("button", { name: "Technology" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("clicking an interest chip selects it and updates the store", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Technology" }));

    expect(screen.getByRole("button", { name: "Technology" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(store.getState().preferences.interests).toContain("Technology");
  });

  it("clicking a selected chip again deselects it", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SettingsPage />);

    const chip = screen.getByRole("button", { name: "Sports" });
    await user.click(chip);
    expect(store.getState().preferences.interests).toContain("Sports");

    await user.click(chip);
    expect(store.getState().preferences.interests).not.toContain("Sports");
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("movie genre selection is independent of content interests", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Action" }));

    expect(store.getState().preferences.moviePreferences).toEqual(["Action"]);
    expect(store.getState().preferences.interests).toEqual([]);
  });

  it("switching theme updates the store and the pressed button", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SettingsPage />);

    expect(store.getState().ui.theme).toBe("system");

    await user.click(screen.getByRole("button", { name: /dark/i }));

    expect(store.getState().ui.theme).toBe("dark");
    expect(screen.getByRole("button", { name: /dark/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /system/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("selecting multiple interests keeps all of them selected simultaneously", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Technology" }));
    await user.click(screen.getByRole("button", { name: "Finance" }));

    expect([...store.getState().preferences.interests].sort()).toEqual(
      ["Finance", "Technology"].sort(),
    );
  });
});
