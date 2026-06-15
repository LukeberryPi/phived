import type { ThemePreference } from "src/utils/handleSetTheme";

export function getStoredThemePreference(): ThemePreference {
  const localStorageTheme = localStorage.getItem("theme");

  if (localStorageTheme === "dark" || localStorageTheme === "light") {
    return localStorageTheme;
  }

  // Missing or invalid values default to "system" (see boot scripts in
  // apps/app/index.html and apps/web/src/layouts/Base.astro).
  return "system";
}
