"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateAccount, loadSession } from "@/lib/auth";

const highlights = [
  {
    label: "Plan",
    title: "Set a narrow direction",
    copy: "Start with a short morning intent so the rest of the interface has something real to measure."
  },
  {
    label: "Track",
    title: "Capture the truth",
    copy: "Work, gym, diet, and blockers stay visible in one system instead of getting scattered."
  },
  {
    label: "Reflect",
    title: "Close the feedback loop",
    copy: "End the day with a clean score and notes that make tomorrow easier to simplify."
  }
];

export function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loadSession()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please fill your email and password.");
      return;
    }

    setError("");

    try {
      await authenticateAccount({
        name: trimmedName,
        email: trimmedEmail,
        password
      });
      router.replace("/");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to access this workspace.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid items-stretch gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="card-panel hero-panel animate-fade-in overflow-hidden px-7 py-8 sm:px-9 sm:py-10">
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="shell-badge">
                  <span className="status-dot" />
                  Momentum
                </span>
                <div className="space-y-4">
                  <h1 className="headline-xl max-w-3xl">
                    Your whole day deserves one honest score.
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
                    Use a cleaner operating system for daily performance: intention first, honest tracking next, and a review that helps you actually improve.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="metric-pill">
                    <div>
                      <p className="metric-pill-label">Built for</p>
                      <p className="metric-pill-value">Focused days</p>
                    </div>
                  </div>
                  <div className="metric-pill">
                    <div>
                      <p className="metric-pill-label">Signal</p>
                      <p className="metric-pill-value">Work, gym, diet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-grid">
                <div className="section-divider" />
                <div className="grid gap-4 md:grid-cols-3">
                  {highlights.map((item) => (
                    <article
                      key={item.label}
                      className="rounded-[1.35rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-soft)_82%,transparent)] p-5"
                    >
                      <p className="eyebrow">{item.label}</p>
                      <h2 className="mt-4 font-display text-2xl font-bold leading-tight">
                        {item.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {item.copy}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card-panel animate-fade-in-delay-1 px-7 py-8 sm:px-9 sm:py-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="eyebrow">Login</p>
                <h2 className="headline-lg">Enter your workspace</h2>
                <p className="text-[var(--text-secondary)]">
                  Start the day in a calmer interface with stronger hierarchy and clearer feedback.
                </p>
              </div>

              <div className="mini-kpi-grid">
                <div className="mini-kpi">
                  <p className="mini-kpi-label">Flow</p>
                  <p className="mini-kpi-value">Plan to review</p>
                  <p className="mini-kpi-copy">Everything stays connected, so the score actually means something.</p>
                </div>
                <div className="mini-kpi">
                  <p className="mini-kpi-label">Time</p>
                  <p className="mini-kpi-value">2 minute setup</p>
                  <p className="mini-kpi-copy">Enough friction to stay honest, not enough to slow you down.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="field-label" htmlFor="login-name">
                    Name
                  </label>
                  <input
                    id="login-name"
                    className="field-input"
                    placeholder="Needed for first setup"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="field-input"
                    placeholder="you@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="field-input"
                    placeholder="At least 8 characters"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                {error ? (
                  <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="submit"
                    className="chip-control chip-control-active min-w-[11rem] px-6 py-3 text-base font-semibold"
                  >
                    Continue
                  </button>
                  <p className="text-sm text-[var(--text-secondary)]">
                    First visit creates a local workspace. Returning visits use the same email and password.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
