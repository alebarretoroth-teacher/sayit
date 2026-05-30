import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PracticeClient from "./PracticeClient";

export default async function PracticePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  return <PracticeClient />;
}
