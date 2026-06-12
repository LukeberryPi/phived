function startOfCalendarDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatHistoryWhen(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  );

  if (elapsedMinutes < 1) {
    return "just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const today = startOfCalendarDay(now);
  const completedDay = startOfCalendarDay(date);
  const daysAgo = Math.floor(
    (today.getTime() - completedDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysAgo === 0) {
    return "earlier today";
  }

  if (daysAgo === 1) {
    return "yesterday";
  }

  if (daysAgo < 7) {
    return "a few days ago";
  }

  return "over a week ago";
}
