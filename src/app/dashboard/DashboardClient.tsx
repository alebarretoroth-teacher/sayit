"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const TIPS = [
  { phrase: "I'll figure it out.", translation: "Vou dar um jeito." },
  { phrase: "It's worth it.", translation: "Vale a pena." },
  { phrase: "I'm working on it.", translation: "Estou nisso." },
  { phrase: "That makes sense.", translation: "Faz sentido." },
  { phrase: "It depends.", translation: "Depende." },
  { phrase: "I can't make it.", translation: "Não vou conseguir ir." },
  { phrase: "Let me think about it.", translation: "Deixa eu pensar." },
  { phrase: "I'm not sure yet.", translation: "Ainda não tenho certeza." },
];

const QUICK_DRILLS = [
  { sentence: "I ______ coffee every morning.", answer: "drink", options: ["drink", "go", "make"], translation: "Eu tomo café toda manhã." },
  { sentence: "She ______ to music on the way to work.", answer: "listens", options: ["listens", "goes", "drinks"], translation: "Ela ouve música no caminho pro trabalho." },
  { sentence: "I'm ______ to waking up early.", answer: "used", options: ["used", "want", "going"], translation: "Estou acostumada a acordar cedo." },
  { sentence: "It's ______ trying.", answer: "worth", options: ["worth", "good", "hard"], translation: "Vale a pena tentar." },
  { sentence: "We ______ been friends for years.", answer: "have", options: ["have", "are", "do"], translation: "Somos amigos há anos." },
];

interface Props {
  firstName: string;
  greeting: string;
  streak: number;
  xp: number;
  dailyGoalMinutes: number;
  nextLesson: any;
  lastPracticeLesson: string | null;
  lastPracticeAt: string | null;
  learnedWords: string[];
}

export default function DashboardClient({
  firstName, greeting, streak, xp, dailyGoalMinutes, nextLesson,
}: Props) {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = TIPS[day % TIPS.length];
  const drill = QUICK_DRILLS[day % QUICK_DRILLS.length];
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const dailyGoalXP = dailyGoalMinutes * 10;
  const todayXP = xp % dailyGoalXP;
  const pct = Math.min(100, Math.round((todayXP / dailyGoalXP) * 100));

  return (
    <div className="space-y-0">

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: "#072547" }} className="px-5 pt-12 pb-7">
        <div className="flex items-center justify-between mb-6">
          <img src="/logo.svg" alt="Sayit" className="h-7 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#7DC9E8" }}>
            {greeting}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{firstName}</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          {streak > 0 ? `${streak} dias seguidos` : "Comece sua sequência hoje"}
        </p>

        {/* Meta diária inline */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Meta diária</span>
            <span style={{ color: "#FF7058" }}>{todayXP}/{dailyGoalXP} pts</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#FF7058" }} />
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4" style={{ backgroundColor: "#FAF6F1" }}>

        {/* ── PRÓXIMA LIÇÃO — CTA principal ── */}
        {nextLesson ? (
          <Link href={`/practice/${nextLesson.id}`}>
            <div className="rounded-2xl p-5 flex items-center justify-between active:scale-95 transition-all" style={{ backgroundColor: "#FF7058" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-white opacity-80">Próxima lição</p>
                <p className="text-lg font-bold text-white">{nextLesson.title}</p>
                <p className="text-xs mt-0.5 text-white opacity-70">{nextLesson.cefr_level} · {nextLesson.estimated_minutes} min</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center ml-4" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <span className="text-white font-bold text-lg">▶</span>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/trail">
            <div className="rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: "#FF7058" }}>
              <p className="text-lg font-bold text-white">Explorar a Trilha</p>
              <span className="text-white text-xl">→</span>
            </div>
          </Link>
        )}

        {/* ── ACESSO RÁPIDO ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trilha",    href: "/trail",      color: "#072547" },
            { label: "Speaking",  href: "/practice",   color: "#7DC9E8" },
            { label: "Revisão",   href: "/flashcards", color: "#8FB9A8" },
          ].map(({ label, href, color }) => (
            <Link key={label} href={href}>
              <div className="rounded-xl py-4 text-center active:scale-95 transition-all" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                <p className="text-sm font-bold" style={{ color }}>{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── TREINO RÁPIDO ── */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#072547", opacity: 0.4 }}>Treino rápido</p>
          <p className="text-base font-semibold mb-1" style={{ color: "#072547" }}>{drill.sentence}</p>
          <p className="text-xs mb-4" style={{ color: "#072547", opacity: 0.4 }}>{drill.translation}</p>

          {!answered ? (
            <div className="flex gap-2 flex-wrap">
              {drill.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setAnswered(true); setCorrect(opt === drill.answer); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                  style={{ backgroundColor: "#FAF6F1", border: "1.5px solid #E5E0D8", color: "#072547" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <span className="text-xl">{correct ? "✅" : "❌"}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: correct ? "#22C55E" : "#EF4444" }}>
                  {correct ? "Correto! +2 pts" : `Resposta: "${drill.answer}"`}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── FRASE DO DIA ── */}
        <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#072547" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#FF7058" }}>Frase do dia</p>
          <p className="text-xl font-bold text-white mb-1">"{tip.phrase}"</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{tip.translation}</p>
        </div>

      </div>
    </div>
  );
}
