export type DailyEntry = {
  date: string;
  work: number;
  gym: number;
  diet: number;
  notes?: string;
  topPriorities?: string;
  intendedWorkout?: string;
  intendedDietGoal?: string;
  plannedTasks?: string;
  completedTasks?: string;
  blockers?: string;
  deepWorkHours?: number;
  focusRating?: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type ScoreBreakdown = {
  workWeight: number;
  gymWeight: number;
  dietWeight: number;
  total: number;
};

export type DailyEntryInput = {
  work: number;
  gym: number;
  diet: number;
  notes?: string;
  topPriorities?: string;
  intendedWorkout?: string;
  intendedDietGoal?: string;
  plannedTasks?: string;
  completedTasks?: string;
  blockers?: string;
  deepWorkHours?: number;
  focusRating?: number;
};

export type AuthSession = {
  name: string;
  email: string;
  loggedInAt: string;
};
