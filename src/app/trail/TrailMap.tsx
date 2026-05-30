"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, CheckCircle, ChevronRight, Clock } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  focus: string;
  estimated_minutes: number;
  cefr_level: string;
  order: number;
}

interface Unit {
  id: string;
  title: string;
  cefr_level: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface TrailMapProps {
  units: Unit[];
  attemptedExerciseIds: string[];
}

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  A2: "bg-blue-100 text-blue-700 border-blue-200",
  B1: "bg-violet-100 text-violet-700 border-violet-200",
  B2: "bg-amber-100 text-amber-700 border-amber-200",
  C1: "bg-rose-100 text-rose-700 border-rose-200",
};

const FOCUS_ICONS: Record<string, string> = {
  pattern: "⚡",
  chunk: "💬",
  speaking: "🎙️",
};

export default function TrailMap({ units, attemptedExerciseIds }: TrailMapProps) {
  const [expanded, setExpanded] = useState<string>(units[0]?.id ?? "");

  // Simple progression: first unit always unlocked, next unlocks when previous has ≥1 lesson attempted
  function isUnitUnlocked(unitIndex: number): boolean {
    if (unitIndex === 0) return true;
    const prevUnit = units[unitIndex - 1];
    return prevUnit?.lessons?.length > 0; // simplified: always unlock for MVP
  }

  return (
    <div className="px-5 space-y-4">
      {units.map((unit, unitIndex) => {
        const unlocked = isUnitUnlocked(unitIndex);
        const isOpen = expanded === unit.id;

        return (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: unitIndex * 0.08 }}
          >
            {/* Unit header */}
            <button
              onClick={() => unlocked && setExpanded(isOpen ? "" : unit.id)}
              className={`w-full card flex items-center gap-4 text-left transition-all ${
                !unlocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-card-hover"
              } ${isOpen ? "border-primary/20 bg-primary/2" : ""}`}
            >
              {/* CEFR badge */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border ${CEFR_COLORS[unit.cefr_level] ?? "bg-muted"}`}>
                {unit.cefr_level}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{unit.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{unit.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unit.lessons?.length ?? 0} lições
                </p>
              </div>

              {unlocked ? (
                <ChevronRight
                  size={18}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              ) : (
                <Lock size={18} className="text-muted-foreground" />
              )}
            </button>

            {/* Lessons */}
            {isOpen && unlocked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-4 mt-2 space-y-2 border-l-2 border-primary/20 pl-4"
              >
                {unit.lessons
                  ?.sort((a, b) => a.order - b.order)
                  .map((lesson, lessonIndex) => {
                    // Simple: first lesson always available
                    const lessonUnlocked = lessonIndex === 0 || true;
                    const isDone = false; // simplification for MVP display

                    return (
                      <Link
                        key={lesson.id}
                        href={lessonUnlocked ? `/practice/${lesson.id}` : "#"}
                        className={`block card flex items-center gap-3 transition-all ${
                          !lessonUnlocked ? "opacity-40 pointer-events-none" : "hover:shadow-card-hover"
                        }`}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0">
                          {isDone ? (
                            <CheckCircle size={20} className="text-success" />
                          ) : lessonUnlocked ? (
                            <div className="w-5 h-5 rounded-full border-2 border-primary" />
                          ) : (
                            <Lock size={16} className="text-muted-foreground" />
                          )}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {FOCUS_ICONS[lesson.focus]} {lesson.focus}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock size={10} />
                              {lesson.estimated_minutes} min
                            </span>
                          </div>
                        </div>

                        <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                      </Link>
                    );
                  })}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
