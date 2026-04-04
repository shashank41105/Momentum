"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearSession, loadSession } from "@/lib/auth";
import { formatDateLabel, getTodayDateKey } from "@/lib/date";
import { clearEntries, loadEntries } from "@/lib/storage";
import { calculateStreak } from "@/lib/streak";
import type { AuthSession, DailyEntry } from "@/lib/types";

type AppShellProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/", label: "Today" },
  { href: "/check-in", label: "Check In" },
  { href: "/history", label: "History" }
];

const pageCopy: Record<string, string> = {
  "/": "Keep the signal clear. Review today, decide the next move, and protect momentum.",
  "/check-in": "Set the day with intention, log the truth, and turn reflection into a repeatable system.",
  "/history": "Zoom out. Patterns matter more than individual spikes, and the long arc tells the truth."
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextSession = loadSession();
    setSession(nextSession);
    setEntries(loadEntries());
    setReady(true);

    if (!nextSession) {
      router.replace("/login");
      return;
    }
  }, [pathname, router]);

  const userFirstName = useMemo(() => {
    if (!session?.name) {
      return "You";
    }
    return session.name.split(" ")[0];
  }, [session?.name]);

  const today = getTodayDateKey();
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
  const pageMessage = pageCopy[pathname] ?? pageCopy["/"];

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  const handleResetApp = () => {
    clearEntries();
    setEntries([]);
    router.refresh();
  };

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-10">
        <header className="glass-header hero-panel mb-6 p-4 sm:p-6">
          <div className="shell-grid">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="shell-badge">
                  <span className="status-dot" />
                  Daily operating system
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="chip-control chip-control-ghost text-sm"
                >
                  Log out
                </button>
              </div>

              <div className="space-y-3">
                <p className="eyebrow">Momentum</p>
                <h1 className="headline-lg max-w-3xl">
                  {userFirstName}, keep the day simple enough to repeat.
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                  {pageMessage}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{formatDateLabel(today)}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="metric-pill">
                  <div>
                    <p className="metric-pill-label">Today</p>
                    <p className="metric-pill-value">{todayScore}/100</p>
                  </div>
                </div>
                <div className="metric-pill">
                  <div>
                    <p className="metric-pill-label">Streak</p>
                    <p className="metric-pill-value">{streak} day{streak === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <div className="metric-pill">
                  <div>
                    <p className="metric-pill-label">Average</p>
                    <p className="metric-pill-value">{averageScore}</p>
                  </div>
                </div>
              </div>

              <div className="section-divider" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav className="shell-nav" aria-label="Main navigation">
                  {links.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={active ? "chip-control chip-control-active" : "chip-control chip-control-ghost"}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={handleResetApp}
                  className="chip-control chip-control-ghost text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <aside className="glass-strip rounded-[1.6rem] p-5 sm:p-6">
              <p className="eyebrow">Live read</p>
              <div className="info-grid mt-4">
                <div className="info-tile">
                  <p className="info-tile-label">Current page</p>
                  <p className="info-tile-value">{links.find((link) => link.href === pathname)?.label ?? "Today"}</p>
                  <p className="info-tile-copy">Move between capture, review, and trend without losing context.</p>
                </div>
                <div className="info-tile">
                  <p className="info-tile-label">Entries tracked</p>
                  <p className="info-tile-value">{entries.length}</p>
                  <p className="info-tile-copy">A better system earns trust by making the history legible at a glance.</p>
                </div>
                <div className="info-tile">
                  <p className="info-tile-label">Today status</p>
                  <p className="info-tile-value">{todayEntry ? "Checked in" : "Not started"}</p>
                  <p className="info-tile-copy">
                    {todayEntry
                      ? "Your latest entry is already shaping today's narrative."
                      : "A two-minute check-in is enough to create direction."}
                  </p>
                </div>
                <div className="info-tile">
                  <p className="info-tile-label">Last reflection</p>
                  <p className="info-tile-value">
                    {todayEntry?.notes?.trim() ? `${Math.min(todayEntry.notes.trim().length, 80)} chars` : "Add signal"}
                  </p>
                  <p className="info-tile-copy">
                    Reflection turns raw tracking into a loop you can actually improve.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <main className="animate-fade-in flex-1">{children}</main>
      </div>
    </div>
  );
}
