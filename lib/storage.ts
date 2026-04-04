import { APP_EVENTS, STORAGE_KEYS } from "@/lib/constants";
import { loadSession, normalizeEmail } from "@/lib/auth";
import { getTodayDateKey } from "@/lib/date";
import { calculateTotalScore } from "@/lib/score";
import { getSupabaseBrowserClient, isSupabaseConfigured, mapDailyEntryToRow, mapRowToDailyEntry } from "@/lib/supabase";
import type { DailyEntry, DailyEntryInput } from "@/lib/types";

function dispatchEntriesChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(APP_EVENTS.entriesChanged));
}

function resolveOwnerEmail(ownerEmail?: string): string | null {
  const fallbackEmail = loadSession()?.email ?? null;
  const resolved = ownerEmail ?? fallbackEmail;
  return resolved ? normalizeEmail(resolved) : null;
}

async function getCloudContext(ownerEmail?: string): Promise<{ client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>; userId: string; email: string } | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  const { data } = await client.auth.getSession();
  const user = data.session?.user;
  if (!user?.id || !user.email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(user.email);
  const expectedEmail = resolveOwnerEmail(ownerEmail);
  if (expectedEmail && normalizedEmail !== expectedEmail) {
    return null;
  }

  return {
    client,
    userId: user.id,
    email: normalizedEmail
  };
}

function getEntriesStorageKey(ownerEmail?: string): string {
  const resolved = resolveOwnerEmail(ownerEmail);
  return resolved ? `${STORAGE_KEYS.entries}:${resolved}` : STORAGE_KEYS.legacyEntries;
}

function getLegacyEntries(ownerEmail?: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const resolved = resolveOwnerEmail(ownerEmail);
  if (!resolved) {
    return window.localStorage.getItem(STORAGE_KEYS.legacyEntries);
  }

  const scopedKey = getEntriesStorageKey(resolved);
  const scopedValue = window.localStorage.getItem(scopedKey);
  if (scopedValue) {
    return scopedValue;
  }

  const legacyValue = window.localStorage.getItem(STORAGE_KEYS.legacyEntries);
  if (!legacyValue) {
    return null;
  }

  window.localStorage.setItem(scopedKey, legacyValue);
  window.localStorage.removeItem(STORAGE_KEYS.legacyEntries);
  return legacyValue;
}

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

export function loadEntries(ownerEmail?: string): DailyEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const serialized = window.localStorage.getItem(getEntriesStorageKey(ownerEmail)) ?? getLegacyEntries(ownerEmail);
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

export function saveEntries(entries: DailyEntry[], ownerEmail?: string, emitEvent = true): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getEntriesStorageKey(ownerEmail), JSON.stringify(sortEntriesDesc(entries)));
  if (emitEvent) {
    dispatchEntriesChanged();
  }
}

export async function syncEntriesFromCloud(ownerEmail?: string): Promise<DailyEntry[]> {
  const context = await getCloudContext(ownerEmail);
  if (!context) {
    return loadEntries(ownerEmail);
  }

  const { data, error } = await context.client
    .from("daily_entries")
    .select("*")
    .eq("user_id", context.userId)
    .order("date", { ascending: false });

  if (error || !data) {
    return loadEntries(context.email);
  }

  const entries = data.map((row) => mapRowToDailyEntry(row as Parameters<typeof mapRowToDailyEntry>[0]));
  saveEntries(entries, context.email, false);
  return entries;
}

async function pushEntryToCloud(entry: DailyEntry, ownerEmail?: string): Promise<void> {
  const context = await getCloudContext(ownerEmail);
  if (!context) {
    return;
  }

  const row = mapDailyEntryToRow(entry, context.userId);
  const { error } = await context.client.from("daily_entries").upsert(row, {
    onConflict: "user_id,date"
  });

  if (!error) {
    await syncEntriesFromCloud(context.email);
  }
}

async function clearEntriesInCloud(ownerEmail?: string): Promise<void> {
  const context = await getCloudContext(ownerEmail);
  if (!context) {
    return;
  }

  const { error } = await context.client
    .from("daily_entries")
    .delete()
    .eq("user_id", context.userId);

  if (!error) {
    dispatchEntriesChanged();
  }
}

export function getEntryByDate(dateKey: string, ownerEmail?: string): DailyEntry | undefined {
  return loadEntries(ownerEmail).find((entry) => entry.date === dateKey);
}

export function upsertEntry(input: DailyEntryInput, dateKey = getTodayDateKey(), ownerEmail?: string): DailyEntry {
  const entries = loadEntries(ownerEmail);
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
  saveEntries(updated, ownerEmail);
  void pushEntryToCloud(nextEntry, ownerEmail);
  return nextEntry;
}

export function clearEntries(ownerEmail?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getEntriesStorageKey(ownerEmail);
  window.localStorage.removeItem(storageKey);

  const resolved = resolveOwnerEmail(ownerEmail);
  if (resolved) {
    const legacyEntries = window.localStorage.getItem(STORAGE_KEYS.legacyEntries);
    if (legacyEntries) {
      window.localStorage.removeItem(STORAGE_KEYS.legacyEntries);
    }
  }

  dispatchEntriesChanged();
  void clearEntriesInCloud(ownerEmail);
}
