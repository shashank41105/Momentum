"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { ThemeMode } from "@/lib/types";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(theme: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    const initialMode = savedMode === "light" || savedMode === "dark" || savedMode === "system" ? savedMode : "system";
    setModeState(initialMode);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const nextResolvedTheme = mode === "system" ? (mediaQuery.matches ? "dark" : "light") : mode;
    setResolvedTheme(nextResolvedTheme);
    applyThemeClass(nextResolvedTheme);
    window.localStorage.setItem(STORAGE_KEYS.theme, mode);

    const handleMediaChange = () => {
      if (mode !== "system") {
        return;
      }
      const systemTheme = resolveSystemTheme();
      setResolvedTheme(systemTheme);
      applyThemeClass(systemTheme);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [mode]);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
  };

  const toggleTheme = () => {
    setModeState((prev) => {
      const current = prev === "system" ? resolveSystemTheme() : prev;
      return current === "dark" ? "light" : "dark";
    });
  };

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode,
      toggleTheme
    }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
