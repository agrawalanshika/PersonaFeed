import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";

/**
 * Renders a component wrapped in a real Redux Provider backed by a fresh
 * store (the actual makeStore() used in production, not a mock) — so
 * these tests exercise real reducer + component wiring end to end.
 */
export function renderWithStore(
  ui: ReactElement,
  { store = makeStore() }: { store?: AppStore } = {},
) {
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
