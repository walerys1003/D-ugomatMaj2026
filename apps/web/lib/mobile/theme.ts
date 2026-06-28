// Theme + dark mode + high contrast — managed via localStorage + media query.

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "dlugomat-theme";

export function getStoredTheme(): Theme {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export function setTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.setAttribute("data-theme", resolved);
  // Sync theme-color meta for mobile chrome.
  const meta = document.querySelector("meta[name='theme-color']");
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#0a0a0a" : "#ffffff");
}

export function watchSystemTheme(handler: (resolved: "light" | "dark") => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const fn = () => handler(mq.matches ? "dark" : "light");
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}
