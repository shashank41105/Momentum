"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/auth";

export function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill your name, email, and password.");
      return;
    }

    saveSession({
      name: trimmedName,
      email: trimmedEmail,
      loggedInAt: new Date().toISOString()
    });
    router.replace("/");
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="card-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Momentum MVP</p>
            <h1 className="headline-xl mt-2 max-w-4xl">Your whole day deserves one honest score.</h1>
            <p className="mt-5 max-w-2xl text-xl text-[var(--text-secondary)]">
              See how your work, gym, diet, and reflection shape your performance, then close the day with grounded
              insight.
            </p>
          </div>
          <span className="rounded-full bg-[var(--surface-soft)] px-5 py-3 text-lg text-[var(--text-secondary)]">
            Web-first daily performance tracker
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="card-panel p-6 sm:p-8">
          <p className="eyebrow">Onboarding</p>
          <h2 className="headline-lg mt-2">Set up your daily system</h2>
          <p className="mt-3 max-w-xl text-xl text-[var(--text-secondary)]">
            Keep the first experience lightweight while still making your score personal.
          </p>
          <ul className="mt-6 space-y-3 text-lg text-[var(--text-secondary)]">
            <li>1. Morning intent and top priorities</li>
            <li>2. Workday logging with focus and blockers</li>
            <li>3. End-of-day summary with one clear score</li>
          </ul>
        </article>

        <article className="card-panel p-6 sm:p-8">
          <p className="eyebrow">Login</p>
          <h2 className="headline-lg mt-2">Enter your workspace</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="login-name">
                Name
              </label>
              <input
                id="login-name"
                className="field-input"
                placeholder="Your Name"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-[#c7563d]">{error}</p> : null}

            <button type="submit" className="chip-control chip-control-active w-full text-base font-semibold">
              Continue
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}
