import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckInForm } from "@/components/check-in-form";
import { loadEntries } from "@/lib/storage";

describe("CheckInForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates and updates the same-day entry", async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    const saveButton = screen.getByRole("button", { name: "Save check-in" });
    await user.click(saveButton);

    let entries = loadEntries();
    expect(entries).toHaveLength(1);

    const workSlider = screen.getByRole("slider", { name: "Work Focus" });
    fireEvent.change(workSlider, { target: { value: "9" } });
    await user.click(saveButton);

    entries = loadEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].work).toBe(9);
  });
});
