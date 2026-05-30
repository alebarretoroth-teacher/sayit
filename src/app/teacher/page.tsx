import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeacherDashboard from "./TeacherDashboard";

export default async function TeacherPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: userData } = await supabase
    .from("users")
    .select("role, name, email")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "teacher" && userData?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: students } = await supabase
    .from("users")
    .select("id, name, email, cefr_level, created_at, profiles (streak_count, total_xp, last_practice_date, daily_goal_minutes)")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSessions } = await supabase
    .from("practice_sessions")
    .select("user_id, xp_earned, exercises_completed, exercises_correct, started_at")
    .gte("started_at", sevenDaysAgo);

  const { data: recentErrors } = await supabase
    .from("errors_log")
    .select("user_id, exercise_id, error_type, created_at, exercises(prompt, correct_answer, pattern_id)")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  return (
    <TeacherDashboard
      teacher={userData}
      students={(students ?? []) as any}
      recentSessions={(recentSessions ?? []) as any}
      recentErrors={(recentErrors ?? []) as any}
    />
  );
}
