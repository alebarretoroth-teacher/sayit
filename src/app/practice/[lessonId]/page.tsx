import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PracticeSession from "./PracticeSession";

interface Props {
  params: { lessonId: string };
}

export default async function PracticePage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  // Fetch lesson with exercises and patterns
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      *,
      lesson_exercises(
        order,
        exercises(
          *,
          patterns(*)
        )
      )
    `)
    .eq("id", params.lessonId)
    .single();

  if (!lesson) notFound();

  // Sort exercises by order
  const exercises = lesson.lesson_exercises
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((le: { exercises: unknown }) => le.exercises);

  // Fetch streak for XP multiplier
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count")
    .eq("user_id", user.id)
    .single();

  return (
    <PracticeSession
      lesson={lesson}
      exercises={exercises}
      userId={user.id}
      streakDays={profile?.streak_count ?? 0}
    />
  );
}
