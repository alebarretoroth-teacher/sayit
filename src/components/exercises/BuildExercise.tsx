"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Exercise, AIFeedback } from "@/types";

interface BuildExerciseProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean, studentAnswer: string, feedback?: AIFeedback) => void;
}

export default function BuildExercise({ exercise, onComplete }: BuildExerciseProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_type: exercise.type,
          prompt: exercise.prompt,
          correct_answer: exercise.correct_answer,
          student_answer: answer,
          pattern: exercise.pattern?.structure,
        }),
      });

      const fb: AIFeedback = await res.json();
      setFeedback(fb);
      setTimeout(() => onComplete(fb.is_correct, answer, fb), 2000);
    } catch {
      // Fallback: simple string match
      const isCorrect =
        answer.toLowerCase().trim() === exercise.correct_answer.toLowerCase().trim();
      onComplete(isCorrect, answer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Pattern hint */}
      {exercise.pattern && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Padrão:</span>
          <span className="pattern-chip">{exercise.pattern.structure}</span>
        </div>
      )}

      {/* Prompt in PT */}
      <div className="card bg-muted">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Traduza para inglês</p>
        <p className="text-lg font-semibold">{exercise.prompt}</p>
      </div>

      {/* Input */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Digite sua resposta em inglês..."
        disabled={!!feedback}
        rows={3}
        className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-60"
      />

      {/* AI Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card space-y-2 border ${
              feedback.is_correct ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.is_correct ? (
                <CheckCircle className="text-success" size={18} />
              ) : (
                <XCircle className="text-error" size={18} />
              )}
              <p className="font-semibold text-sm">
                {feedback.is_correct ? "Muito bem!" : "Quase lá!"}
              </p>
              <span className="ml-auto text-xs font-bold text-muted-foreground">
                {feedback.score}/100
              </span>
            </div>

            <p className="text-sm text-foreground">{feedback.feedback_pt}</p>

            {feedback.corrected_answer && (
              <div className="bg-white rounded-md p-2 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Sugestão:</p>
                <p className="font-mono text-sm">{feedback.corrected_answer}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground italic">{feedback.encouragement}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      {!feedback && (
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={loading || !answer.trim()}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Avaliando..." : "Verificar com IA"}
        </button>
      )}
    </div>
  );
}
