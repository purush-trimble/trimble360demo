import { For } from "solid-js";
import { setPreferences } from "@/lib/mockStore";
import { setThemePreference, themePreference } from "@/lib/theme";
import type { ThemePreference } from "@/lib/types";

const themes: { id: ThemePreference; label: string }[] = [
  { id: "light", label: "Light (Modus modern)" },
  { id: "dark", label: "Dark (Modus modern)" },
  { id: "system", label: "System" },
];

export function ThemeSettings() {
  function pickTheme(next: ThemePreference) {
    setThemePreference(next);
    setPreferences({ theme: next });
  }

  return (
    <div class="byop-settings">
      <label class="byop-setting">
        <span>Theme</span>
        <select
          class="byop-input"
          value={themePreference()}
          onChange={(e) => pickTheme(e.currentTarget.value as ThemePreference)}
        >
          <For each={themes}>{(t) => <option value={t.id}>{t.label}</option>}</For>
        </select>
      </label>
    </div>
  );
}
