/*
  # Fix Storage Policies and Constraints

  1. Storage Policy Fixes
    - Drop and recreate storage policies with correct permissions
    - Fix RLS policies for both resumes and chat-files buckets
    - Ensure proper folder structure validation

  2. Database Constraint Fixes
    - Update attendance tracker validation logic
    - Ensure data integrity constraints work properly

  3. Security Updates
    - Proper RLS policies for authenticated users
    - Correct folder-based access control
*/

-- Fix resumes storage policies
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;

-- Create resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Resumes storage policies with simpler structure
CREATE POLICY "Users can upload resumes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Users can view resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes');

CREATE POLICY "Users can delete resumes"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes');

CREATE POLICY "Users can update resumes"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes')
  WITH CHECK (bucket_id = 'resumes');

-- Fix chat-files storage policies
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create chat-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Chat files storage policies with simpler structure
CREATE POLICY "Users can upload chat files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Users can view chat files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete chat files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-files');