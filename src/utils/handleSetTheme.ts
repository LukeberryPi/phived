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
