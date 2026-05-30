"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, AlertCircle, BookOpen, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  cefr_level: string;
  created_at: string;
  profiles: {
    streak_count: number;
    total_xp: number;
    last_practice_date: string | null;
    daily_goal_minutes: number;
  } | null;
}

interface Session {
  user_id: string;
  xp_earned: number;
  exercises_completed: number;
  exercises_correct: number;
  started_at: string;
}

interface ErrorLog {
  user_id: string;
  error_type: string;
  exercises: { prompt: string; correct_answer: string } | null;
}

interface Props {
  teacher: { name: string; email: string; role: string } | null;
  students: Student[];
  recentSessions: Session[];
  recentErrors: ErrorLog[];
}

type Tab = "alunos" | "erros" | "homework";

const CEFR_COLOR: Record<string, string> = {
  A1: "#8FB9A8", A2: "#7DC9E8", B1: "#4F6EF7", B2: "#FF7058", C1: "#072547",
};

function daysSince(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function accuracy(sessions: Session[], userId: string) {
  const s = sessions.filter((s) => s.user_id === userId);
  if (!s.length) return null;
  const total = s.reduce((a, b) => a + b.exercises_completed, 0);
  const correct = s.reduce((a, b) => a + b.exercises_correct, 0);
  return total > 0 ? Math.round((correct / total) * 100) : null;
}

export default function TeacherDashboard({ teacher, students, recentSessions, recentErrors }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("alunos");
  const [search, setSearch] = useState("");

  const activeStudents = students.filter((s) => {
    const days = daysSince(s.profiles?.last_practice_date ?? null);
    return days !== null && days <= 7;
  }).length;

  const totalXP = students.reduce((a, s) => a + (s.profiles?.total_xp ?? 0), 0);

  const errorTypeCounts = recentErrors.reduce<Record<string, number>>((acc, e) => {
    acc[e.error_type] = (acc[e.error_type] ?? 0) + 1;
    return acc;
  }, {});

  const filteredStudents = students.filter(
    (s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF6F1" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#072547" }} className="px-6 pt-12 pb-6">
        {/* Logo + logout */}
        <div className="flex items-center justify-between mb-5">
          <img src="/logo.svg" alt="Sayit" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          <button onClick={handleLogout} className="p-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <LogOut size={18} color="white" />
          </button>
        </div>

        {/* Teacher info */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#FF7058" }}>
            Painel do Professor
          </p>
          <h1 className="text-xl font-bold text-white">{teacher?.name || teacher?.email}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Alunos", value: students.length, color: "#7DC9E8" },
            { label: "Ativos (7d)", value: activeStudents, color: "#8FB9A8" },
            { label: "XP total", value: totalXP.toLocaleString("pt-BR"), color: "#FF7058" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}>
        {(["alunos", "erros", "homework"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm font-semibold capitalize transition-all"
            style={{
              color: tab === t ? "#FF7058" : "#072547",
              opacity: tab === t ? 1 : 0.45,
              borderBottom: tab === t ? "2px solid #FF7058" : "2px solid transparent",
            }}
          >
            {t === "alunos" ? "Alunos" : t === "erros" ? "Erros" : "Homework"}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* ── ALUNOS ── */}
        {tab === "alunos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: "1.5px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#072547" }}
            />

            {filteredStudents.length === 0 && (
              <div className="text-center py-12" style={{ color: "#072547", opacity: 0.4 }}>
                <p className="text-sm">Nenhum aluno encontrado.</p>
              </div>
            )}

            {filteredStudents.map((student) => {
              const days = daysSince(student.profiles?.last_practice_date ?? null);
              const acc = accuracy(recentSessions, student.id);
              const isInactive = days === null || days > 7;

              return (
                <div
                  key={student.id}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1.5px solid ${isInactive ? "#F3E8E8" : "#E5E0D8"}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: "#072547" }}
                      >
                        {(student.name || student.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#072547" }}>
                          {student.name || student.email}
                        </p>
                        <p className="text-xs" style={{ color: "#072547", opacity: 0.45 }}>{student.email}</p>
                      </div>
                    </div>

                    {/* CEFR Badge */}
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: CEFR_COLOR[student.cefr_level] ?? "#8FB9A8" }}
                    >
                      {student.cefr_level}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center rounded-lg py-2" style={{ backgroundColor: "#FAF6F1" }}>
                      <p className="text-sm font-bold" style={{ color: "#FF7058" }}>
                        {student.profiles?.streak_count ?? 0}🔥
                      </p>
                      <p className="text-xs" style={{ color: "#072547", opacity: 0.45 }}>streak</p>
                    </div>
                    <div className="text-center rounded-lg py-2" style={{ backgroundColor: "#FAF6F1" }}>
                      <p className="text-sm font-bold" style={{ color: "#072547" }}>
                        {(student.profiles?.total_xp ?? 0).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs" style={{ color: "#072547", opacity: 0.45 }}>XP</p>
                    </div>
                    <div className="text-center rounded-lg py-2" style={{ backgroundColor: "#FAF6F1" }}>
                      <p className="text-sm font-bold" style={{ color: acc !== null ? "#22C55E" : "#072547" }}>
                        {acc !== null ? `${acc}%` : "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#072547", opacity: 0.45 }}>acurácia</p>
                    </div>
                  </div>

                  {/* Last practice */}
                  <p className="text-xs mt-2" style={{ color: isInactive ? "#EF4444" : "#072547", opacity: isInactive ? 1 : 0.4 }}>
                    {days === null
                      ? "Nunca praticou"
                      : days === 0
                      ? "Praticou hoje ✓"
                      : days === 1
                      ? "Praticou ontem"
                      : `Última prática: ${days} dias atrás${isInactive ? " ⚠️" : ""}`}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── ERROS ── */}
        {tab === "erros" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#072547" }}>
                Tipos de erro mais frequentes (30 dias)
              </h3>
              {Object.entries(errorTypeCounts).length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "#072547", opacity: 0.4 }}>Sem erros registrados ainda.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(errorTypeCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const total = recentErrors.length;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={type} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold capitalize" style={{ color: "#072547" }}>
                              {type.replace("_", " ")}
                            </p>
                            <span className="text-xs font-bold" style={{ color: "#FF7058" }}>{count}x</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: "#FF7058" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Recent errors list */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#072547" }}>Erros recentes</h3>
              <div className="space-y-2">
                {recentErrors.slice(0, 10).map((err, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#FF7058" }}>
                      {err.error_type?.replace("_", " ")}
                    </p>
                    <p className="text-sm" style={{ color: "#072547" }}>
                      {err.exercises?.prompt ?? "—"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#22C55E" }}>
                      ✓ {err.exercises?.correct_answer ?? "—"}
                    </p>
                  </div>
                ))}
                {recentErrors.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: "#072547", opacity: 0.4 }}>Sem erros registrados ainda.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── HOMEWORK ── */}
        {tab === "homework" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl p-5 text-center space-y-3" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
              <div className="text-4xl">📚</div>
              <h3 className="font-bold" style={{ color: "#072547" }}>Homework em breve</h3>
              <p className="text-sm" style={{ color: "#072547", opacity: 0.55 }}>
                Aqui você poderá criar e atribuir tarefas específicas para cada aluno ou turma, com prazo e conteúdo personalizado.
              </p>
              <div className="space-y-2 text-left">
                {["Selecionar lições ou padrões", "Definir prazo de entrega", "Atribuir a alunos ou turmas", "Ver quem completou"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#072547", opacity: 0.7 }}>
                    <span style={{ color: "#8FB9A8" }}>○</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
