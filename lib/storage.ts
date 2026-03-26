import { STORAGE_KEYS } from "@/lib/constants";
import { getTodayDateKey } from "@/lib/date";
import { calculateTotalScore } from "@/lib/score";
import type { DailyEntry, DailyEntryInput } from "@/lib/types";

function sortEntriesDesc(entries: DailyEntry[]): DailyEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

function sanitizeEntry(raw: Partial<DailyEntry>): DailyEntry | null {
  if (!raw.date || typeof raw.work !== "number" || typeof raw.gym !== "number" || typeof raw.diet !== "number") {
    return null;
  }

  const total =
    typeof raw.total === "number" ? raw.total : calculateTotalScore(Number(raw.work), Number(raw.gym), Number(raw.diet));

  return {
    date: raw.date,
    work: Number(raw.work),
    gym: Number(raw.gym),
    diet: Number(raw.diet),
    notes: typeof raw.notes === "string" ? raw.notes : "",
    topPriorities: typeof raw.topPriorities === "string" ? raw.topPriorities : "",
    intendedWorkout: typeof raw.intendedWorkout === "string" ? raw.intendedWorkout : "",
    intendedDietGoal: typeof raw.intendedDietGoal === "string" ? raw.intendedDietGoal : "",
    plannedTasks: typeof raw.plannedTasks === "string" ? raw.plannedTasks : "",
    completedTasks: typeof raw.completedTasks === "string" ? raw.completedTasks : "",
    blockers: typeof raw.blockers === "string" ? raw.blockers : "",
    deepWorkHours: typeof raw.deepWorkHours === "number" ? raw.deepWorkHours : 0,
    focusRating: typeof raw.focusRating === "number" ? raw.focusRating : raw.work,
    total,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString()
  };
}

export function loadEntries(): DailyEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const serialized = window.localStorage.getItem(STORAGE_KEYS.entries);
  if (!serialized) {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized) as Partial<DailyEntry>[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    const entries = parsed
      .map((item) => sanitizeEntry(item))
      .filter((item): item is DailyEntry => item !== null);
    return sortEntriesDesc(entries);
  } catch {
    return [];
  }
}

export function saveEntries(entries: DailyEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(sortEntriesDesc(entries)));
}

export function getEntryByDate(dateKey: string): DailyEntry | undefined {
  return loadEntries().find((entry) => entry.date === dateKey);
}

export function upsertEntry(input: DailyEntryInput, dateKey = getTodayDateKey()): DailyEntry {
  const entries = loadEntries();
  const existing = entries.find((entry) => entry.date === dateKey);
  const nowIso = new Date().toISOString();
  const nextEntry: DailyEntry = {
    date: dateKey,
    work: input.work,
    gym: input.gym,
    diet: input.diet,
    notes: input.notes ?? "",
    topPriorities: input.topPriorities ?? existing?.topPriorities ?? "",
    intendedWorkout: input.intendedWorkout ?? existing?.intendedWorkout ?? "",
    intendedDietGoal: input.intendedDietGoal ?? existing?.intendedDietGoal ?? "",
    plannedTasks: input.plannedTasks ?? existing?.plannedTasks ?? "",
    completedTasks: input.completedTasks ?? existing?.completedTasks ?? "",
    blockers: input.blockers ?? existing?.blockers ?? "",
    deepWorkHours: input.deepWorkHours ?? existing?.deepWorkHours ?? 0,
    focusRating: input.focusRating ?? existing?.focusRating ?? input.work,
    total: calculateTotalScore(input.work, input.gym, input.diet),
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso
  };

  const withoutDate = entries.filter((entry) => entry.date !== dateKey);
  const updated = sortEntriesDesc([nextEntry, ...withoutDate]);
  saveEntries(updated);
  return nextEntry;
}

export function clearEntries(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.entries);
}
