-- ============================================================
-- SAYIT — Initial Schema Migration
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');
CREATE TYPE exercise_type AS ENUM (
  'rearrange', 'build', 'fill_pattern',
  'speaking_drill', 'shadowing', 'free_response', 'flashcard'
);
CREATE TYPE srs_rating AS ENUM ('easy', 'ok', 'hard', 'wrong');
CREATE TYPE error_type AS ENUM (
  'word_order', 'vocabulary', 'structure', 'pronunciation', 'other'
);
CREATE TYPE learning_objective AS ENUM ('travel', 'work', 'conversation', 'academic');
CREATE TYPE lesson_focus AS ENUM ('pattern', 'chunk', 'speaking');

-- ─── USERS & PROFILES ─────────────────────────────────────────────────────────

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'student',
  cefr_level  cefr_level NOT NULL DEFAULT 'A1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url           TEXT,
  streak_count         INT NOT NULL DEFAULT 0,
  longest_streak       INT NOT NULL DEFAULT 0,
  total_xp             INT NOT NULL DEFAULT 0,
  timezone             TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  daily_goal_minutes   INT NOT NULL DEFAULT 10,
  learning_objective   learning_objective NOT NULL DEFAULT 'conversation',
  last_practice_date   DATE,
  preferences          JSONB DEFAULT '{}'::jsonb,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CONTENT ──────────────────────────────────────────────────────────────────

CREATE TABLE patterns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure   TEXT NOT NULL,          -- "I've been + [verb-ing]"
  example_en  TEXT NOT NULL,
  example_pt  TEXT NOT NULL,
  cefr_level  cefr_level NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  audio_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chunks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phrase_en      TEXT NOT NULL,
  translation_pt TEXT NOT NULL,
  context        TEXT,
  category       TEXT NOT NULL,
  cefr_level     cefr_level NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE units (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  cefr_level  cefr_level NOT NULL,
  description TEXT,
  "order"     INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id             UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  cefr_level          cefr_level NOT NULL,
  focus               lesson_focus NOT NULL,
  estimated_minutes   INT NOT NULL DEFAULT 10,
  "order"             INT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id         UUID REFERENCES lessons(id) ON DELETE SET NULL,
  pattern_id        UUID REFERENCES patterns(id) ON DELETE SET NULL,
  type              exercise_type NOT NULL,
  prompt            TEXT NOT NULL,
  prompt_audio_url  TEXT,
  correct_answer    TEXT NOT NULL,
  distractors       TEXT[] DEFAULT '{}',
  audio_url         TEXT,
  difficulty        SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  cefr_level        cefr_level NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: lesson exercises (ordered)
CREATE TABLE lesson_exercises (
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE,
  exercise_id  UUID REFERENCES exercises(id) ON DELETE CASCADE,
  "order"      INT NOT NULL,
  PRIMARY KEY (lesson_id, exercise_id)
);

-- ─── PROGRESS & SRS ───────────────────────────────────────────────────────────

CREATE TABLE student_progress (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id   UUID REFERENCES exercises(id) ON DELETE CASCADE,
  attempts      INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ease_factor   FLOAT NOT NULL DEFAULT 2.5,
  interval_days FLOAT NOT NULL DEFAULT 1,
  repetitions   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, exercise_id)
);

CREATE TABLE practice_sessions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at             TIMESTAMPTZ,
  xp_earned            INT NOT NULL DEFAULT 0,
  exercises_completed  INT NOT NULL DEFAULT 0,
  exercises_correct    INT NOT NULL DEFAULT 0
);

CREATE TABLE errors_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  student_answer  TEXT NOT NULL,
  correct_answer  TEXT NOT NULL,
  error_type      error_type NOT NULL DEFAULT 'other',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialized view for recurring errors (rebuilt nightly)
CREATE TABLE recurring_errors (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_id  UUID REFERENCES patterns(id) ON DELETE CASCADE,
  error_count INT NOT NULL DEFAULT 0,
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, pattern_id)
);

-- ─── GAMIFICATION ─────────────────────────────────────────────────────────────

CREATE TABLE achievements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  icon             TEXT NOT NULL,
  condition_type   TEXT NOT NULL,
  condition_value  INT NOT NULL
);

CREATE TABLE student_achievements (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ─── CLASSES & HOMEWORK ───────────────────────────────────────────────────────

CREATE TABLE classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  cefr_level  cefr_level NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE class_members (
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

CREATE TABLE homework (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  lesson_ids  UUID[] NOT NULL,
  due_date    TIMESTAMPTZ NOT NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homework_submissions (
  homework_id   UUID REFERENCES homework(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score         SMALLINT CHECK (score BETWEEN 0 AND 100),
  PRIMARY KEY (homework_id, student_id)
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_student_progress_next_review ON student_progress(user_id, next_review);
CREATE INDEX idx_errors_log_user_created ON errors_log(user_id, created_at DESC);
CREATE INDEX idx_exercises_cefr ON exercises(cefr_level, type);
CREATE INDEX idx_lessons_unit ON lessons(unit_id, "order");
CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id, started_at DESC);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_own_data" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "progress_own_data" ON student_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "errors_own_data" ON errors_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "sessions_own_data" ON practice_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Content is readable by all authenticated users
CREATE POLICY "content_readable" ON patterns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "content_readable_chunks" ON chunks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "content_readable_units" ON units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "content_readable_lessons" ON lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "content_readable_exercises" ON exercises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "content_readable_achievements" ON achievements FOR SELECT USING (auth.role() = 'authenticated');

-- ─── SEED: ACHIEVEMENTS ───────────────────────────────────────────────────────

INSERT INTO achievements (name, description, icon, condition_type, condition_value) VALUES
  ('First Word',    'Completou sua primeira lição',           '🎯', 'lessons_completed', 1),
  ('On a Roll',     '7 dias de prática seguidos',             '🔥', 'streak_days', 7),
  ('Pattern Master','Dominou todos os exercícios de 1 padrão','⚡', 'pattern_mastered', 1),
  ('Speaking Up',   'Completou 10 speaking drills',           '🎙️', 'speaking_drills', 10),
  ('Unstoppable',   '30 dias de prática seguidos',            '🏆', 'streak_days', 30),
  ('Error Hunter',  'Re-praticou 20 erros do histórico',      '🔍', 'errors_reviewed', 20);
