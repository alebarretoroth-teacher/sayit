/**
 * Hook to check and award achievements after each session.
 * Call this after a practice session completes.
 */

import { createClient } from "@/lib/supabase/client";

interface StudentStats {
  lessons_completed: number;
  streak_days: number;
  speaking_drills: number;
  errors_reviewed: number;
  patterns_mastered: number;
}

const ACHIEVEMENT_IDS: Record<string, string> = {
  first_word:     "First Word",
  on_a_roll:      "On a Roll",
  pattern_master: "Pattern Master",
  speaking_up:    "Speaking Up",
  unstoppable:    "Unstoppable",
  error_hunter:   "Error Hunter",
};

export async function checkAndAwardAchievements(userId: string, stats: StudentStats) {
  const supabase = createClient();

  // Fetch all achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("id, condition_type, condition_value");

  // Fetch already earned
  const { data: earned } = await supabase
    .from("student_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const earnedIds = new Set(earned?.map((e) => e.achievement_id) ?? []);
  const toAward: string[] = [];

  for (const achievement of allAchievements ?? []) {
    if (earnedIds.has(achievement.id)) continue;

    const statValue = stats[achievement.condition_type as keyof StudentStats] ?? 0;
    if (statValue >= achievement.condition_value) {
      toAward.push(achievement.id);
    }
  }

  if (toAward.length > 0) {
    await supabase.from("student_achievements").insert(
      toAward.map((id) => ({ user_id: userId, achievement_id: id }))
    );
  }

  return toAward; // IDs of newly awarded achievements (for toast notification)
}
