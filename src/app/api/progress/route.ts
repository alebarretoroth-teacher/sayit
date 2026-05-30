import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeNextReview } from "@/lib/srs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exercise_id, is_correct, student_answer, xp_earned } = await req.json();
  const rating = is_correct ? "ok" : "wrong";

  // Get or create progress entry
  const { data: existing } = await supabase
    .from("student_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("exercise_id", exercise_id)
    .single();

  const current = existing ?? {
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
  };

  const nextReview = computeNextReview(current, rating);

  // Upsert progress
  await supabase.from("student_progress").upsert({
    user_id: user.id,
    exercise_id,
    attempts: (existing?.attempts ?? 0) + 1,
    correct_count: (existing?.correct_count ?? 0) + (is_correct ? 1 : 0),
    last_seen: new Date().toISOString(),
    next_review: nextReview.next_review.toISOString(),
    ease_factor: nextReview.ease_factor,
    interval_days: nextReview.interval_days,
    repetitions: nextReview.repetitions,
  });

  // Log error if wrong
  if (!is_correct) {
    const { data: exercise } = await supabase
      .from("exercises")
      .select("correct_answer")
      .eq("id", exercise_id)
      .single();

    await supabase.from("errors_log").insert({
      user_id: user.id,
      exercise_id,
      student_answer,
      correct_answer: exercise?.correct_answer ?? "",
      error_type: "other",
    });
  }

  // Update total XP
  await supabase.rpc("increment_xp", { uid: user.id, amount: xp_earned });

  // Update streak
  await supabase.rpc("update_streak", { uid: user.id });

  return NextResponse.json({ success: true, next_review: nextReview.next_review });
}
