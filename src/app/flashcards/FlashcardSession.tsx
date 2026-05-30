"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Volume2, X } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import type { SRSRating } from "@/types";

interface FlashcardExercise {
  exercise_id: string;
  type: string;
  prompt: string;
  correct_answer: string;
  audio_url?: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

interface FlashcardSessionProps {
  exercises: FlashcardExercise[];
  userId: string;
  streakDays: number;
}

export default function FlashcardSession({ exercises, userId, streakDays }: FlashcardSessionProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ rating: SRSRating; exercise_id: string }[]>([]);

  const current = exercises[index];
  const progress = exercises.length > 0 ? (index / exercises.length) * 100 : 100;

  // Empty state
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center space-y-4 max-w-xs">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-bold">Tudo em dia!</h2>
          <p className="text-muted-foreground text-sm">
            Você não tem revisões pendentes agora. Volte amanhã ou pratique uma nova lição.
          </p>
          <button className="btn-primary w-full" onClick={() => router.push("/dashboard")}>
            Praticar lição nova
          </button>
        </div>
        <BottomNav active="flashcards" />
      </div>
    );
  }

  async function handleRating(rating: SRSRating) {
    const newResults = [...results, { rating, exercise_id: current.exercise_id }];
    setResults(newResults);

    // Save to API
    await fetch("/api/srs-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        exercise_id: current.exercise_id,
        rating,
        streak_days: streakDays,
        current_progress: {
          ease_factor: current.ease_factor,
          interval_days: current.interval_days,
          repetitions: current.repetitions,
        },
      }),
    });

    if (index + 1 >= exercises.length) {
      setDone(true);
    } else {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i + 1), 150);
    }
  }

  function playAudio() {
    if (current?.audio_url) new Audio(current.audio_url).play();
  }

  // Done screen
  if (done) {
    const easyCount = results.filter((r) => r.rating === "easy").length;
    const okCount = results.filter((r) => r.rating === "ok").length;
    const hardCount = results.filter((r) => r.rating === "hard" || r.rating === "wrong").length;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm space-y-6 text-center"
        >
          <span className="text-5xl">✅</span>
          <div>
            <h2 className="text-2xl font-bold">Revisão completa!</h2>
            <p className="text-muted-foreground text-sm mt-1">{exercises.length} cartas revisadas</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center bg-success/5 border border-success/20">
              <p className="text-2xl font-bold text-success">{easyCount}</p>
              <p className="text-xs text-muted-foreground">Fácil</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold">{okCount}</p>
              <p className="text-xs text-muted-foreground">Ok</p>
            </div>
            <div className="card text-center bg-error/5 border border-error/20">
              <p className="text-2xl font-bold text-error">{hardCount}</p>
              <p className="text-xs text-muted-foreground">Difícil</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="btn-primary w-full" onClick={() => router.push("/dashboard")}>
              Voltar ao início
            </button>
            <button className="btn-secondary w-full" onClick={() => router.push("/trail")}>
              Ver trilha
            </button>
          </div>
        </motion.div>
        <BottomNav active="flashcards" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground">
          <X size={22} />
        </button>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {index + 1}/{exercises.length}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          {flipped ? "Resposta" : "Toque para ver"}
        </p>

        <div
          className="w-full max-w-sm cursor-pointer"
          onClick={() => !flipped && setFlipped(true)}
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              /* FRONT */
              <motion.div
                key="front"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.2 }}
                className="card min-h-48 flex flex-col items-center justify-center text-center p-8 shadow-card-hover border-2 border-primary/10"
              >
                <p className="text-sm text-muted-foreground mb-4">🇧🇷 Português</p>
                <p className="text-2xl font-semibold">{current.prompt}</p>
                <p className="text-xs text-primary mt-6">Toque para revelar →</p>
              </motion.div>
            ) : (
              /* BACK */
              <motion.div
                key="back"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.2 }}
                className="card min-h-48 flex flex-col items-center justify-center text-center p-8 shadow-card-hover bg-primary/5 border-2 border-primary/20"
              >
                <p className="text-sm text-primary mb-4">🇺🇸 English</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {current.correct_answer}
                </p>
                {current.audio_url && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    className="mt-4 flex items-center gap-1.5 text-primary text-sm"
                  >
                    <Volume2 size={16} />
                    Ouvir
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interval hint */}
        {flipped && (
          <p className="text-xs text-muted-foreground mt-4">
            Intervalo atual: {current.interval_days}d
          </p>
        )}
      </div>

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pb-4 space-y-3"
          >
            <p className="text-xs text-center text-muted-foreground">Como foi?</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRating("hard")}
                className="card text-center py-3 border-2 border-error/30 active:bg-error/10 transition-colors"
              >
                <p className="text-xl">😓</p>
                <p className="text-xs font-semibold text-error mt-1">Difícil</p>
                <p className="text-[10px] text-muted-foreground">+1d</p>
              </button>
              <button
                onClick={() => handleRating("ok")}
                className="card text-center py-3 border-2 border-border active:bg-muted transition-colors"
              >
                <p className="text-xl">🙂</p>
                <p className="text-xs font-semibold mt-1">Ok</p>
                <p className="text-[10px] text-muted-foreground">
                  +{Math.round(current.interval_days * current.ease_factor)}d
                </p>
              </button>
              <button
                onClick={() => handleRating("easy")}
                className="card text-center py-3 border-2 border-success/30 active:bg-success/10 transition-colors"
              >
                <p className="text-xl">😄</p>
                <p className="text-xs font-semibold text-success mt-1">Fácil</p>
                <p className="text-[10px] text-muted-foreground">
                  +{Math.round(current.interval_days * (current.ease_factor + 0.1))}d
                </p>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="flashcards" />
    </div>
  );
}
