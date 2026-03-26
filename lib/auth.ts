import { STORAGE_KEYS } from "@/lib/constants";
import type { AuthSession } from "@/lib/types";

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.name || !parsed.email || !parsed.loggedInAt) {
      return null;
    }
    return {
      name: parsed.name,
      email: parsed.email,
      loggedInAt: parsed.loggedInAt
    };
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.auth);
}
