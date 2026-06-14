// Theme preference is stored in localStorage under "theme". The inline boot
// scripts in apps/app/index.html and apps/web/src/layouts/Base.astro
// intentionally mirror these semantics: "system" follows the OS, "dark" and
// "light" are fixed, and missing or invalid values default to "system".
export type ThemePreference = "system" | "dark" | "light";

export function handleSetTheme(
  themePreference: ThemePreference,
  isDarkMode: boolean
) {
  localStorage.setItem("theme", themePreference);

  if (isDarkMode) {
    document.documentElement.classList.add("dark");
    return;
  }

  document.documentElement.classList.remove("dark");
  return;
}
