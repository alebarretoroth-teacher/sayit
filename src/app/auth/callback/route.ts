import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          get: (name: string) => cookieStore.get(name)?.value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          set: (name: string, value: string, options: any) => {
            try { cookieStore.set(name, value, options); } catch {}
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remove: (name: string, options: any) => {
            try { cookieStore.set(name, "", options); } catch {}
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userData?.role === "teacher" || userData?.role === "admin") {
          return NextResponse.redirect(`${origin}/teacher`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
