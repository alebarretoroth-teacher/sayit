-- ============================================================
-- SAYIT — Helper Functions & RPCs
-- ============================================================

-- Increment XP for a user
CREATE OR REPLACE FUNCTION increment_xp(uid UUID, amount INT)
RETURNS VOID AS $$
  UPDATE profiles SET total_xp = total_xp + amount WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update streak (call after each practice session)
CREATE OR REPLACE FUNCTION update_streak(uid UUID)
RETURNS VOID AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_practice_date INTO last_date FROM profiles WHERE user_id = uid;

  IF last_date IS NULL OR last_date < today - INTERVAL '1 day' THEN
    -- Reset streak if more than 1 day gap
    IF last_date < today - INTERVAL '1 day' THEN
      UPDATE profiles SET streak_count = 1 WHERE user_id = uid;
    ELSE
      -- First practice ever
      UPDATE profiles SET streak_count = 1 WHERE user_id = uid;
    END IF;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Consecutive day: increment streak
    UPDATE profiles
    SET
      streak_count = streak_count + 1,
      longest_streak = GREATEST(longest_streak, streak_count + 1)
    WHERE user_id = uid;
  END IF;
  -- If last_date = today, do nothing (already practiced today)

  UPDATE profiles SET last_practice_date = today WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get due reviews for a user (called by flashcard page)
CREATE OR REPLACE FUNCTION get_due_reviews(uid UUID, max_count INT DEFAULT 20)
RETURNS TABLE (
  exercise_id UUID,
  type exercise_type,
  prompt TEXT,
  correct_answer TEXT,
  audio_url TEXT,
  ease_factor FLOAT,
  interval_days FLOAT,
  repetitions INT
) AS $$
  SELECT
    e.id,
    e.type,
    e.prompt,
    e.correct_answer,
    e.audio_url,
    sp.ease_factor,
    sp.interval_days,
    sp.repetitions
  FROM student_progress sp
  JOIN exercises e ON e.id = sp.exercise_id
  WHERE sp.user_id = uid
    AND sp.next_review <= NOW()
  ORDER BY sp.next_review ASC
  LIMIT max_count;
$$ LANGUAGE sql SECURITY DEFINER;

-- Rebuild recurring errors (run as nightly cron)
CREATE OR REPLACE FUNCTION rebuild_recurring_errors()
RETURNS VOID AS $$
  DELETE FROM recurring_errors;

  INSERT INTO recurring_errors (user_id, pattern_id, error_count, last_seen)
  SELECT
    el.user_id,
    e.pattern_id,
    COUNT(*) AS error_count,
    MAX(el.created_at) AS last_seen
  FROM errors_log el
  JOIN exercises e ON e.id = el.exercise_id
  WHERE e.pattern_id IS NOT NULL
    AND el.created_at > NOW() - INTERVAL '30 days'
  GROUP BY el.user_id, e.pattern_id
  HAVING COUNT(*) >= 2;
$$ LANGUAGE sql SECURITY DEFINER;
