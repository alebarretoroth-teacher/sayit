import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: userData } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (userData?.role === "teacher" || userData?.role === "admin") redirect("/teacher");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("user_id", user.id).single();

  const { data: nextLesson } = await supabase
    .from("lessons").select("id, title, cefr_level, estimated_minutes, units(title)")
    .order("order").limit(1).single();

  const { data: recentProgress } = await supabase
    .from("student_progress")
    .select("updated_at, exercises(lessons(title))")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1).single();

  const { data: learnedWords } = await supabase
    .from("student_progress")
    .select("exercises(prompt)")
    .eq("user_id", user.id)
    .gt("correct_count", 0)
    .order("updated_at", { ascending: false })
    .limit(6);

  const firstName = profile?.preferences?.name || user.email?.split("@")[0] || "aluna";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAF6F1" }}>
      <DashboardClient
        firstName={firstName}
        greeting={greeting}
        streak={profile?.streak_count ?? 0}
        xp={profile?.total_xp ?? 0}
        dailyGoalMinutes={profile?.daily_goal_minutes ?? 10}
        nextLesson={nextLesson ?? null}
        lastPracticeLesson={(recentProgress as any)?.exercises?.lessons?.title ?? null}
        lastPracticeAt={(recentProgress as any)?.updated_at ?? null}
        learnedWords={(learnedWords ?? []).map((p: any) => p?.exercises?.prompt).filter(Boolean)}
      />
      <BottomNav active="home" />
    </div>
  );
}
