import { isConsecutiveDay } from "@/lib/date";
import type { DailyEntry } from "@/lib/types";

export function calculateStreak(entries: DailyEntry[]): number {
  if (!entries.length) {
    return 0;
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index - 1];
    const previous = sorted[index];
    if (!isConsecutiveDay(current.date, previous.date)) {
      break;
    }
    streak += 1;
  }

  return streak;
}
