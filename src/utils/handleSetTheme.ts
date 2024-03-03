export function handleSetTheme(isDarkMode: boolean) {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return;
  }
  document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');
  return;
}
