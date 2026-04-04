import { authenticateAccount, clearSession, loadSession } from "@/lib/auth";

describe("auth behavior", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a new local account and session", async () => {
    const result = await authenticateAccount({
      name: "Sai",
      email: "Sai@Example.com",
      password: "momentum123"
    });

    expect(result.created).toBe(true);
    expect(loadSession()).toMatchObject({
      name: "Sai",
      email: "sai@example.com"
    });
  });

  it("requires the original password for returning users", async () => {
    await authenticateAccount({
      name: "Sai",
      email: "sai@example.com",
      password: "momentum123"
    });

    clearSession();

    await expect(
      authenticateAccount({
        email: "sai@example.com",
        password: "wrongpass"
      })
    ).rejects.toThrow("Incorrect password for this workspace.");
  });
});
