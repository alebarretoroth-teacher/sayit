"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import type { Exercise, AIFeedback } from "@/types";

interface RearrangeExerciseProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean, studentAnswer: string) => void;
}

export default function RearrangeExercise({ exercise, onComplete }: RearrangeExerciseProps) {
  const words = exercise.distractors ?? exercise.correct_answer.split(" ");
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setShuffled([...words].sort(() => Math.random() - 0.5));
    setSelected([]);
    setResult(null);
  }, [exercise.id]);

  function selectWord(word: string, fromBank: boolean) {
    if (result) return;
    if (fromBank) {
      setSelected((prev) => [...prev, word]);
      setShuffled((prev) => {
        const i = prev.indexOf(word);
        return [...prev.slice(0, i), ...prev.slice(i + 1)];
      });
    } else {
      setShuffled((prev) => [...prev, word]);
      setSelected((prev) => {
        const i = prev.indexOf(word);
        return [...prev.slice(0, i), ...prev.slice(i + 1)];
      });
    }
  }

  function checkAnswer() {
    const answer = selected.join(" ");
    const isCorrect =
      answer.toLowerCase().trim() === exercise.correct_answer.toLowerCase().trim();
    setResult(isCorrect ? "correct" : "wrong");
    setTimeout(() => onComplete(isCorrect, answer), 1200);
  }

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="card bg-muted">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Organize a frase</p>
        <p className="text-base font-medium">{exercise.prompt}</p>
      </div>

      {/* Drop zone */}
      <div className="min-h-16 border-2 border-dashed border-border rounded-lg p-3 flex flex-wrap gap-2 items-start">
        <AnimatePresence>
          {selected.length === 0 && (
            <p className="text-muted-foreground text-sm self-center w-full text-center">
              Toque nas palavras para montar a frase
            </p>
          )}
          {selected.map((word, i) => (
            <motion.button
              key={`${word}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => selectWord(word, false)}
              className="word-tile word-tile-selected"
            >
              {word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {shuffled.map((word, i) => (
          <motion.button
            key={`${word}-${i}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={() => selectWord(word, true)}
            className="word-tile"
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card flex items-center gap-3 ${
              result === "correct" ? "bg-success/10 border border-success/20" : "bg-error/10 border border-error/20"
            }`}
          >
            {result === "correct" ? (
              <CheckCircle className="text-success" size={22} />
            ) : (
              <XCircle className="text-error" size={22} />
            )}
            <div>
              <p className="font-semibold text-sm">
                {result === "correct" ? "Correto! 🎉" : "Quase lá!"}
              </p>
              {result === "wrong" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resposta: <span className="font-mono text-foreground">{exercise.correct_answer}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check button */}
      {!result && selected.length > 0 && (
        <button className="btn-primary w-full" onClick={checkAnswer}>
          Verificar
        </button>
      )}
    </div>
  );
}
