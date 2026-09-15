import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type APSubject = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  resource_count: number;
  created_at: string;
};

export type Resource = {
  id: string;
  subject_id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  file_url: string | null;
  external_url: string | null;
  upvotes: number;
  is_featured: boolean;
  created_at: string;
};

export type Submission = {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description: string;
  type: string;
  file_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  moderator_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  volunteer_hours: number;
  created_at: string;
};

export type PracticeQuestion = {
  id: string;
  subject_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  school_name: string | null;
  grade_level: string | null;
  is_moderator: boolean;
  total_points: number;
  volunteer_hours: number;
  created_at: string;
  updated_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  subject_id: string;
  resources_viewed: number;
  questions_answered: number;
  questions_correct: number;
  study_time_minutes: number;
  last_accessed: string;
};

export type Contribution = {
  id: string;
  user_id: string;
  action_type: string;
  points: number;
  subject_id: string | null;
  resource_id: string | null;
  created_at: string;
};
