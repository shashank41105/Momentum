"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadSession } from "@/lib/auth";
import { formatDateLabel, getTodayDateKey } from "@/lib/date";
import { loadEntries } from "@/lib/storage";
import { calculateStreak } from "@/lib/streak";
import type { AuthSession, DailyEntry } from "@/lib/types";

function ScoreRing({ score }: { score: number }) {
  const degrees = Math.min(100, Math.max(0, score)) * 3.6;
  return (
    <div className="mx-auto space-y-3 text-center">
      <div
        className="grid h-44 w-44 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--accent) ${degrees}deg, var(--surface-muted) ${degrees}deg)`
        }}
      >
        <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--surface)]">
          <p className="font-display text-6xl leading-none">{score}</p>
          <p className="-mt-2 text-sm text-[var(--text-secondary)]">Daily score</p>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[1.1rem]">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
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

  const todayEntry = useMemo(() => entries.find((entry) => entry.date === today), [entries, today]);
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
  const reflection = todayEntry?.notes?.trim() ? Math.min(100, todayEntry.notes.trim().length * 2) : 15;

  return (
    <div className="space-y-6">
      <section className="card-panel px-6 py-7 sm:px-8 sm:py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Today</p>
            <h1 className="headline-xl mt-2 max-w-4xl">
              {(session?.name.split(" ")[0] ?? "You")}, build a day that compounds.
            </h1>
            <p className="mt-5 max-w-2xl text-[1.75rem] leading-snug text-[var(--text-secondary)]">
              Morning intent, simple logging, evening reflection, and one score that explains how the full day actually
              went.
            </p>
            <p className="mt-4 text-[var(--text-secondary)]">{formatDateLabel(today)}</p>
            <Link href="/check-in" className="chip-control chip-control-active mt-5 inline-flex text-base">
              {todayEntry ? "Update check-in" : "Start today check-in"}
            </Link>
          </div>

          <div className="space-y-3">
            <ScoreRing score={todayScore} />
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-center">
              <p className="text-sm text-[var(--text-secondary)]">Today's Score</p>
              <p className="font-display text-4xl">{todayScore}/100</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card-panel p-6 sm:p-8">
          <p className="eyebrow">Score</p>
          <h2 className="headline-lg mt-2">Daily breakdown</h2>
          <p className="mt-3 text-xl text-[var(--text-secondary)]">A fixed model keeps the score legible and easy to trust.</p>
          <div className="mt-6 space-y-5">
            <BreakdownRow label="Work" value={Math.round((todayEntry?.work ?? 0) * 10)} />
            <BreakdownRow label="Gym" value={Math.round((todayEntry?.gym ?? 0) * 10)} />
            <BreakdownRow label="Diet" value={Math.round((todayEntry?.diet ?? 0) * 10)} />
            <BreakdownRow label="Reflection" value={reflection} />
          </div>
        </article>

        <article className="card-panel p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Signals</p>
              <h2 className="headline-lg mt-2">This week at a glance</h2>
            </div>
            <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm text-[var(--text-secondary)]">
              {averageScore} avg
            </span>
          </div>
          <p className="mt-3 text-xl text-[var(--text-secondary)]">A fast read on consistency before you dive into detail.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="font-display text-4xl">{entries.length}</p>
              <p className="text-lg text-[var(--text-secondary)]">days tracked</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="font-display text-4xl">{bestScore}</p>
              <p className="text-lg text-[var(--text-secondary)]">best score</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="font-display text-4xl">{streak}</p>
              <p className="text-lg text-[var(--text-secondary)]">day streak</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
