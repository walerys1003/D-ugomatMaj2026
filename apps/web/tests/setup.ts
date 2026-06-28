import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// `server-only` package — Next.js guard that throws if imported in client bundle.
// W jsdom-vitest nie ma znaczenia czy "server" czy "client", więc no-op mock.
vi.mock("server-only", () => ({}));

// next/navigation stubs — most components use these even in pure UI tests.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// IntersectionObserver — used by Framer Motion + headless UI; jsdom lacks it.
class IO {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
// @ts-expect-error - test global
globalThis.IntersectionObserver = IO;

// matchMedia — required by next-themes / Tailwind dark-mode helpers.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
