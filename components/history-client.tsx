"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateLabel } from "@/lib/date";
import { loadEntries } from "@/lib/storage";
import type { DailyEntry } from "@/lib/types";

function TrendBars({ entries }: { entries: DailyEntry[] }) {
  const points = useMemo(
    () => [...entries].slice(0, 30).reverse(),
    [entries]
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Trend</p>
          <h2 className="headline-lg mt-3">Last 30 days</h2>
        </div>
        <div className="mini-kpi rounded-[1.15rem] px-4 py-3">
          <p className="mini-kpi-label">Reading mode</p>
          <p className="mini-kpi-value">Pattern over noise</p>
        </div>
      </div>

      <div className="chart-shell mt-6 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          <span>Low</span>
          <span>Signal strength</span>
          <span>High</span>
        </div>
        <div className="flex h-56 items-end gap-1 rounded-2xl bg-[color-mix(in_srgb,var(--surface-soft)_78%,transparent)] p-4 sm:gap-1.5">
          {points.length ? (
            points.map((entry, i) => (
              <div
                key={entry.date}
                title={`${formatDateLabel(entry.date)}: ${entry.total}/100`}
                className="trend-bar"
                style={{
                  height: mounted ? `${Math.max(8, entry.total)}%` : "0%",
                  transitionDelay: `${i * 30}ms`
                }}
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-[var(--text-secondary)]">
                No trend data yet. Start with your first check-in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = "var(--accent)";
  if (score >= 75) {
    color = "var(--success)";
  } else if (score < 50) {
    color = "var(--danger)";
  }

  return (
    <span
      className="inline-flex h-8 w-16 items-center justify-center rounded-full font-display text-sm font-bold"
      style={{
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color
      }}
    >
      {score}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  copy
}: {
  label: string;
  value: string | number;
  copy: string;
}) {
  return (
    <div className="mini-kpi">
      <p className="mini-kpi-label">{label}</p>
      <p className="mini-kpi-value">{value}</p>
      <p className="mini-kpi-copy">{copy}</p>
    </div>
  );
}

export function HistoryClient() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const averageScore = useMemo(() => {
    if (!entries.length) {
      return 0;
    }
    return Math.round(entries.reduce((sum, entry) => sum + entry.total, 0) / entries.length);
  }, [entries]);
  const bestRun = useMemo(() => {
    if (!entries.length) {
      return 0;
    }
    return Math.max(...entries.map((entry) => entry.total));
  }, [entries]);
  const latest = entries[0];

  return (
    <div className="space-y-6">
      <section className="card-panel hero-panel animate-fade-in p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">History</p>
            <h1 className="headline-lg mt-3">Review the system, not just the score.</h1>
            <p className="mt-3 max-w-3xl text-[var(--text-secondary)]">
              This view is now tuned for pattern recognition: where momentum is holding, where it is slipping, and what the ledger says about repeatability.
            </p>
          </div>

          <div className="mini-kpi-grid">
            <SummaryCard
              label="Entries"
              value={entries.length}
              copy="Volume matters only if the data stays honest and usable."
            />
            <SummaryCard
              label="Average"
              value={averageScore}
              copy="The average is the cleanest summary of your real operating baseline."
            />
          </div>
        </div>
      </section>

      <div className="animate-fade-in-delay-1">
        <TrendBars entries={entries} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
          <p className="eyebrow">Snapshot</p>
          <h2 className="headline-lg mt-3">Ledger summary</h2>
          <div className="mini-kpi-grid mt-6">
            <SummaryCard
              label="Best score"
              value={bestRun}
              copy="Your highest day is useful when you can reverse-engineer what made it stable."
            />
            <SummaryCard
              label="Latest entry"
              value={latest ? formatDateLabel(latest.date) : "None yet"}
              copy="Recent context helps you interpret whether the trend is strengthening or softening."
            />
          </div>
        </article>

        <section className="card-panel animate-fade-in-delay-2 p-6 sm:p-8">
          <p className="eyebrow">Entries</p>
          <h2 className="headline-lg mt-3">Day-by-day ledger</h2>

          {entries.length ? (
            <ul className="mt-6 space-y-3">
              {entries.map((entry, i) => (
                <li
                  key={entry.date}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[1.4rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-soft)_88%,transparent)] px-5 py-4 transition-transform duration-150 hover:-translate-y-0.5 sm:grid-cols-[1fr_1fr_auto]"
                  style={{
                    animationDelay: `${i * 40}ms`
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">
                      {formatDateLabel(entry.date)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Work {entry.work} / Gym {entry.gym} / Diet {entry.diet}
                    </p>
                  </div>
                  <p className="hidden text-sm leading-relaxed text-[var(--text-secondary)] sm:block">
                    {entry.notes?.trim()
                      ? entry.notes.slice(0, 90)
                      : "No reflection saved for this day."}
                  </p>
                  <ScoreBadge score={entry.total} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] py-10">
              <div className="h-12 w-12 rounded-full bg-[var(--surface-muted)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                No entries yet. Start your first check-in to see data here.
              </p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
