// ─── User & Profile ───────────────────────────────────────────────────────────

export type UserRole = "student" | "teacher" | "admin";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cefr_level: CEFRLevel;
  created_at: string;
}

export interface Profile {
  user_id: string;
  avatar_url?: string;
  streak_count: number;
  longest_streak: number;
  total_xp: number;
  timezone: string;
  daily_goal_minutes: number;
  learning_objective: LearningObjective;
  last_practice_date?: string;
}

export type LearningObjective =
  | "travel"
  | "work"
  | "conversation"
  | "academic";

// ─── Content ──────────────────────────────────────────────────────────────────

export type ExerciseType =
  | "rearrange"
  | "build"
  | "fill_pattern"
  | "speaking_drill"
  | "shadowing"
  | "free_response"
  | "flashcard";

export interface Pattern {
  id: string;
  structure: string;           // e.g. "I've been + [verb-ing]"
  example_en: string;
  example_pt: string;
  cefr_level: CEFRLevel;
  tags: string[];
  audio_url?: string;
}

export interface Chunk {
  id: string;
  phrase_en: string;
  translation_pt: string;
  context: string;
  category: string;
  cefr_level: CEFRLevel;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  pattern_id?: string;
  prompt: string;              // in PT for build/free; in EN for others
  prompt_audio_url?: string;
  correct_answer: string;
  distractors?: string[];      // for rearrange / multiple choice
  audio_url?: string;
  difficulty: 1 | 2 | 3;
  cefr_level: CEFRLevel;
  pattern?: Pattern;
}

export interface Lesson {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  focus: "pattern" | "chunk" | "speaking";
  exercise_ids: string[];
  exercises?: Exercise[];
  estimated_minutes: number;
  unit_id: string;
}

export interface Unit {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  description: string;
  lesson_ids: string[];
  lessons?: Lesson[];
  order: number;
}

// ─── SRS / Progress ───────────────────────────────────────────────────────────

export type SRSRating = "easy" | "ok" | "hard" | "wrong";

export interface StudentProgress {
  user_id: string;
  exercise_id: string;
  attempts: number;
  correct_count: number;
  last_seen: string;
  next_review: string;
  ease_factor: number;         // default 2.5
  interval_days: number;
  repetitions: number;
}

export interface ErrorLog {
  id: string;
  user_id: string;
  exercise_id: string;
  student_answer: string;
  correct_answer: string;
  error_type: "word_order" | "vocabulary" | "structure" | "pronunciation" | "other";
  created_at: string;
}

export interface RecurringError {
  user_id: string;
  pattern_id: string;
  error_count: number;
  last_seen: string;
  pattern?: Pattern;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface PracticeSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  xp_earned: number;
  exercises_completed: number;
  exercises_correct: number;
}

export interface SessionResult {
  xp_earned: number;
  exercises_total: number;
  exercises_correct: number;
  accuracy: number;
  new_patterns_seen: string[];
  errors: ErrorLog[];
  streak_maintained: boolean;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

export interface StudentAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

// ─── Classes / Teacher ────────────────────────────────────────────────────────

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  cefr_level: CEFRLevel;
  created_at: string;
}

export interface Homework {
  id: string;
  class_id: string;
  lesson_ids: string[];
  due_date: string;
  created_by: string;
}

// ─── AI Feedback ──────────────────────────────────────────────────────────────

export interface AIFeedback {
  is_correct: boolean;
  score: number;               // 0-100
  feedback_pt: string;         // explanation in PT
  corrected_answer?: string;
  highlighted_error?: string;
  encouragement: string;
}
