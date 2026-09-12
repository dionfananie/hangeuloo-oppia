PRAGMA foreign_keys = ON;

CREATE TABLE curriculum_versions (
  id TEXT PRIMARY KEY,
  version_key TEXT NOT NULL UNIQUE,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_curriculum_versions_single_active ON curriculum_versions(status) WHERE status = 'active';

CREATE TABLE lesson_experience_assignments (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('legacy', 'learning_path')),
  curriculum_version_id TEXT REFERENCES curriculum_versions(id) ON DELETE SET NULL,
  selected_branch_id TEXT,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  branch_selected_at TEXT
);

CREATE TABLE curriculum_branches (
  id TEXT PRIMARY KEY,
  curriculum_version_id TEXT NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  branch_key TEXT NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  availability TEXT NOT NULL CHECK (availability IN ('available', 'coming_soon')),
  display_order INTEGER NOT NULL,
  UNIQUE (curriculum_version_id, branch_key)
);

CREATE TABLE curriculum_milestones (
  id TEXT PRIMARY KEY,
  curriculum_version_id TEXT NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  milestone_order INTEGER NOT NULL,
  UNIQUE (curriculum_version_id, milestone_key)
);

CREATE TABLE curriculum_nodes (
  id TEXT PRIMARY KEY,
  curriculum_version_id TEXT NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('lesson', 'check', 'practice', 'branch_choice', 'remediation')),
  lesson_role TEXT CHECK (lesson_role IN ('core', 'remediation')),
  milestone_id TEXT REFERENCES curriculum_milestones(id) ON DELETE SET NULL,
  branch_id TEXT REFERENCES curriculum_branches(id) ON DELETE SET NULL,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 5 CHECK (estimated_minutes > 0),
  xp_reward INTEGER NOT NULL DEFAULT 20 CHECK (xp_reward >= 0),
  display_order INTEGER NOT NULL,
  UNIQUE (curriculum_version_id, node_key)
);

CREATE TABLE curriculum_prerequisites (
  node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  prerequisite_node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  required_outcome TEXT NOT NULL CHECK (required_outcome IN ('completed', 'passed', 'failed', 'branch_selected')),
  PRIMARY KEY (node_id, prerequisite_node_id)
);

CREATE TABLE curriculum_node_items (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('character', 'word', 'sentence')),
  korean_text TEXT NOT NULL,
  romanization TEXT NOT NULL,
  translation_id TEXT NOT NULL,
  translation_en TEXT NOT NULL,
  pronunciation_id TEXT NOT NULL,
  pronunciation_en TEXT NOT NULL,
  explanation_id TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  example_ko TEXT NOT NULL,
  example_id TEXT NOT NULL,
  example_en TEXT NOT NULL,
  audio_url TEXT,
  vocabulary_id INTEGER REFERENCES vocabulary_items(id) ON DELETE SET NULL,
  item_order INTEGER NOT NULL,
  UNIQUE (node_id, item_order)
);

CREATE TABLE user_curriculum_node_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_item_index INTEGER NOT NULL DEFAULT 0 CHECK (current_item_index >= 0),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  last_accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, node_id)
);

CREATE TABLE curriculum_check_items (
  id TEXT PRIMARY KEY,
  check_node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  choices TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation_id TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  item_order INTEGER NOT NULL,
  UNIQUE (check_node_id, item_order)
);

CREATE TABLE user_curriculum_check_attempts (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  submitted_answers TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_check_attempts_idempotency ON user_curriculum_check_attempts(user_id, check_node_id, idempotency_key);

CREATE TABLE curriculum_practice_items (
  id TEXT PRIMARY KEY,
  practice_node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  exercise_kind TEXT NOT NULL CHECK (exercise_kind IN ('vocabulary', 'sentence', 'listening')),
  source_type TEXT NOT NULL CHECK (source_type IN ('node_item', 'vocabulary', 'sentence_exercise', 'listening_exercise')),
  source_ref TEXT NOT NULL,
  item_order INTEGER NOT NULL,
  UNIQUE (practice_node_id, item_order),
  CHECK (
    (source_type = 'node_item' AND 1 = 1)
    OR (source_type = 'vocabulary' AND 1 = 1)
    OR (source_type = 'sentence_exercise' AND 1 = 1)
    OR (source_type = 'listening_exercise' AND 1 = 1)
  )
);

CREATE TABLE user_curriculum_practice_attempts (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_node_id TEXT NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  submitted_answers TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_practice_attempts_idempotency ON user_curriculum_practice_attempts(user_id, practice_node_id, idempotency_key);

CREATE TABLE learning_activity_ledger (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  xp INTEGER NOT NULL CHECK (xp >= 0),
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  activity_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, source_type, source_id)
);

CREATE TRIGGER trg_activity_ledger_daily AFTER INSERT ON learning_activity_ledger
BEGIN
  INSERT INTO daily_progress (user_id, activity_date, xp, activities_completed, correct_answers, total_answers)
  VALUES (NEW.user_id, NEW.activity_date, NEW.xp, 1, NEW.correct_count, NEW.total_count)
  ON CONFLICT(user_id, activity_date) DO UPDATE SET
    xp = xp + excluded.xp,
    activities_completed = activities_completed + 1,
    correct_answers = correct_answers + excluded.correct_answers,
    total_answers = total_answers + excluded.total_answers;
END;

CREATE TABLE learning_path_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  curriculum_version_id TEXT REFERENCES curriculum_versions(id) ON DELETE SET NULL,
  node_id TEXT REFERENCES curriculum_nodes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_value TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nodes_version ON curriculum_nodes(curriculum_version_id, display_order);
CREATE INDEX idx_nodes_milestone ON curriculum_nodes(milestone_id, display_order);
CREATE INDEX idx_nodes_branch ON curriculum_nodes(branch_id, display_order);
CREATE INDEX idx_prereq_prereq ON curriculum_prerequisites(prerequisite_node_id);
CREATE INDEX idx_node_items_node_order ON curriculum_node_items(node_id, item_order);
CREATE INDEX idx_check_items_node_order ON curriculum_check_items(check_node_id, item_order);
CREATE INDEX idx_practice_items_node_order ON curriculum_practice_items(practice_node_id, item_order);
CREATE INDEX idx_node_progress_user ON user_curriculum_node_progress(user_id, status);
CREATE INDEX idx_activity_ledger_user_date ON learning_activity_ledger(user_id, activity_date);
CREATE INDEX idx_learning_path_events_user_date ON learning_path_events(user_id, created_at);

INSERT INTO lesson_experience_assignments (user_id, variant)
SELECT lp.user_id, 'legacy' FROM learning_profiles lp
WHERE NOT EXISTS (
  SELECT 1 FROM lesson_experience_assignments a WHERE a.user_id = lp.user_id
);
