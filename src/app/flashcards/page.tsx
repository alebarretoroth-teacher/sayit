import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FlashcardSession from "./FlashcardSession";

export default async function FlashcardsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  // Get due reviews via RPC
  const { data: dueExercises } = await supabase.rpc("get_due_reviews", {
    uid: user.id,
    max_count: 20,
  });

  // Also get current progress for each exercise
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <FlashcardSession
        exercises={dueExercises ?? []}
        userId={user.id}
        streakDays={profile?.streak_count ?? 0}
      />
    </div>
  );
}
