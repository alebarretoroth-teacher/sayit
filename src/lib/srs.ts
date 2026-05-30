/**
 * SAYIT — SRS Engine (SM-2 Modified)
 * Computes next review interval based on student performance rating.
 */

import type { StudentProgress } from "@/types";
import type { SRSRating } from "@/types";

interface SRSResult {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: Date;
}

export function computeNextReview(
  progress: Pick<StudentProgress, "ease_factor" | "interval_days" | "repetitions">,
  rating: SRSRating
): SRSResult {
  let { ease_factor, interval_days, repetitions } = progress;

  switch (rating) {
    case "wrong":
      repetitions = 0;
      interval_days = 1;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
      break;

    case "hard":
      ease_factor = Math.max(1.3, ease_factor - 0.15);
      // interval stays same, repetitions don't reset
      interval_days = Math.max(1, interval_days * 0.8);
      break;

    case "ok":
      if (repetitions === 0) interval_days = 1;
      else if (repetitions === 1) interval_days = 6;
      else interval_days = Math.round(interval_days * ease_factor);
      repetitions += 1;
      break;

    case "easy":
      if (repetitions === 0) interval_days = 1;
      else if (repetitions === 1) interval_days = 6;
      else interval_days = Math.round(interval_days * ease_factor);
      repetitions += 1;
      ease_factor = Math.min(3.0, ease_factor + 0.1);
      break;
  }

  const next_review = new Date();
  next_review.setDate(next_review.getDate() + interval_days);

  return { ease_factor, interval_days, repetitions, next_review };
}

/**
 * Returns the due reviews for a student, ordered by priority.
 * Priority: overdue > due today > new exercises
 */
export function prioritizeReviews(
  progressList: StudentProgress[],
  maxCount = 20
): StudentProgress[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdue = progressList.filter(
    (p) => new Date(p.next_review) < today
  );
  const dueToday = progressList.filter((p) => {
    const d = new Date(p.next_review);
    return d >= today && d <= now;
  });

  return [...overdue, ...dueToday].slice(0, maxCount);
}

/**
 * XP earned per exercise, weighted by type and streak.
 */
export function computeXP(
  exerciseType: string,
  isCorrect: boolean,
  streakDays: number
): number {
  if (!isCorrect) return 2; // partial credit for trying

  const base: Record<string, number> = {
    rearrange: 10,
    build: 12,
    fill_pattern: 10,
    speaking_drill: 15,
    shadowing: 12,
    free_response: 18,
    flashcard: 8,
  };

  const xp = base[exerciseType] ?? 10;

  // Streak multiplier
  let multiplier = 1.0;
  if (streakDays >= 30) multiplier = 1.3;
  else if (streakDays >= 7) multiplier = 1.2;
  else if (streakDays >= 3) multiplier = 1.1;

  return Math.round(xp * multiplier);
}
