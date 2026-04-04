import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AuthSession, DailyEntry } from "@/lib/types";

type DailyEntryRow = {
  user_id: string;
  date: string;
  work: number;
  gym: number;
  diet: number;
  notes: string | null;
  top_priorities: string | null;
  intended_workout: string | null;
  intended_diet_goal: string | null;
  planned_tasks: string | null;
  completed_tasks: string | null;
  blockers: string | null;
  deep_work_hours: number | null;
  focus_rating: number | null;
  total: number;
  created_at: string;
  updated_at: string;
};

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
  }

  return browserClient;
}

export function createSupabaseAuthSession(user: User, session: Session | null): AuthSession {
  return {
    id: user.id,
    name:
      typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
          ? user.user_metadata.full_name.trim()
          : user.email?.split("@")[0] ?? "You",
    email: user.email ?? "",
    loggedInAt: session?.access_token ? new Date().toISOString() : new Date().toISOString(),
    provider: "supabase"
  };
}

export function mapDailyEntryToRow(entry: DailyEntry, userId: string): DailyEntryRow {
  return {
    user_id: userId,
    date: entry.date,
    work: entry.work,
    gym: entry.gym,
    diet: entry.diet,
    notes: entry.notes ?? "",
    top_priorities: entry.topPriorities ?? "",
    intended_workout: entry.intendedWorkout ?? "",
    intended_diet_goal: entry.intendedDietGoal ?? "",
    planned_tasks: entry.plannedTasks ?? "",
    completed_tasks: entry.completedTasks ?? "",
    blockers: entry.blockers ?? "",
    deep_work_hours: entry.deepWorkHours ?? 0,
    focus_rating: entry.focusRating ?? entry.work,
    total: entry.total,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt
  };
}

export function mapRowToDailyEntry(row: DailyEntryRow): DailyEntry {
  return {
    date: row.date,
    work: row.work,
    gym: row.gym,
    diet: row.diet,
    notes: row.notes ?? "",
    topPriorities: row.top_priorities ?? "",
    intendedWorkout: row.intended_workout ?? "",
    intendedDietGoal: row.intended_diet_goal ?? "",
    plannedTasks: row.planned_tasks ?? "",
    completedTasks: row.completed_tasks ?? "",
    blockers: row.blockers ?? "",
    deepWorkHours: row.deep_work_hours ?? 0,
    focusRating: row.focus_rating ?? row.work,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
