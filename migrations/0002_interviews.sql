CREATE TABLE interview_scenarios (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  question_ko TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_en TEXT NOT NULL,
  guidance_id TEXT NOT NULL,
  guidance_en TEXT NOT NULL
);

CREATE TABLE interview_sessions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INTEGER NOT NULL REFERENCES interview_scenarios(id),
  answer_mode TEXT NOT NULL CHECK (answer_mode IN ('voice', 'typed')),
  status TEXT NOT NULL DEFAULT 'completed',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_ko TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  transcript_confidence REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_feedback (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  fluency_score INTEGER NOT NULL,
  grammar_score INTEGER NOT NULL,
  content_score INTEGER NOT NULL,
  corrected_answer TEXT NOT NULL,
  natural_answer TEXT NOT NULL,
  mistakes TEXT NOT NULL,
  recommended_words TEXT NOT NULL,
  next_practice TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_sessions_user ON interview_sessions(user_id, completed_at);

INSERT INTO interview_scenarios (id, slug, title, title_ko, level, question_ko, question_id, question_en, guidance_id, guidance_en) VALUES
  (1, 'self-introduction', 'Self introduction', '자기소개', 0, '안녕하세요. 자기소개를 해 주세요.', 'Halo. Silakan perkenalkan diri Anda.', 'Hello. Please introduce yourself.', 'Sebutkan nama dan satu hal yang Anda sukai.', 'Share your name and one thing you like.'),
  (2, 'job-interview', 'Job interview', '취업 면접', 1, '왜 이 회사에서 일하고 싶어요?', 'Mengapa Anda ingin bekerja di perusahaan ini?', 'Why do you want to work at this company?', 'Jawab dengan satu alasan yang jelas.', 'Give one clear reason.'),
  (3, 'daily-conversation', 'Daily conversation', '일상 대화', 2, '오늘 무엇을 했어요?', 'Apa yang Anda lakukan hari ini?', 'What did you do today?', 'Jawab dengan dua atau tiga kalimat dan gunakan bentuk lampau.', 'Answer in two or three sentences using the past tense.');
