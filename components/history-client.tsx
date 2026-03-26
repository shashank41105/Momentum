"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateLabel } from "@/lib/date";
import { loadEntries } from "@/lib/storage";
import type { DailyEntry } from "@/lib/types";

function TrendBars({ entries }: { entries: DailyEntry[] }) {
  const points = useMemo(() => [...entries].slice(0, 30).reverse(), [entries]);

  return (
    <div className="card-panel p-6 sm:p-7">
      <p className="eyebrow">Trend</p>
      <h2 className="headline-lg mt-2">Last 30 days</h2>
      <div className="mt-6 flex h-44 items-end gap-2 rounded-2xl bg-[var(--surface-soft)] p-4">
        {points.length ? (
          points.map((entry) => (
            <div
              key={entry.date}
              title={`${entry.date}: ${entry.total}`}
              className="flex-1 rounded-md bg-[var(--accent)]"
              style={{ height: `${Math.max(10, entry.total)}%` }}
            />
          ))
        ) : (
          <p className="text-[var(--text-secondary)]">No trend data yet. Start with your first check-in.</p>
        )}
      </div>
    </div>
  );
}

export function HistoryClient() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  return (
    <div className="space-y-6">
      <section className="card-panel p-6 sm:p-8">
        <p className="eyebrow">History</p>
        <h1 className="headline-lg mt-2">Review your pattern signal</h1>
        <p className="mt-4 max-w-3xl text-[1.25rem] text-[var(--text-secondary)]">
          Use this view to scan consistency, check weekly drift, and see where your best days are coming from.
        </p>
      </section>

      <TrendBars entries={entries} />

      <section className="card-panel p-6 sm:p-7">
        <p className="eyebrow">Entries</p>
        <h2 className="headline-lg mt-2">Day-by-day ledger</h2>

        {entries.length ? (
          <ul className="mt-6 space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.date}
                className="grid grid-cols-[1fr_auto] items-center rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <span className="text-[var(--text-secondary)]">{formatDateLabel(entry.date)}</span>
                <span className="justify-self-end text-[var(--text-secondary)] sm:justify-self-center">
                  Work {entry.work}, Gym {entry.gym}, Diet {entry.diet}
                </span>
                <span className="justify-self-end font-semibold">{entry.total}/100</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-[var(--text-secondary)]">No entries yet.</p>
        )}
      </section>
    </div>
  );
}
