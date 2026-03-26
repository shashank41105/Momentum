import { calculateTotalScore } from "@/lib/score";

describe("calculateTotalScore", () => {
  it("calculates weighted score for a normal input", () => {
    expect(calculateTotalScore(8, 6, 7)).toBe(73);
  });

  it("returns 0 at minimum values", () => {
    expect(calculateTotalScore(0, 0, 0)).toBe(0);
  });

  it("returns 100 at maximum values", () => {
    expect(calculateTotalScore(10, 10, 10)).toBe(100);
  });
});
