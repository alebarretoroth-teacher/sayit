import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeNextReview, computeXP } from "@/lib/srs";
import type { SRSRating } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exercise_id, rating, streak_days, current_progress } = await req.json();

  const nextReview = computeNextReview(current_progress, rating as SRSRating);
  const isCorrect = rating !== "wrong" && rating !== "hard";
  const xp = computeXP("flashcard", isCorrect, streak_days);

  await supabase.from("student_progress").upsert({
    user_id: user.id,
    exercise_id,
    last_seen: new Date().toISOString(),
    next_review: nextReview.next_review.toISOString(),
    ease_factor: nextReview.ease_factor,
    interval_days: nextReview.interval_days,
    repetitions: nextReview.repetitions,
    attempts: (current_progress.attempts ?? 0) + 1,
    correct_count: (current_progress.correct_count ?? 0) + (isCorrect ? 1 : 0),
  });

  if (xp > 0) {
    await supabase.rpc("increment_xp", { uid: user.id, amount: xp });
  }

  return NextResponse.json({ success: true, next_review: nextReview.next_review, xp });
}
