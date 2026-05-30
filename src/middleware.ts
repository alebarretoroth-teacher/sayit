import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/onboarding", "/auth"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options } as any);
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options } as any);
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...options } as any);
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options } as any);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Redireciona para onboarding se não autenticado em rota protegida
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Redireciona para dashboard se já autenticado e tenta acessar onboarding
  if (user && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
