"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { APP_EVENTS } from "@/lib/constants";
import { loadSession } from "@/lib/auth";
import { formatDateLabel, getTodayDateKey } from "@/lib/date";
import { getEntryByDate, loadEntries, syncEntriesFromCloud, upsertEntry } from "@/lib/storage";

type ScoreFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function ScoreField({ id, label, value, onChange }: ScoreFieldProps) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-soft)_88%,transparent)] p-4">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          aria-label={label}
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="field-range flex-1"
        />
        <span className="w-10 text-right font-display text-lg font-bold">{value}</span>
      </div>
    </div>
  );
}

function ScoreRingSmall({ score }: { score: number }) {
  const degrees = Math.min(100, Math.max(0, score)) * 3.6;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="score-ring-outer"
        style={{
          width: "6.25rem",
          height: "6.25rem",
          background: `conic-gradient(var(--accent) ${degrees}deg, var(--surface-muted) ${degrees}deg)`
        }}
      >
        <div
          className="score-ring-inner"
          style={{ width: "4.65rem", height: "4.65rem" }}
        >
          <p className="font-display text-xl font-bold leading-none">{score}</p>
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Preview</p>
    </div>
  );
}

function InsightList({
  work,
  gym,
  diet,
  focusRating
}: {
  work: number;
  gym: number;
  diet: number;
  focusRating: number;
}) {
  const tips = useMemo(() => {
    const lines = [];
    if (work < 6) {
      lines.push("Work is the first place to simplify tomorrow. Cut scope and clarify one clean outcome.");
    } else {
      lines.push("Work rhythm looks solid. Protect it by keeping tomorrow's priorities narrow and concrete.");
    }
    if (gym < 6) {
      lines.push("Training consistency can improve with a smaller minimum standard that is easy to repeat.");
    } else {
      lines.push("Gym momentum is healthy. Repeat the same structure instead of chasing a harder plan.");
    }
    if (diet < 6) {
      lines.push("Nutrition is creating drag. Choose one repeatable food rule for tomorrow and hold it.");
    } else {
      lines.push("Diet discipline is helping the rest of the system. Preserve the same meal rhythm.");
    }
    if (focusRating < 6) {
      lines.push("Your reflection needs more specificity. A sharper note will make tomorrow easier to improve.");
    }
    return lines;
  }, [diet, focusRating, gym, work]);

  return (
    <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
      {tips.map((tip) => (
        <li key={tip} className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{tip}</span>
        </li>
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
    const syncFormState = async () => {
      const ownerEmail = loadSession()?.email;
      let history = loadEntries(ownerEmail);

      if (ownerEmail) {
        history = await syncEntriesFromCloud(ownerEmail);
      }

      const existing = history.find((entry) => entry.date === todayDate) ?? getEntryByDate(todayDate, ownerEmail);
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
      } else {
        setWork(5);
        setGym(5);
        setDiet(5);
        setFocusRating(5);
        setDeepWorkHours(0);
        setTopPriorities("");
        setIntendedWorkout("");
        setIntendedDietGoal("");
        setPlannedTasks("");
        setCompletedTasks("");
        setBlockers("");
        setNotes("");
      }

      const recentHistory = history.slice(0, 7);
      setWeeklyTracked(recentHistory.length);
      if (!recentHistory.length) {
        setWeeklyAverage(0);
      } else {
        setWeeklyAverage(
          Math.round(
            recentHistory.reduce((sum, entry) => sum + entry.total, 0) / recentHistory.length
          )
        );
      }
    };

    void syncFormState();

    const handleStorage = () => {
      void syncFormState();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(APP_EVENTS.authChanged, handleStorage);
    window.addEventListener(APP_EVENTS.entriesChanged, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(APP_EVENTS.authChanged, handleStorage);
      window.removeEventListener(APP_EVENTS.entriesChanged, handleStorage);
    };
  }, [todayDate]);

  const previewScore = useMemo(
    () => Math.round((work * 0.5 + gym * 0.25 + diet * 0.25) * 10),
    [work, gym, diet]
  );
  const direction = previewScore >= 75 ? "Strong day forming" : previewScore >= 50 ? "Recoverable day" : "Needs simplification";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ownerEmail = loadSession()?.email;
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
    }, todayDate, ownerEmail);
    setSavedAt(
      new Date(savedEntry.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="card-panel hero-panel px-6 py-8 sm:px-8 sm:py-9">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <p className="eyebrow">Check-in</p>
              <h1 className="headline-lg mt-3">Design the day before the day designs you.</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                This flow is now structured around intention, honest tracking, and a clearer live read of the day you are actually building.
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{formatDateLabel(todayDate)}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Preview score</p>
                  <p className="metric-pill-value">{previewScore}</p>
                </div>
              </div>
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Direction</p>
                  <p className="metric-pill-value">{direction}</p>
                </div>
              </div>
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Deep work goal</p>
                  <p className="metric-pill-value">{deepWorkHours}h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="score-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Live read</p>
                <h2 className="headline-md mt-2">Today is shaping into</h2>
              </div>
              <ScoreRingSmall score={previewScore} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{direction}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Strong interfaces should help you decide, not just fill fields. This panel keeps the feedback immediate while you log the day.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="section-grid">
          <article className="card-panel animate-fade-in p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Plan</p>
                <h2 className="headline-lg mt-3">Morning intent</h2>
                <p className="mt-2 text-[var(--text-secondary)]">
                  Declare what matters before the day gets noisy.
                </p>
              </div>
              <div className="mini-kpi rounded-[1.15rem] px-4 py-3">
                <p className="mini-kpi-label">Primary rule</p>
                <p className="mini-kpi-value">Keep scope narrow</p>
              </div>
            </div>

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
                  placeholder={"Ship client proposal\nTrain legs\nStay on meal plan"}
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

          <article className="card-panel animate-fade-in-delay-1 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Track</p>
                <h2 className="headline-lg mt-3">Log the workday</h2>
                <p className="mt-2 text-[var(--text-secondary)]">
                  Manual-first tracking keeps the loop fast, legible, and honest.
                </p>
              </div>
              <div className="mini-kpi rounded-[1.15rem] px-4 py-3">
                <p className="mini-kpi-label">Focus signal</p>
                <p className="mini-kpi-value">{work}/10</p>
              </div>
            </div>

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
                  placeholder={"Design review\nWrite landing page copy\nReply to investors"}
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
                  placeholder={"Design review\nReply to investors"}
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
              <ScoreField
                id="gym-effort"
                label="Gym Effort"
                value={gym}
                onChange={setGym}
              />
              <ScoreField
                id="diet-discipline"
                label="Diet Discipline"
                value={diet}
                onChange={setDiet}
              />
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-soft)_88%,transparent)] p-4">
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
                  onChange={(event) =>
                    setDeepWorkHours(Number(event.target.value))
                  }
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

          <article className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
            <p className="eyebrow">Reflect</p>
            <h2 className="headline-lg mt-3">Close the loop</h2>
            <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">
              Reflection notes are where raw tracking becomes actual learning.
            </p>

            <div className="mt-6">
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
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="chip-control chip-control-active px-6 py-2.5 text-base font-semibold"
              >
                Save check-in
              </button>
              <span className="font-display text-lg font-bold">
                {previewScore}/100
              </span>
              {savedAt ? (
                <span className="text-sm text-[var(--text-secondary)]">
                  Saved at {savedAt}
                </span>
              ) : null}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="card-panel animate-fade-in-delay-1 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Preview</p>
                <h2 className="headline-md mt-2">Live score</h2>
              </div>
              <ScoreRingSmall score={previewScore} />
            </div>

            <div className="mini-kpi-grid mt-6">
              <div className="mini-kpi">
                <p className="mini-kpi-label">Work</p>
                <p className="mini-kpi-value">{work}/10</p>
                <p className="mini-kpi-copy">The strongest weight in the model, so keep it honest.</p>
              </div>
              <div className="mini-kpi">
                <p className="mini-kpi-label">Gym + diet</p>
                <p className="mini-kpi-value">{Math.round((gym + diet) / 2)}/10</p>
                <p className="mini-kpi-copy">Recovery and discipline support the work signal, not compete with it.</p>
              </div>
            </div>
          </article>

          <article className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
            <p className="eyebrow">Insight</p>
            <h2 className="headline-lg mt-3">End-of-day summary</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Supportive guidance grounded in your actual entries.
            </p>
            <InsightList
              work={work}
              gym={gym}
              diet={diet}
              focusRating={focusRating}
            />
          </article>

          <article className="card-panel animate-fade-in-delay-3 p-6 sm:p-8">
            <p className="eyebrow">Weekly recap</p>
            <h2 className="headline-lg mt-3">Pattern signal</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Your weekly pattern should tell you what to simplify rather than where to add more pressure.
            </p>
            <div className="mini-kpi-grid mt-6">
              <div className="mini-kpi">
                <p className="mini-kpi-label">Tracked</p>
                <p className="mini-kpi-value">{weeklyTracked} days</p>
                <p className="mini-kpi-copy">Volume matters less than the signal quality you can sustain.</p>
              </div>
              <div className="mini-kpi">
                <p className="mini-kpi-label">Weekly average</p>
                <p className="mini-kpi-value">{weeklyAverage}</p>
                <p className="mini-kpi-copy">This is the best early read on whether the system is actually working.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </form>
  );
}
