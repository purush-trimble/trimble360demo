import { createSignal } from "solid-js";
import type { ThemePreference } from "@/lib/types";

const PREF_KEY = "byop-theme-preference";

export type ModusThemeId = "modus-modern-light" | "modus-modern-dark" | "modus-classic-light" | "modus-classic-dark";

function readPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // ignore
  }
  return "system";
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveModusTheme(preference: ThemePreference): ModusThemeId {
  if (preference === "light") return "modus-modern-light";
  if (preference === "dark") return "modus-modern-dark";
  return systemPrefersDark() ? "modus-modern-dark" : "modus-modern-light";
}

export function applyModusTheme(preference: ThemePreference) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolveModusTheme(preference));
}

const [themePreference, setThemePreferenceSignal] = createSignal<ThemePreference>(readPreference());

export { themePreference };

export function setThemePreference(next: ThemePreference) {
  setThemePreferenceSignal(next);
  try {
    localStorage.setItem(PREF_KEY, next);
  } catch {
    // ignore
  }
  applyModusTheme(next);
}

export function initTheme() {
  applyModusTheme(themePreference());
  if (typeof window === "undefined") return;
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themePreference() === "system") applyModusTheme("system");
  });
}
