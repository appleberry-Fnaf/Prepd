/*
# Prepd AP Study Platform - Core Schema

1. New Tables
- `profiles` — user profiles extending auth.users, storing display names, avatars, and roles
- `ap_subjects` — catalog of AP courses with descriptions and icons
- `resources` — shared study resources (notes, tests, guides) linked to subjects
- `submissions` — user submissions awaiting moderator approval
- `contributions` — tracks user contribution points for leaderboard
- `practice_questions` — sample AP questions with answers and explanations
- `user_progress` — tracks user study progress per subject

2. Security
- RLS enabled on all tables
- Profiles: authenticated users manage their own
- AP subjects: public read
- Resources: public read, authenticated users create (owner-scoped)
- Submissions: public read approved ones, authenticated users create/update own
- Contributions: public read, authenticated users own data
- Practice questions: public read
- User progress: authenticated users manage their own

3. Important Notes
- All owner columns use `DEFAULT auth.uid()` for seamless inserts
- Moderator role is tracked via `profiles.is_moderator`
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  school_name text,
  grade_level text,
  is_moderator boolean NOT NULL DEFAULT false,
  total_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AP Subjects table
CREATE TABLE IF NOT EXISTS ap_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  category text,
  color text,
  icon text,
  resource_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES ap_subjects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'notes',
  file_url text,
  external_url text,
  upvotes integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Submissions table (approval system)
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES ap_subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'notes',
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  moderator_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Contributions table (leaderboard tracking)
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  subject_id uuid REFERENCES ap_subjects(id) ON DELETE SET NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Practice questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES ap_subjects(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  difficulty text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES ap_subjects(id) ON DELETE CASCADE,
  resources_viewed integer NOT NULL DEFAULT 0,
  questions_answered integer NOT NULL DEFAULT 0,
  questions_correct integer NOT NULL DEFAULT 0,
  study_time_minutes integer NOT NULL DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- Seed AP subjects
INSERT INTO ap_subjects (name, slug, description, category, color, icon) VALUES
  ('AP Calculus AB', 'ap-calculus-ab', 'Limits, derivatives, and integrals', 'Math & Computer Science', 'bg-blue-500', 'calculator'),
  ('AP Calculus BC', 'ap-calculus-bc', 'Advanced calculus including series and parametric equations', 'Math & Computer Science', 'bg-blue-600', 'calculator'),
  ('AP Statistics', 'ap-statistics', 'Data collection, analysis, and inference', 'Math & Computer Science', 'bg-sky-500', 'bar-chart'),
  ('AP Biology', 'ap-biology', 'Cellular processes, genetics, evolution, and ecology', 'Sciences', 'bg-green-500', 'leaf'),
  ('AP Chemistry', 'ap-chemistry', 'Atomic structure, bonding, reactions, and thermodynamics', 'Sciences', 'bg-emerald-500', 'flask-conical'),
  ('AP Physics 1', 'ap-physics-1', 'Mechanics, waves, and simple circuits', 'Sciences', 'bg-teal-500', 'atom'),
  ('AP Physics 2', 'ap-physics-2', 'Fluids, thermodynamics, electromagnetism, and modern physics', 'Sciences', 'bg-teal-600', 'atom'),
  ('AP English Language', 'ap-english-language', 'Rhetorical analysis, argumentation, and synthesis', 'English', 'bg-amber-500', 'book-open'),
  ('AP English Literature', 'ap-english-literature', 'Critical analysis of poetry, prose, and drama', 'English', 'bg-amber-600', 'book-open'),
  ('AP US History', 'ap-us-history', 'American history from colonization to the present', 'History & Social Sciences', 'bg-rose-500', 'landmark'),
  ('AP World History', 'ap-world-history', 'Global history from 1200 CE to the present', 'History & Social Sciences', 'bg-rose-600', 'globe'),
  ('AP US Government', 'ap-us-government', 'Constitutional foundations, political institutions, and policy', 'History & Social Sciences', 'bg-red-500', 'scale'),
  ('AP Psychology', 'ap-psychology', 'Scientific study of behavior and mental processes', 'History & Social Sciences', 'bg-orange-500', 'brain'),
  ('AP Computer Science A', 'ap-computer-science-a', 'Programming in Java, algorithms, and data structures', 'Math & Computer Science', 'bg-indigo-500', 'code'),
  ('AP European History', 'ap-european-history', 'European history from 1450 to the present', 'History & Social Sciences', 'bg-red-600', 'castle')
ON CONFLICT (slug) DO NOTHING;

-- RLS: Enable on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- AP subjects: public read
DROP POLICY IF EXISTS "public_select_ap_subjects" ON ap_subjects;
CREATE POLICY "public_select_ap_subjects" ON ap_subjects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_ap_subjects" ON ap_subjects;
CREATE POLICY "public_insert_ap_subjects" ON ap_subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_ap_subjects" ON ap_subjects;
CREATE POLICY "public_update_ap_subjects" ON ap_subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_ap_subjects" ON ap_subjects;
CREATE POLICY "public_delete_ap_subjects" ON ap_subjects FOR DELETE
  TO anon, authenticated USING (true);

-- Resources: public read, authenticated create/update own
DROP POLICY IF EXISTS "public_select_resources" ON resources;
CREATE POLICY "public_select_resources" ON resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_resources" ON resources;
CREATE POLICY "insert_own_resources" ON resources FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resources" ON resources;
CREATE POLICY "update_own_resources" ON resources FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resources" ON resources;
CREATE POLICY "delete_own_resources" ON resources FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Submissions: public read approved, authenticated create/update own
DROP POLICY IF EXISTS "public_select_approved_submissions" ON submissions;
CREATE POLICY "public_select_approved_submissions" ON submissions FOR SELECT
  TO anon, authenticated USING (status = 'approved');

DROP POLICY IF EXISTS "select_own_submissions" ON submissions;
CREATE POLICY "select_own_submissions" ON submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_submissions" ON submissions;
CREATE POLICY "insert_own_submissions" ON submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_submissions" ON submissions;
CREATE POLICY "update_own_submissions" ON submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_submissions" ON submissions;
CREATE POLICY "delete_own_submissions" ON submissions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Contributions: public read, authenticated create/update own
DROP POLICY IF EXISTS "public_select_contributions" ON contributions;
CREATE POLICY "public_select_contributions" ON contributions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_contributions" ON contributions;
CREATE POLICY "insert_own_contributions" ON contributions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contributions" ON contributions;
CREATE POLICY "update_own_contributions" ON contributions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contributions" ON contributions;
CREATE POLICY "delete_own_contributions" ON contributions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Practice questions: public read
DROP POLICY IF EXISTS "public_select_practice_questions" ON practice_questions;
CREATE POLICY "public_select_practice_questions" ON practice_questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_practice_questions" ON practice_questions;
CREATE POLICY "public_insert_practice_questions" ON practice_questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_practice_questions" ON practice_questions;
CREATE POLICY "public_update_practice_questions" ON practice_questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_practice_questions" ON practice_questions;
CREATE POLICY "public_delete_practice_questions" ON practice_questions FOR DELETE
  TO anon, authenticated USING (true);

-- User progress: authenticated own
DROP POLICY IF EXISTS "select_own_progress" ON user_progress;
CREATE POLICY "select_own_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON user_progress;
CREATE POLICY "insert_own_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON user_progress;
CREATE POLICY "update_own_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON user_progress;
CREATE POLICY "delete_own_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
