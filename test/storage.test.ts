import { loadEntries, saveEntries, upsertEntry } from "@/lib/storage";
import type { DailyEntry } from "@/lib/types";

describe("storage behavior", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("upserts one entry per day", () => {
    const dateKey = "2026-03-25";
    upsertEntry({ work: 7, gym: 6, diet: 8, notes: "First" }, dateKey);
    upsertEntry({ work: 8, gym: 7, diet: 7, notes: "Updated" }, dateKey);

    const entries = loadEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      date: dateKey,
      work: 8,
      gym: 7,
      diet: 7,
      notes: "Updated"
    });
  });

  it("serializes and deserializes saved entries", () => {
    const data: DailyEntry[] = [
      {
        date: "2026-03-24",
        work: 6,
        gym: 5,
        diet: 7,
        notes: "",
        total: 60,
        createdAt: "2026-03-24T10:00:00.000Z",
        updatedAt: "2026-03-24T10:00:00.000Z"
      }
    ];
    saveEntries(data);
    const loaded = loadEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject(data[0]);
    expect(loaded[0].focusRating).toBe(6);
  });
});
