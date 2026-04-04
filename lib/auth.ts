import { APP_EVENTS, STORAGE_KEYS } from "@/lib/constants";
import { createSupabaseAuthSession, getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { AuthSession, LocalAccount } from "@/lib/types";

function dispatchAuthChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(APP_EVENTS.authChanged));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeAccount(raw: Partial<LocalAccount>): LocalAccount | null {
  if (!raw.name || !raw.email || !raw.passwordHash || !raw.createdAt || !raw.updatedAt) {
    return null;
  }

  return {
    name: raw.name,
    email: normalizeEmail(raw.email),
    passwordHash: raw.passwordHash,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

function loadAccounts(): LocalAccount[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.accounts);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalAccount>[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeAccount(item))
      .filter((item): item is LocalAccount => item !== null);
  } catch {
    return [];
  }
}

function saveAccounts(accounts: LocalAccount[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

async function hashPassword(password: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Secure password hashing is unavailable in this browser.");
  }

  const buffer = await subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function createSession(account: Pick<LocalAccount, "name" | "email">, loggedInAt: string): AuthSession {
  return {
    name: account.name,
    email: normalizeEmail(account.email),
    loggedInAt,
    provider: "local"
  };
}

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
      id: typeof parsed.id === "string" ? parsed.id : undefined,
      name: parsed.name,
      email: normalizeEmail(parsed.email),
      loggedInAt: parsed.loggedInAt,
      provider: parsed.provider === "supabase" ? "supabase" : "local"
    };
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.auth,
    JSON.stringify({
      ...session,
      email: normalizeEmail(session.email)
    })
  );
  dispatchAuthChanged();
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentSession = loadSession();
  window.localStorage.removeItem(STORAGE_KEYS.auth);
  if (currentSession?.provider === "supabase" && isSupabaseConfigured()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      void client.auth.signOut();
    }
  }
  dispatchAuthChanged();
}

export async function authenticateAccount(input: {
  name?: string;
  email: string;
  password: string;
}): Promise<{ session: AuthSession; created: boolean }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseBrowserClient();
    if (!client) {
      throw new Error("Supabase is configured incorrectly.");
    }

    const email = normalizeEmail(input.email);
    const password = input.password;
    const name = input.name?.trim();

    if (!email) {
      throw new Error("Email is required.");
    }
    if (!password) {
      throw new Error("Password is required.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const signInAttempt = await client.auth.signInWithPassword({
      email,
      password
    });

    if (!signInAttempt.error && signInAttempt.data.user) {
      const session = createSupabaseAuthSession(signInAttempt.data.user, signInAttempt.data.session);
      saveSession(session);
      return { session, created: false };
    }

    if (!name) {
      throw new Error("No workspace found for this email. Add your name to create one.");
    }

    const signUpAttempt = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (signUpAttempt.error) {
      const message = signUpAttempt.error.message.toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        throw new Error("Incorrect password for this workspace.");
      }
      throw new Error(signUpAttempt.error.message);
    }

    if (!signUpAttempt.data.user) {
      throw new Error("Unable to create the workspace right now.");
    }

    if (!signUpAttempt.data.session) {
      throw new Error("Account created. Confirm your email in Supabase, then sign in.");
    }

    const session = createSupabaseAuthSession(signUpAttempt.data.user, signUpAttempt.data.session);
    saveSession(session);
    return { session, created: true };
  }

  const email = normalizeEmail(input.email);
  const name = input.name?.trim() ?? "";
  const password = input.password;

  if (!email) {
    throw new Error("Email is required.");
  }
  if (!password) {
    throw new Error("Password is required.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const accounts = loadAccounts();
  const existing = accounts.find((account) => account.email === email);
  const passwordHash = await hashPassword(password);

  if (existing) {
    if (existing.passwordHash !== passwordHash) {
      throw new Error("Incorrect password for this workspace.");
    }

    const session = createSession(existing, new Date().toISOString());
    saveSession(session);
    return { session, created: false };
  }

  if (!name) {
    throw new Error("Name is required to create a new workspace.");
  }

  const now = new Date().toISOString();
  const account: LocalAccount = {
    name,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };

  saveAccounts([...accounts, account]);
  const session = createSession(account, now);
  saveSession(session);
  return { session, created: true };
}
