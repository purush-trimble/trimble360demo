import { Show } from "solid-js";
import { setPreferences } from "@/lib/mockStore";
import { resolveModusTheme, setThemePreference, themePreference } from "@/lib/theme";

export function ThemeSettings() {
  const isDark = () => resolveModusTheme(themePreference()).endsWith("dark");

  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    setThemePreference(next);
    setPreferences({ theme: next });
  }

  return (
    <div class="byop-settings">
      <button
        type="button"
        class="byop-icon-button"
        aria-label={isDark() ? "Switch to light theme" : "Switch to dark theme"}
        aria-pressed={isDark()}
        title={isDark() ? "Switch to light theme" : "Switch to dark theme"}
        onClick={toggleTheme}
      >
        <Show
          when={isDark()}
          fallback={
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
            </svg>
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" />
          </svg>
        </Show>
      </button>
    </div>
  );
}
