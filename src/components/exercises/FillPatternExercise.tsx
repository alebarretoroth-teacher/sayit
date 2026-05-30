"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import type { Exercise } from "@/types";

interface FillPatternExerciseProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean, studentAnswer: string) => void;
}

/**
 * Fill the Pattern exercise.
 * The correct_answer contains a placeholder like [____] that the student must fill.
 * distractors[] contains wrong options + the correct one (shuffled by caller).
 */
export default function FillPatternExercise({ exercise, onComplete }: FillPatternExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  // Extract the fill blank from correct_answer
  // e.g. correct_answer = "I've been [working]" → blank = "working"
  const blankMatch = exercise.correct_answer.match(/\[(.+?)\]/);
  const correctFill = blankMatch?.[1] ?? exercise.correct_answer;

  // Sentence with visible blank
  const sentenceWithBlank = exercise.correct_answer.replace(/\[.+?\]/, "_____");

  // Options: correct + distractors
  const options = exercise.distractors
    ? [...exercise.distractors, correctFill].sort(() => Math.random() - 0.5)
    : [correctFill];

  function handleSelect(option: string) {
    if (result) return;
    setSelected(option);
    const isCorrect = option === correctFill;
    setResult(isCorrect ? "correct" : "wrong");
    setTimeout(() => onComplete(isCorrect, option), 1200);
  }

  return (
    <div className="space-y-6">
      {/* Pattern highlight */}
      {exercise.pattern && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Padrão:</span>
          <span className="pattern-chip">{exercise.pattern.structure}</span>
        </div>
      )}

      {/* Context / prompt */}
      <div className="card bg-muted">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Contexto</p>
        <p className="text-sm font-medium">{exercise.prompt}</p>
      </div>

      {/* Sentence with blank */}
      <div className="card bg-primary/5 border border-primary/20 text-center py-6">
        <p className="text-xl font-semibold">
          {sentenceWithBlank.split("_____").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block min-w-20 border-b-2 mx-1 font-mono ${
                  selected
                    ? result === "correct" ? "border-success text-success" : "border-error text-error"
                    : "border-primary text-primary"
                }`}>
                  {selected ?? ""}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === correctFill;
          let className = "card text-center py-4 font-medium text-sm transition-all border-2 ";

          if (!result) {
            className += "border-transparent hover:border-primary hover:text-primary cursor-pointer";
          } else if (isCorrectOpt) {
            className += "border-success bg-success/10 text-success";
          } else if (isSelected && !isCorrectOpt) {
            className += "border-error bg-error/10 text-error";
          } else {
            className += "border-transparent opacity-50";
          }

          return (
            <button key={opt} onClick={() => handleSelect(opt)} className={className}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card flex items-center gap-3 border ${
              result === "correct" ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"
            }`}
          >
            {result === "correct" ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <XCircle size={20} className="text-error" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {result === "correct" ? "Correto! 🎉" : `Era: "${correctFill}"`}
              </p>
              {exercise.pattern && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Padrão: {exercise.pattern.example_en}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
