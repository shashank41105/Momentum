import { render, screen, within } from "@testing-library/react";
import { DashboardClient } from "@/components/dashboard-client";
import { saveSession } from "@/lib/auth";
import { saveEntries } from "@/lib/storage";
import { getTodayDateKey } from "@/lib/date";

describe("DashboardClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders latest score from storage", async () => {
    const today = getTodayDateKey();
    saveSession({
      name: "Sai",
      email: "sai@example.com",
      loggedInAt: new Date().toISOString()
    });

    saveEntries([
      {
        date: today,
        work: 8,
        gym: 7,
        diet: 9,
        notes: "Strong day",
        total: 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    render(<DashboardClient />);
    const todayLabel = await screen.findByText("Today's Score");
    const todayCard = todayLabel.closest("div");
    expect(todayCard).not.toBeNull();
    expect(within(todayCard as HTMLElement).getByText("80/100")).toBeInTheDocument();
  });
});
