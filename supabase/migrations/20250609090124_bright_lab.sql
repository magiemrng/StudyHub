/*
  # Complete Student Tools Database Schema

  1. New Tables
    - `courses` - For GPA calculator (course name, credits, grade)
    - `subjects` - For attendance tracker (subject name, total/attended classes, required percentage)
    - `assignments` - For grade manager (assignment details, grades, weights)
    - `study_sessions` - For study timer (session tracking, subjects, duration)
    - `events` - For schedule planner (events, deadlines, calendar items)
    - `newsletter_subscribers` - For newsletter subscriptions (already exists)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow anonymous users to subscribe to newsletter

  3. Features
    - UUID primary keys with auto-generation
    - Timestamps for creation tracking
    - Foreign key relationships to auth.users
    - Proper indexing for performance
*/

-- Courses table for GPA Calculator
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  credits integer NOT NULL DEFAULT 3,
  grade text NOT NULL DEFAULT 'A',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subjects table for Attendance Tracker
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  total_classes integer NOT NULL DEFAULT 0,
  attended_classes integer NOT NULL DEFAULT 0,
  required_percentage integer NOT NULL DEFAULT 75,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assignments table for Grade Manager
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  grade numeric NOT NULL DEFAULT 0,
  max_grade numeric NOT NULL DEFAULT 100,
  weight numeric NOT NULL DEFAULT 20,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assignments"
  ON assignments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Study Sessions table for Study Timer
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  duration integer NOT NULL DEFAULT 25,
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study sessions"
  ON study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events table for Schedule Planner
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '10:00',
  location text DEFAULT '',
  type text NOT NULL DEFAULT 'class' CHECK (type IN ('class', 'exam', 'assignment', 'study')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Newsletter subscribers table (update existing if needed)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Update newsletter policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can check subscription status" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can check subscription status"
  ON newsletter_subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Add constraints for data integrity
ALTER TABLE subjects ADD CONSTRAINT check_attended_not_greater_than_total 
  CHECK (attended_classes <= total_classes);

ALTER TABLE subjects ADD CONSTRAINT check_positive_classes 
  CHECK (total_classes >= 0 AND attended_classes >= 0);

ALTER TABLE assignments ADD CONSTRAINT check_positive_grades 
  CHECK (grade >= 0 AND max_grade > 0);

ALTER TABLE assignments ADD CONSTRAINT check_grade_not_greater_than_max 
  CHECK (grade <= max_grade);

ALTER TABLE study_sessions ADD CONSTRAINT check_positive_duration 
  CHECK (duration > 0);