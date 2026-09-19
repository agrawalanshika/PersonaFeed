import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement IntersectionObserver — components using it
// (LoadMoreSentinel, for infinite scroll) need at least a no-op stub so
// tests don't crash on `new IntersectionObserver(...)`.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error -- test-environment stub, not a full implementation
globalThis.IntersectionObserver = IntersectionObserverStub;
