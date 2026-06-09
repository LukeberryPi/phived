import type { ThemePreference } from "src/utils/handleSetTheme";

export function getStoredThemePreference(): ThemePreference {
  const localStorageTheme = localStorage.getItem("theme");

  if (localStorageTheme === "dark" || localStorageTheme === "light") {
    return localStorageTheme;
  }

  return "system";
}
