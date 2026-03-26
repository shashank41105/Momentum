export function getTodayDateKey(now = new Date()): string {
  return now.toISOString().split("T")[0];
}

export function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function isConsecutiveDay(currentDateKey: string, previousDateKey: string): boolean {
  const current = new Date(`${currentDateKey}T00:00:00`);
  const previous = new Date(`${previousDateKey}T00:00:00`);
  const oneDayMs = 24 * 60 * 60 * 1000;
  return current.getTime() - previous.getTime() === oneDayMs;
}
