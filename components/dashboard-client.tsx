"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadSession } from "@/lib/auth";
import { formatDateLabel, getTodayDateKey } from "@/lib/date";
import { loadEntries } from "@/lib/storage";
import { calculateStreak } from "@/lib/streak";
import type { AuthSession, DailyEntry } from "@/lib/types";

function ScoreRing({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const clamped = Math.min(100, Math.max(0, score));
  const degrees = clamped * 3.6;
  const isLarge = size === "lg";

  return (
    <div className="space-y-3 text-center">
      <div
        className="score-ring-outer mx-auto"
        style={{
          width: isLarge ? "11rem" : "7rem",
          height: isLarge ? "11rem" : "7rem",
          background: `conic-gradient(var(--accent) ${degrees}deg, var(--surface-muted) ${degrees}deg)`
        }}
      >
        <div
          className="score-ring-inner"
          style={{
            width: isLarge ? "8.5rem" : "5.25rem",
            height: isLarge ? "8.5rem" : "5.25rem"
          }}
        >
          <div>
            <p
              className={`font-display leading-none ${isLarge ? "text-5xl font-extrabold" : "text-2xl font-bold"}`}
            >
              {score}
            </p>
            <p
              className={`text-[var(--text-secondary)] ${isLarge ? "-mt-1 text-sm" : "-mt-0.5 text-[0.65rem]"}`}
            >
              {isLarge ? "Daily score" : "score"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  delay
}: {
  label: string;
  value: number;
  delay: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[0.95rem]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-display font-bold">{value}</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: mounted ? `${value}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  copy,
  delayClass
}: {
  value: number | string;
  label: string;
  copy: string;
  delayClass: string;
}) {
  return (
    <div className={`stat-card ${delayClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold leading-none">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{copy}</p>
    </div>
  );
}

function RecentEntryCard({ entry }: { entry: DailyEntry }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-soft)_88%,transparent)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {formatDateLabel(entry.date)}
          </p>
          <p className="mt-2 font-display text-2xl font-bold">{entry.total}</p>
        </div>
        <ScoreRing score={entry.total} size="sm" />
      </div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Work {entry.work} / Gym {entry.gym} / Diet {entry.diet}
      </p>
    </div>
  );
}

export function DashboardClient() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const today = getTodayDateKey();

  useEffect(() => {
    setEntries(loadEntries());
    setSession(loadSession());
  }, []);

  const todayEntry = useMemo(
    () => entries.find((entry) => entry.date === today),
    [entries, today]
  );
  const todayScore = todayEntry?.total ?? 0;
  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const averageScore = useMemo(() => {
    if (!entries.length) {
      return 0;
    }
    return Math.round(entries.reduce((sum, entry) => sum + entry.total, 0) / entries.length);
  }, [entries]);
  const bestScore = useMemo(() => {
    if (!entries.length) {
      return 0;
    }
    return Math.max(...entries.map((entry) => entry.total));
  }, [entries]);
  const reflection = todayEntry?.notes?.trim()
    ? Math.min(100, todayEntry.notes.trim().length * 2)
    : 15;
  const recentEntries = useMemo(() => entries.slice(0, 3), [entries]);
  const readiness = todayScore >= 75 ? "Locked in" : todayScore >= 50 ? "Building momentum" : "Needs a reset";
  const readinessCopy = todayEntry
    ? "You already captured today's truth. Use it to decide tomorrow's smallest win."
    : "No entry yet, which means the easiest leverage is still available: a simple check-in.";
  const firstName = session?.name.split(" ")[0] ?? "You";

  return (
    <div className="space-y-6">
      <section className="card-panel hero-panel px-6 py-8 sm:px-9 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div className="animate-fade-in space-y-6">
            <div className="space-y-4">
              <p className="eyebrow">Today</p>
              <h1 className="headline-xl max-w-3xl">
                {firstName}, make today clean enough to trust.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
                One operating view for intention, score, and drift. The goal is not more data. It is better signal.
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{formatDateLabel(today)}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Readiness</p>
                  <p className="metric-pill-value">{readiness}</p>
                </div>
              </div>
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Streak</p>
                  <p className="metric-pill-value">{streak} days</p>
                </div>
              </div>
              <div className="metric-pill">
                <div>
                  <p className="metric-pill-label">Best</p>
                  <p className="metric-pill-value">{bestScore}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/check-in"
                className="chip-control chip-control-active mt-1 inline-flex text-base"
              >
                {todayEntry ? "Update check-in" : "Start today's check-in"}
              </Link>
              <Link href="/history" className="chip-control chip-control-ghost mt-1 inline-flex text-base">
                Review history
              </Link>
            </div>
          </div>

          <div className="score-card animate-fade-in-delay-1 p-6 sm:p-7">
            <ScoreRing score={todayScore} />
            <div className="mt-5 rounded-2xl bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Today's Score</p>
              <p className="mt-2 font-display text-4xl font-bold">{todayScore}/100</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{readinessCopy}</p>
            </div>
          </div>

          <div className="card-panel animate-fade-in-delay-2 p-6 sm:p-7">
            <p className="eyebrow">Operating notes</p>
            <h2 className="headline-md mt-3">What this dashboard should tell you</h2>
            <div className="timeline-list mt-6">
              <div className="timeline-item">
                <span className="timeline-marker" />
                <div>
                  <p className="timeline-title">Capture the truth early</p>
                  <p className="timeline-copy">A short morning intent creates leverage for the rest of the day.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-marker" />
                <div>
                  <p className="timeline-title">Watch drift, not just output</p>
                  <p className="timeline-copy">Average score and streak reveal whether the system is sustainable.</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-marker" />
                <div>
                  <p className="timeline-title">Close the loop with reflection</p>
                  <p className="timeline-copy">A few honest notes make tomorrow easier to simplify.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="card-panel animate-fade-in-delay-1 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Score</p>
              <h2 className="headline-lg mt-3">Daily breakdown</h2>
              <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
                A weighted model helps you see whether the day is genuinely strong or just noisy.
              </p>
            </div>
            <div className="mini-kpi rounded-[1.2rem] px-4 py-3">
              <p className="mini-kpi-label">Average score</p>
              <p className="mini-kpi-value">{averageScore}</p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <BreakdownRow
              label="Work"
              value={Math.round((todayEntry?.work ?? 0) * 10)}
              delay={100}
            />
            <BreakdownRow
              label="Gym"
              value={Math.round((todayEntry?.gym ?? 0) * 10)}
              delay={200}
            />
            <BreakdownRow
              label="Diet"
              value={Math.round((todayEntry?.diet ?? 0) * 10)}
              delay={300}
            />
            <BreakdownRow label="Reflection" value={reflection} delay={400} />
          </div>
        </article>

        <article className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
          <p className="eyebrow">Signals</p>
          <h2 className="headline-lg mt-3">Pattern board</h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Metrics should tell you what to protect, what to simplify, and what to repeat.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <StatCard
              value={entries.length}
              label="days tracked"
              copy="Consistency starts with simply showing up."
              delayClass="animate-fade-in-delay-1"
            />
            <StatCard
              value={bestScore}
              label="best score"
              copy="A high day is only useful if you can understand why it worked."
              delayClass="animate-fade-in-delay-2"
            />
            <StatCard
              value={streak}
              label="day streak"
              copy="Momentum is fragile, so the interface should defend it."
              delayClass="animate-fade-in-delay-3"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
          <p className="eyebrow">Next move</p>
          <h2 className="headline-lg mt-3">Recommended action</h2>
          <div className="mini-kpi-grid mt-6">
            <div className="mini-kpi">
              <p className="mini-kpi-label">If score is low</p>
              <p className="mini-kpi-value">Reduce scope</p>
              <p className="mini-kpi-copy">Pick one work target, one workout minimum, and one nutrition non-negotiable.</p>
            </div>
            <div className="mini-kpi">
              <p className="mini-kpi-label">If score is high</p>
              <p className="mini-kpi-value">Protect rhythm</p>
              <p className="mini-kpi-copy">Use the same structure tomorrow instead of chasing a bigger, noisier day.</p>
            </div>
          </div>
        </article>

        <article className="card-panel animate-fade-in-delay-3 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Recent entries</p>
              <h2 className="headline-lg mt-3">Fast review</h2>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
              latest 3
            </span>
          </div>

          {recentEntries.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recentEntries.map((entry) => (
                <RecentEntryCard key={entry.date} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--line)] px-6 py-10 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Your recent entries will appear here once you complete the first check-in.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
