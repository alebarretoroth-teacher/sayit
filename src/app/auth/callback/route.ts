import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ? `https://${forwardedHost}` : origin;

  if (!code) {
    return NextResponse.redirect(`${host}/onboarding?debug=no_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const msg = encodeURIComponent(error.message);
    return NextResponse.redirect(`${host}/onboarding?debug=exchange_error&msg=${msg}`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${host}/onboarding?debug=no_user`);
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role === "teacher" || userData?.role === "admin") {
    return NextResponse.redirect(`${host}/teacher`);
  }

  return NextResponse.redirect(`${host}/dashboard`);
}
