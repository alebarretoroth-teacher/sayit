"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Verificar role do usuário
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData?.role === "teacher" || userData?.role === "admin") {
          window.location.href = "/teacher";
        } else {
          window.location.href = "/dashboard";
        }
      }
    });

    // Forçar refresh da sessão (para pegar o token do hash ou code)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data: userData }) => {
            if (userData?.role === "teacher" || userData?.role === "admin") {
              window.location.href = "/teacher";
            } else {
              window.location.href = "/dashboard";
            }
          });
      }
    });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FAF6F1" }}
    >
      <div className="text-center space-y-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
          style={{ borderColor: "#FF7058", borderTopColor: "transparent" }}
        />
        <p className="text-sm font-medium" style={{ color: "#072547" }}>
          Entrando...
        </p>
      </div>
    </div>
  );
}
