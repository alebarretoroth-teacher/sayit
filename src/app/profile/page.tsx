import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { Trophy, Flame, Zap, Clock, Target, ChevronRight, LogOut } from "lucide-react";

const CEFR_PROGRESS: Record<string, { next: string; xpRequired: number }> = {
  A1: { next: "A2", xpRequired: 500 },
  A2: { next: "B1", xpRequired: 1500 },
  B1: { next: "B2", xpRequired: 3000 },
  B2: { next: "C1", xpRequired: 6000 },
  C1: { next: "—",  xpRequired: Infinity },
};

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: userRow } = await supabase
    .from("users")
    .select("name, cefr_level")
    .eq("id", user.id)
    .single();

  // Achievements
  const { data: achievements } = await supabase
    .from("student_achievements")
    .select("*, achievements(name, description, icon)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  // Session stats
  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("xp_earned, exercises_completed, exercises_correct")
    .eq("user_id", user.id);

  const totalSessions = sessions?.length ?? 0;
  const totalCorrect = sessions?.reduce((a, s) => a + s.exercises_correct, 0) ?? 0;
  const totalAttempts = sessions?.reduce((a, s) => a + s.exercises_completed, 0) ?? 0;
  const globalAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const cefrLevel = userRow?.cefr_level ?? "A1";
  const cefrInfo = CEFR_PROGRESS[cefrLevel];
  const xpToNext = cefrInfo?.xpRequired ?? Infinity;
  const xpPct = xpToNext === Infinity ? 100 : Math.min(100, Math.round(((profile?.total_xp ?? 0) / xpToNext) * 100));

  async function handleLogout() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAF6F1" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ backgroundColor: "#072547" }}>
        <img src="/logo.svg" alt="Sayit" className="h-7 w-auto mb-5" style={{ filter: "brightness(0) invert(1)" }} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{userRow?.name ?? user.email?.split("@")[0]}</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{user.email}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}>
            {(userRow?.name ?? user.email ?? "U")[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* CEFR Level */}
      <div className="px-5 mb-6">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Nível atual</p>
              <p className="text-3xl font-bold text-primary">{cefrLevel}</p>
            </div>
            {cefrInfo.next !== "—" && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Próximo</p>
                <p className="font-bold text-muted-foreground">{cefrInfo.next}</p>
              </div>
            )}
          </div>
          {cefrInfo.next !== "—" && (
            <div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profile?.total_xp ?? 0} / {xpToNext} XP para {cefrInfo.next}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Estatísticas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="card flex items-center gap-3">
            <Flame size={24} className="text-warning" />
            <div>
              <p className="text-xl font-bold">{profile?.streak_count ?? 0}</p>
              <p className="text-xs text-muted-foreground">streak atual</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Zap size={24} className="text-primary" />
            <div>
              <p className="text-xl font-bold">{(profile?.total_xp ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP total</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Target size={24} className="text-success" />
            <div>
              <p className="text-xl font-bold">{globalAccuracy}%</p>
              <p className="text-xs text-muted-foreground">acurácia global</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Clock size={24} className="text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{totalSessions}</p>
              <p className="text-xs text-muted-foreground">sessões</p>
            </div>
          </div>
        </div>
      </div>

      {/* Longest streak */}
      {(profile?.longest_streak ?? 0) > 0 && (
        <div className="px-5 mb-6">
          <div className="card bg-warning/5 border border-warning/20 flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-semibold text-sm">Maior streak</p>
              <p className="text-2xl font-bold text-warning">{profile?.longest_streak} dias</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {(achievements?.length ?? 0) > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Conquistas
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements?.map((a) => (
              <div key={a.achievement_id} className="card text-center space-y-1">
                <p className="text-3xl">{a.achievements?.icon}</p>
                <p className="text-xs font-semibold leading-tight">{a.achievements?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Configurações
        </h2>
        <div className="card divide-y divide-border">
          <a href="/profile/settings" className="flex items-center justify-between py-3 text-sm font-medium">
            Meta diária
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{profile?.daily_goal_minutes} min</span>
              <ChevronRight size={14} />
            </div>
          </a>
          <a href="/profile/settings" className="flex items-center justify-between py-3 text-sm font-medium">
            Objetivo de aprendizagem
            <ChevronRight size={14} className="text-muted-foreground" />
          </a>
          <form action={handleLogout}>
            <button type="submit" className="flex items-center justify-between w-full py-3 text-sm font-medium text-destructive">
              Sair da conta
            </button>
          </form>
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
