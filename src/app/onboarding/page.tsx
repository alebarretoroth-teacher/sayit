"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Mode = "choose" | "login" | "signup" | "done";

export default function OnboardingPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha incorretos.");
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  async function handleSignup() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setMode("done");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#FAF6F1" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/logo.svg" alt="Sayit" className="h-20 w-auto" />
        </div>

        <AnimatePresence mode="wait">

          {/* ── DONE ── */}
          {mode === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="text-5xl">📩</div>
              <h2 className="text-2xl font-bold" style={{ color: "#072547" }}>Confirme seu email</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#072547", opacity: 0.6 }}>
                Enviamos um link para <strong>{email}</strong>.<br />Clique nele para ativar sua conta.
              </p>
            </motion.div>
          )}

          {/* ── CHOOSE ── */}
          {mode === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-lg font-semibold" style={{ color: "#FF7058" }}>
                Inglês para falar. Para a vida. Para o mundo.
              </p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8", color: "#072547" }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8H6.4C9.7 35.6 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41 35 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                Continuar com Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "#E5E0D8" }} />
                <span className="text-xs" style={{ color: "#072547", opacity: 0.4 }}>ou</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E5E0D8" }} />
              </div>

              <button
                onClick={() => setMode("login")}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
              >
                Entrar com email
              </button>

              <button
                onClick={() => setMode("signup")}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "transparent", border: "1.5px solid #E5E0D8", color: "#072547" }}
              >
                Criar conta
              </button>
            </motion.div>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-left">
              <h2 className="text-xl font-bold text-center" style={{ color: "#072547" }}>Entrar</h2>

              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
              />

              {error && <p className="text-xs text-center" style={{ color: "#EF4444" }}>{error}</p>}

              <button
                onClick={handleLogin}
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
              >
                {loading ? "Entrando..." : "Entrar →"}
              </button>

              <button onClick={() => { setMode("choose"); setError(""); }} className="w-full text-xs text-center" style={{ color: "#072547", opacity: 0.45 }}>
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* ── SIGNUP ── */}
          {mode === "signup" && (
            <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-left">
              <h2 className="text-xl font-bold text-center" style={{ color: "#072547" }}>Criar conta</h2>

              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
              />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
              />
              <input
                type="password"
                placeholder="Criar senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
              />

              {error && <p className="text-xs text-center" style={{ color: "#EF4444" }}>{error}</p>}

              <button
                onClick={handleSignup}
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
              >
                {loading ? "Criando conta..." : "Criar conta →"}
              </button>

              <button onClick={() => { setMode("choose"); setError(""); }} className="w-full text-xs text-center" style={{ color: "#072547", opacity: 0.45 }}>
                ← Voltar
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
