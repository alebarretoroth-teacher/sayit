import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import TrailMap from "./TrailMap";

export default async function TrailPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: units } = await supabase
    .from("units")
    .select("*, lessons(id, title, focus, estimated_minutes, cefr_level, order)")
    .order("order");

  const { data: completedExercises } = await supabase
    .from("student_progress")
    .select("exercise_id, correct_count, attempts")
    .eq("user_id", user.id)
    .gt("repetitions", 0);

  const attemptedIds = new Set(completedExercises?.map((e) => e.exercise_id) ?? []);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAF6F1" }}>
      <div className="px-5 pt-12 pb-6" style={{ backgroundColor: "#072547" }}>
        <img src="/logo.svg" alt="Sayit" className="h-7 w-auto mb-4" style={{ filter: "brightness(0) invert(1)" }} />
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#FF7058" }}>Seu caminho</p>
        <h1 className="text-2xl font-bold text-white">Trilha de Aprendizagem</h1>
      </div>
      <TrailMap units={units ?? []} attemptedExerciseIds={Array.from(attemptedIds)} />
      <BottomNav active="trail" />
    </div>
  );
}
