export function isDailyPage(pathname = window.location.pathname) {
  return pathname.includes("/daily");
}
