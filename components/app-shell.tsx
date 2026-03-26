"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearSession, loadSession } from "@/lib/auth";
import { clearEntries } from "@/lib/storage";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AuthSession } from "@/lib/types";

type AppShellProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/", label: "Today" },
  { href: "/check-in", label: "Check In" },
  { href: "/history", label: "History" }
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextSession = loadSession();
    setSession(nextSession);
    setReady(true);

    if (pathname !== "/login" && !nextSession) {
      router.replace("/login");
      return;
    }

    if (pathname === "/login" && nextSession) {
      router.replace("/");
    }
  }, [pathname, router]);

  const userFirstName = useMemo(() => {
    if (!session?.name) {
      return "You";
    }
    return session.name.split(" ")[0];
  }, [session?.name]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  const handleResetApp = () => {
    clearEntries();
    router.refresh();
  };

  if (pathname === "/login") {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <div className="mx-auto flex w-full max-w-7xl justify-end px-4 pt-6 sm:px-8">
          <ThemeToggle />
        </div>
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8">{children}</main>
      </div>
    );
  }

  if (!ready || !session) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--text-secondary)] sm:px-8">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-8 lg:px-10">
        <header className="mb-5 rounded-3xl border border-[var(--card-border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Momentum MVP</p>
              <p className="text-sm text-[var(--text-secondary)]">{userFirstName}, build one honest day at a time.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button type="button" onClick={handleLogout} className="chip-control">
                Log out
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className={active ? "chip-control chip-control-active" : "chip-control"}>
                    {link.label}
                  </Link>
                );
              })}
              <button type="button" className="chip-control" disabled>
                Billing
              </button>
            </nav>

            <button type="button" onClick={handleResetApp} className="chip-control">
              Reset app
            </button>
          </div>
        </header>

        <main className="animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
