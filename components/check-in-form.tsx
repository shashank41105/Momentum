"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatDateLabel, getTodayDateKey } from "@/lib/date";
import { getEntryByDate, loadEntries, upsertEntry } from "@/lib/storage";

type ScoreFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function ScoreField({ id, label, value, onChange }: ScoreFieldProps) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}: {value}/10
      </label>
      <input
        id={id}
        aria-label={label}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="field-range"
      />
    </div>
  );
}

function InsightList({ work, gym, diet, focusRating }: { work: number; gym: number; diet: number; focusRating: number }) {
  const tips = useMemo(() => {
    const lines = [];
    if (work < 6) {
      lines.push("Work is the first place to tighten tomorrow by reducing sprawl and clarifying priorities.");
    } else {
      lines.push("Work rhythm is solid, so keep your top 3 outcomes small and concrete tomorrow.");
    }
    if (gym < 6) {
      lines.push("A simpler workout target could make consistency easier without overwhelming the schedule.");
    } else {
      lines.push("Training momentum is healthy, so keep the same minimum standard tomorrow.");
    }
    if (diet < 6) {
      lines.push("Nutrition looks inconsistent, so prioritize one easy diet win you can repeat.");
    } else {
      lines.push("Diet discipline is helping your focus, so lock in the same meal structure tomorrow.");
    }
    if (focusRating < 6) {
      lines.push("A sharper evening review would turn this from activity tracking into actual feedback.");
    }
    return lines;
  }, [diet, focusRating, gym, work]);

  return (
    <ul className="mt-4 space-y-3 text-[1.06rem] leading-relaxed text-[var(--text-secondary)]">
      {tips.map((tip) => (
        <li key={tip}>• {tip}</li>
      ))}
    </ul>
  );
}

export function CheckInForm() {
  const todayDate = getTodayDateKey();
  const [work, setWork] = useState(5);
  const [gym, setGym] = useState(5);
  const [diet, setDiet] = useState(5);
  const [focusRating, setFocusRating] = useState(5);
  const [deepWorkHours, setDeepWorkHours] = useState(0);
  const [topPriorities, setTopPriorities] = useState("");
  const [intendedWorkout, setIntendedWorkout] = useState("");
  const [intendedDietGoal, setIntendedDietGoal] = useState("");
  const [plannedTasks, setPlannedTasks] = useState("");
  const [completedTasks, setCompletedTasks] = useState("");
  const [blockers, setBlockers] = useState("");
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [weeklyTracked, setWeeklyTracked] = useState(0);

  useEffect(() => {
    const existing = getEntryByDate(todayDate);
    if (existing) {
      setWork(existing.work);
      setGym(existing.gym);
      setDiet(existing.diet);
      setFocusRating(existing.focusRating ?? existing.work);
      setDeepWorkHours(existing.deepWorkHours ?? 0);
      setTopPriorities(existing.topPriorities ?? "");
      setIntendedWorkout(existing.intendedWorkout ?? "");
      setIntendedDietGoal(existing.intendedDietGoal ?? "");
      setPlannedTasks(existing.plannedTasks ?? "");
      setCompletedTasks(existing.completedTasks ?? "");
      setBlockers(existing.blockers ?? "");
      setNotes(existing.notes ?? "");
    }

    const history = loadEntries().slice(0, 7);
    setWeeklyTracked(history.length);
    if (!history.length) {
      setWeeklyAverage(0);
      return;
    }
    setWeeklyAverage(Math.round(history.reduce((sum, entry) => sum + entry.total, 0) / history.length));
  }, [todayDate]);

  const previewScore = useMemo(() => Math.round((work * 0.5 + gym * 0.25 + diet * 0.25) * 10), [work, gym, diet]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const savedEntry = upsertEntry({
      work,
      gym,
      diet,
      focusRating,
      deepWorkHours,
      topPriorities,
      intendedWorkout,
      intendedDietGoal,
      plannedTasks,
      completedTasks,
      blockers,
      notes
    });
    setSavedAt(new Date(savedEntry.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-6">
          <article className="card-panel p-6 sm:p-7">
            <p className="eyebrow">Morning</p>
            <h1 className="headline-lg mt-2">Check in</h1>
            <p className="mt-3 text-[1.3rem] text-[var(--text-secondary)]">Declare what matters before the day gets noisy.</p>
            <p className="mt-2 text-[var(--text-secondary)]">{formatDateLabel(todayDate)}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="top-priorities">
                  Top work priorities
                </label>
                <textarea
                  id="top-priorities"
                  className="field-area"
                  value={topPriorities}
                  onChange={(event) => setTopPriorities(event.target.value)}
                  placeholder="Ship client proposal&#10;Train legs&#10;Stay on meal plan"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="intended-workout">
                  Intended workout
                </label>
                <textarea
                  id="intended-workout"
                  className="field-area"
                  value={intendedWorkout}
                  onChange={(event) => setIntendedWorkout(event.target.value)}
                  placeholder="Push day, 45 minutes"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="intended-diet">
                Intended diet goal
              </label>
              <input
                id="intended-diet"
                className="field-input"
                value={intendedDietGoal}
                onChange={(event) => setIntendedDietGoal(event.target.value)}
                placeholder="Hit protein and avoid late-night snacking"
              />
            </div>
          </article>

          <article className="card-panel p-6 sm:p-7">
            <p className="eyebrow">Work</p>
            <h2 className="headline-lg mt-2">Log your work day</h2>
            <p className="mt-3 text-[1.3rem] text-[var(--text-secondary)]">Manual-first tracking keeps the loop fast and honest.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="planned-tasks">
                  Planned tasks
                </label>
                <textarea
                  id="planned-tasks"
                  className="field-area"
                  value={plannedTasks}
                  onChange={(event) => setPlannedTasks(event.target.value)}
                  placeholder="Design review&#10;Write landing page copy&#10;Reply to investors"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="completed-tasks">
                  Completed tasks
                </label>
                <textarea
                  id="completed-tasks"
                  className="field-area"
                  value={completedTasks}
                  onChange={(event) => setCompletedTasks(event.target.value)}
                  placeholder="Design review&#10;Reply to investors"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ScoreField
                id="work-focus"
                label="Work Focus"
                value={work}
                onChange={(value) => {
                  setWork(value);
                  setFocusRating(value);
                }}
              />
              <ScoreField id="gym-effort" label="Gym Effort" value={gym} onChange={setGym} />
              <ScoreField id="diet-discipline" label="Diet Discipline" value={diet} onChange={setDiet} />

              <div>
                <label className="field-label" htmlFor="deep-work-hours">
                  Deep work hours
                </label>
                <input
                  id="deep-work-hours"
                  type="number"
                  min={0}
                  max={12}
                  className="field-input"
                  value={deepWorkHours}
                  onChange={(event) => setDeepWorkHours(Number(event.target.value))}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="blockers">
                Blockers or interruptions
              </label>
              <textarea
                id="blockers"
                className="field-area"
                value={blockers}
                onChange={(event) => setBlockers(event.target.value)}
                placeholder="Meetings drifted, energy dipped after lunch..."
              />
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="card-panel p-6 sm:p-7">
            <p className="eyebrow">Insight</p>
            <h2 className="headline-lg mt-2">End-of-day summary</h2>
            <p className="mt-3 text-[1.3rem] text-[var(--text-secondary)]">
              Supportive AI-style guidance grounded in your actual entries.
            </p>
            <p className="mt-4 text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">
              The score suggests today felt fragmented, which makes tomorrow&apos;s reset and clearer intent especially
              important.
            </p>
            <InsightList work={work} gym={gym} diet={diet} focusRating={focusRating} />
          </article>

          <article className="card-panel p-6 sm:p-7">
            <p className="eyebrow">Weekly recap</p>
            <h2 className="headline-lg mt-2">Pattern signal</h2>
            <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">
              Your weekly pattern shows instability, which is useful because it points to habits that need
              simplification rather than more ambition.
            </p>
            <ul className="mt-4 space-y-3 text-[1.05rem] text-[var(--text-secondary)]">
              <li>• You tracked {weeklyTracked} day(s) this week.</li>
              <li>• Current weekly average score is {weeklyAverage}.</li>
              <li>• Preview score for today is {previewScore}.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="card-panel p-6 sm:p-7">
        <label className="field-label" htmlFor="reflection-notes">
          Reflection notes (optional)
        </label>
        <textarea
          id="reflection-notes"
          className="field-area"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What actually worked today, and what should be simplified tomorrow?"
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="chip-control chip-control-active text-base font-semibold">
            Save check-in
          </button>
          <span className="text-[var(--text-secondary)]">Preview score: {previewScore}/100</span>
          {savedAt ? <span className="text-[var(--text-secondary)]">Saved at {savedAt}</span> : null}
        </div>
      </section>
    </form>
  );
}
