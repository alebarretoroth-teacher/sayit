"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import RearrangeExercise from "@/components/exercises/RearrangeExercise";
import BuildExercise from "@/components/exercises/BuildExercise";
import SpeakingDrill from "@/components/exercises/SpeakingDrill";
import FillPatternExercise from "@/components/exercises/FillPatternExercise";
import { computeXP } from "@/lib/srs";
import { useToast } from "@/components/ui/Toast";
import type { Exercise, Lesson, AIFeedback } from "@/types";

interface PracticeSessionProps {
  lesson: Lesson;
  exercises: Exercise[];
  userId: string;
  streakDays: number;
}

interface ExerciseResult {
  exercise: Exercise;
  isCorrect: boolean;
  studentAnswer: string;
  xpEarned: number;
  feedback?: AIFeedback;
}

export default function PracticeSession({ lesson, exercises, userId, streakDays }: PracticeSessionProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const current = exercises[currentIndex];
  const progress = (currentIndex / exercises.length) * 100;

  function handleExerciseComplete(isCorrect: boolean, studentAnswer: string, feedback?: AIFeedback) {
    const xp = computeXP(current.type, isCorrect, streakDays);
    const result: ExerciseResult = { exercise: current, isCorrect, studentAnswer, xpEarned: xp, feedback };

    setResults((prev) => [...prev, result]);
    setTotalXP((prev) => prev + xp);

    if (isCorrect && xp > 0) {
      addToast({ message: `+${xp} XP`, type: "success", emoji: "⚡" });
    }

    saveProgress(result);

    if (currentIndex + 1 >= exercises.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function saveProgress(result: ExerciseResult) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        exercise_id: result.exercise.id,
        is_correct: result.isCorrect,
        student_answer: result.studentAnswer,
        xp_earned: result.xpEarned,
      }),
    });
  }

  // ─── Session complete ─────────────────────────────────────────────────────

  if (isComplete) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / results.length) * 100);

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <div className="text-6xl">{accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}</div>

          <div>
            <h2 className="text-2xl font-bold">Lição concluída!</h2>
            <p className="text-muted-foreground mt-1">{lesson.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary">+{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-success">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">acurácia</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold">{correctCount}/{results.length}</p>
              <p className="text-xs text-muted-foreground">corretas</p>
            </div>
          </div>

          {results.filter((r) => !r.isCorrect).length > 0 && (
            <div className="card bg-warning/5 border border-warning/20 text-left space-y-2">
              <p className="text-sm font-semibold">Para revisar:</p>
              {results.filter((r) => !r.isCorrect).map((r, i) => (
                <div key={i} className="text-xs">
                  <span className="font-mono text-foreground">{r.exercise.correct_answer}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <button className="btn-primary w-full" onClick={() => router.push("/dashboard")}>
              Voltar ao início
            </button>
            <button className="btn-secondary w-full" onClick={() => router.push("/errors")}>
              Ver meus erros
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Exercise screen ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          {currentIndex + 1}/{exercises.length}
        </span>
      </div>

      {totalXP > 0 && (
        <div className="px-5 mb-2">
          <span className="xp-badge">+{totalXP} XP esta sessão</span>
        </div>
      )}

      {/* Exercise */}
      <div className="flex-1 px-5 pb-8">
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {current.type === "rearrange" && "Organize a frase"}
            {current.type === "build" && "Construa a frase"}
            {current.type === "speaking_drill" && "Speaking Drill"}
            {current.type === "fill_pattern" && "Complete o padrão"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {current.type === "rearrange" && (
              <RearrangeExercise exercise={current} onComplete={handleExerciseComplete} />
            )}
            {current.type === "build" && (
              <BuildExercise exercise={current} onComplete={handleExerciseComplete} />
            )}
            {current.type === "speaking_drill" && (
              <SpeakingDrill exercise={current} onComplete={handleExerciseComplete} />
            )}
            {current.type === "fill_pattern" && (
              <FillPatternExercise exercise={current} onComplete={handleExerciseComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
