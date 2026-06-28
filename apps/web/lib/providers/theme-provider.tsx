"use client";

import * as React from "react";

/**
 * Lightweight theme provider — three modes (system / light / dark) with
 * localStorage persistence. Implemented from scratch (no next-themes
 * dependency) so we can keep the initial bundle small and the SSR
 * hydration mismatch surface tiny.
 */
type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "dlugomat:theme";

function readStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>("system");
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  // Hydrate from storage once on the client.
  React.useEffect(() => {
    setThemeState(readStored());
  }, []);

  // Reflect mode to <html> class + watch system changes.
  React.useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: ThemeMode) => {
      const isDark = mode === "dark" || (mode === "system" && systemPrefersDark());
      root.classList.toggle("dark", isDark);
      setResolved(isDark ? "dark" : "light");
    };
    apply(theme);

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = React.useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode — ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * Inline script — runs in <head> BEFORE React hydrates, to apply the
 * stored theme synchronously and prevent a light/dark flash.
 */
export const themeBootstrapScript = `
(function(){try{
  var k='dlugomat:theme';
  var t=localStorage.getItem(k);
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark=t==='dark'||(t!=='light'&&d);
  if(dark){document.documentElement.classList.add('dark')}
}catch(e){}})();
`.trim();
