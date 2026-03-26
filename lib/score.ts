import { SCORE_WEIGHTS } from "@/lib/constants";
import type { ScoreBreakdown } from "@/lib/types";

export function calculateTotalScore(work: number, gym: number, diet: number): number {
  const weighted = work * SCORE_WEIGHTS.work + gym * SCORE_WEIGHTS.gym + diet * SCORE_WEIGHTS.diet;
  return Math.round(weighted * 10);
}

export function getScoreBreakdown(work: number, gym: number, diet: number): ScoreBreakdown {
  return {
    workWeight: Math.round(work * SCORE_WEIGHTS.work * 10),
    gymWeight: Math.round(gym * SCORE_WEIGHTS.gym * 10),
    dietWeight: Math.round(diet * SCORE_WEIGHTS.diet * 10),
    total: calculateTotalScore(work, gym, diet)
  };
}
