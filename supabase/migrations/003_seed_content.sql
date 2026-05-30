-- ============================================================
-- SAYIT — Seed Content: Units, Patterns, Lessons, Exercises
-- ============================================================

-- ─── UNITS ────────────────────────────────────────────────────────────────────
INSERT INTO units (id, title, cefr_level, description, "order") VALUES
  ('00000000-0000-0000-0000-000000000001', 'Everyday Basics',   'A1', 'Frases essenciais para o dia a dia',        1),
  ('00000000-0000-0000-0000-000000000002', 'Present Patterns',  'A2', 'Padrões do presente: hábitos e rotinas',    2),
  ('00000000-0000-0000-0000-000000000003', 'Past & Experience', 'B1', 'Falar sobre experiências e o passado',      3);

-- ─── PATTERNS ─────────────────────────────────────────────────────────────────
INSERT INTO patterns (id, structure, example_en, example_pt, cefr_level, tags) VALUES
  ('00000000-0000-0000-0001-000000000001', 'I [verb] every day.',        'I work every day.',            'Eu trabalho todo dia.',                    'A1', ARRAY['routine','present simple']),
  ('00000000-0000-0000-0001-000000000002', 'I don''t [verb].',           'I don''t eat meat.',           'Eu não como carne.',                       'A1', ARRAY['negation','present simple']),
  ('00000000-0000-0000-0001-000000000003', 'Do you [verb]?',             'Do you like coffee?',          'Você gosta de café?',                      'A1', ARRAY['question','present simple']),
  ('00000000-0000-0000-0001-000000000004', 'I''m [verb-ing] right now.', 'I''m working right now.',      'Estou trabalhando agora.',                 'A2', ARRAY['present continuous']),
  ('00000000-0000-0000-0001-000000000005', 'I''ve been [verb-ing].',     'I''ve been learning English.', 'Estou aprendendo inglês há algum tempo.',  'B1', ARRAY['present perfect continuous']);

-- ─── LESSONS ──────────────────────────────────────────────────────────────────
INSERT INTO lessons (id, unit_id, title, cefr_level, focus, estimated_minutes, "order") VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'I [verb] every day',    'A1', 'pattern',  8,  1),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'I don''t [verb]',       'A1', 'pattern',  8,  2),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Do you [verb]?',        'A1', 'speaking', 10, 3),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002', 'What are you doing?',   'A2', 'pattern',  10, 1),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000003', 'I''ve been [verb-ing]', 'B1', 'pattern',  12, 1);

-- ─── EXERCISES: Lesson 1 ──────────────────────────────────────────────────────
INSERT INTO exercises (id, lesson_id, pattern_id, type, prompt, correct_answer, distractors, difficulty, cefr_level) VALUES
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'rearrange', 'Organize: "Eu acordo cedo todo dia."',
   'I wake up early every day.',
   ARRAY['I','wake','up','early','every','day','.'], 1, 'A1'),

  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'rearrange', 'Organize: "Ele trabalha no escritório."',
   'He works at the office.',
   ARRAY['He','works','at','the','office','.'], 1, 'A1'),

  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'build', 'Eu como frutas todo dia.',
   'I eat fruit every day.',
   NULL, 1, 'A1'),

  ('00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'build', 'Ela estuda inglês de manhã.',
   'She studies English in the morning.',
   NULL, 2, 'A1'),

  ('00000000-0000-0000-0003-000000000005',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'speaking_drill', 'Diga: I work every day.',
   'I work every day.',
   NULL, 1, 'A1');

-- ─── EXERCISES: Lesson 2 ──────────────────────────────────────────────────────
INSERT INTO exercises (id, lesson_id, pattern_id, type, prompt, correct_answer, distractors, difficulty, cefr_level) VALUES
  ('00000000-0000-0000-0003-000000000006',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'rearrange', 'Organize: "Eu não bebo álcool."',
   'I don''t drink alcohol.',
   ARRAY['I','don''t','drink','alcohol','.'], 1, 'A1'),

  ('00000000-0000-0000-0003-000000000007',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'build', 'Eu não gosto de acordar cedo.',
   'I don''t like waking up early.',
   NULL, 2, 'A1'),

  ('00000000-0000-0000-0003-000000000008',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'speaking_drill', 'Diga: I don''t eat meat.',
   'I don''t eat meat.',
   NULL, 1, 'A1');

-- ─── LESSON EXERCISES ─────────────────────────────────────────────────────────
INSERT INTO lesson_exercises (lesson_id, exercise_id, "order") VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 1),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000002', 2),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000003', 3),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000004', 4),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000005', 5),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000006', 1),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000007', 2),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000008', 3);
