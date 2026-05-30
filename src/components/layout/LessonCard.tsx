"use client";

import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    estimated_minutes: number;
    focus: string;
    cefr_level: string;
  };
}

const FOCUS_COLORS: Record<string, string> = {
  pattern:  "bg-primary/10 text-primary",
  chunk:    "bg-success/10 text-success",
  speaking: "bg-warning/10 text-warning",
};

const FOCUS_LABELS: Record<string, string> = {
  pattern:  "Sentence Pattern",
  chunk:    "Chunks",
  speaking: "Speaking",
};

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Link href={`/practice/${lesson.id}`}>
      <div className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">
            {lesson.focus === "speaking" ? "🎙️" : lesson.focus === "chunk" ? "💬" : "⚡"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${FOCUS_COLORS[lesson.focus]}`}>
              {FOCUS_LABELS[lesson.focus]}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Clock size={10} />
              {lesson.estimated_minutes} min
            </span>
            <span className="text-xs text-muted-foreground">{lesson.cefr_level}</span>
          </div>
        </div>

        <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  );
}
