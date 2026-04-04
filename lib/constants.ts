export const STORAGE_KEYS = {
  entries: "productivity.entries.v2",
  legacyEntries: "productivity.entries.v1",
  accounts: "productivity.accounts.v1",
  auth: "productivity.auth.v1"
} as const;

export const APP_EVENTS = {
  authChanged: "momentum:auth-changed",
  entriesChanged: "momentum:entries-changed"
} as const;

export const SCORE_WEIGHTS = {
  work: 0.5,
  gym: 0.25,
  diet: 0.25
} as const;
