export function isThemeSetToDark() {
  const localStorageTheme = localStorage.getItem('theme');
  const isBrowserDark =
    window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return !!localStorageTheme ? localStorageTheme === 'dark' : isBrowserDark;
}
