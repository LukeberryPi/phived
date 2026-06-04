function startOfCalendarDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isPosteriorCalendarDay(date: Date) {
  const today = startOfCalendarDay(new Date());
  const completedDay = startOfCalendarDay(new Date(date));

  return today.getTime() > completedDay.getTime();
}
